/**
 * OWdle engine. Loaded only on /games/owdle/ (all locales) as a processed
 * module; the page shell and every label are server-rendered by
 * OwdlePageBody.astro. The hero dataset and all game rules ship inside
 * this bundle (src/lib/owdle.ts), so the page makes zero runtime
 * requests; this module only wires input, rows, stats, the rollover
 * countdown, and sharing.
 *
 * Storage: localStorage under the games exception to the zero-storage
 * policy (owner approval 2026-06-11 for the crossword, extended to OWdle
 * 2026-06-12). Stats live only on the player's device and never leave
 * it; every access is wrapped so a blocked storage API (private
 * browsing) degrades to in-memory.
 */
import {
  HEROES,
  compareHeroes,
  dailyAnswer,
  findHero,
  playableHeroes,
  previousDate,
  puzzleNumber,
  searchHeroes,
  shareText,
  type CellResult,
  type CellState,
  type ColumnKey,
} from '../lib/owdle';
import type { OwdleHero } from '../data/owdle/types';

interface L10n {
  unknownHero: string;
  shareLabel: string;
  shareCopied: string;
  winBody: string;
  winBodyOne: string;
  stateExact: string;
  statePartial: string;
  stateMiss: string;
  dirHigher: string;
  dirLower: string;
  roleValues: Record<string, string>;
  subRoleValues: Record<string, string>;
  genderValues: Record<string, string>;
  attackValues: Record<string, string>;
  cols: Record<ColumnKey, string>;
}

interface DayState {
  date: string;
  guesses: string[];
  solved: boolean;
}

interface Stats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string | null;
  lastWonDate: string | null;
  /** Guess-count histogram: keys '1'..'7' and '8+'. */
  dist: Record<string, number>;
}

interface StoredState {
  version: 1;
  daily: DayState | null;
  stats: Stats;
}

const STORAGE_KEY = 'najdorf:owdle:v1';
const NY_TZ = 'America/New_York';
const DIST_BUCKETS = ['1', '2', '3', '4', '5', '6', '7', '8+'] as const;

function emptyState(): StoredState {
  return {
    version: 1,
    daily: null,
    stats: {
      played: 0,
      won: 0,
      currentStreak: 0,
      maxStreak: 0,
      lastPlayedDate: null,
      lastWonDate: null,
      dist: {},
    },
  };
}

/** localStorage with an in-memory fallback so private browsing still plays. */
const storage = (() => {
  let memory: StoredState | null = null;
  const load = (): StoredState => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredState;
        if (parsed && parsed.version === 1 && parsed.stats) return parsed;
      }
    } catch {
      /* storage blocked or corrupt: fall through to memory */
    }
    return memory ?? emptyState();
  };
  const save = (state: StoredState): void => {
    memory = state;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* in-memory only */
    }
  };
  return { load, save };
})();

/** Current calendar date in New York, as YYYY-MM-DD (en-CA gives ISO order). */
function nyDate(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: NY_TZ }).format(new Date());
}

/** Seconds remaining until the next New York midnight (DST-correct). */
function secondsToNyMidnight(): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: NY_TZ,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date());
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? '0') % (type === 'hour' ? 24 : 60);
  const elapsed = get('hour') * 3600 + get('minute') * 60 + get('second');
  return 86400 - elapsed;
}

function formatClock(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function init(): void {
  const appEl = document.getElementById('owdle-app');
  if (!appEl) return;
  const app: HTMLElement = appEl;
  const l10n = JSON.parse(app.dataset.l10n ?? '{}') as L10n;

  const $ = <T extends HTMLElement>(sel: string): T => {
    const el = app.querySelector<T>(sel);
    if (!el) throw new Error(`owdle: missing ${sel}`);
    return el;
  };
  const fallback = $('[data-ow-fallback]');
  const ui = $('[data-ow-ui]');
  const form = $<HTMLFormElement>('[data-ow-form]');
  const input = $<HTMLInputElement>('#ow-guess-input');
  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const suggestionsEl = $('[data-ow-suggestions]');
  const errorEl = $('[data-ow-error]');
  const board = $('[data-ow-board]');
  const boardWrap = $('[data-ow-board-wrap]');
  const fitBtn = $('[data-ow-fit]');
  const completeEl = $('[data-ow-complete]');
  const completeBodyEl = $('[data-ow-complete-body]');
  const shareBtn = $('[data-ow-share]');
  const numberEl = $('[data-ow-number]');
  const countdownEl = $('[data-ow-countdown]');
  const distEl = $('[data-ow-dist]');
  const yesterdayEl = $('[data-ow-yesterday]');
  const yesterdayNameEl = $('[data-ow-yesterday-name]');

  // ---- state ---------------------------------------------------------
  let store = storage.load();
  let today = nyDate();
  let answer: OwdleHero | null = null;
  let pool: OwdleHero[] = [];
  let guessed: OwdleHero[] = [];
  let solved = false;
  let suggestions: OwdleHero[] = [];
  let activeSuggestion = -1;

  const guessedIds = () => new Set(guessed.map((h) => h.id));

  // ---- value rendering -----------------------------------------------
  function valueText(hero: OwdleHero, column: ColumnKey): string {
    switch (column) {
      case 'role':
        return l10n.roleValues[hero.role] ?? hero.role;
      case 'subRole':
        return l10n.subRoleValues[hero.subRole] ?? hero.subRole;
      case 'gender':
        return l10n.genderValues[hero.gender] ?? hero.gender;
      case 'nationality':
        return hero.nationality;
      case 'baseHp':
        return String(hero.baseHp);
      case 'attackType':
        return hero.attackType.map((a) => l10n.attackValues[a] ?? a).join(' / ');
      case 'releaseYear':
        return String(hero.releaseYear);
    }
  }

  function glyphFor(cell: CellResult): string {
    if (cell.state === 'exact') return '✓';
    const arrow = cell.direction === 'up' ? '↑' : cell.direction === 'down' ? '↓' : '';
    if (cell.state === 'partial') return `~${arrow}`;
    return arrow || '✕';
  }

  function stateLabel(cell: CellResult): string {
    const base =
      cell.state === 'exact'
        ? l10n.stateExact
        : cell.state === 'partial'
          ? l10n.statePartial
          : l10n.stateMiss;
    const dir =
      cell.direction === 'up'
        ? `, ${l10n.dirHigher}`
        : cell.direction === 'down'
          ? `, ${l10n.dirLower}`
          : '';
    return `${base}${dir}`;
  }

  function renderGuessRow(hero: OwdleHero, results: CellResult[], animate: boolean): void {
    const row = document.createElement('div');
    row.className = 'ow-row';
    row.setAttribute('role', 'row');
    if (animate) row.classList.add('is-new');

    const nameCell = document.createElement('div');
    nameCell.className = 'ow-cell ow-name';
    nameCell.setAttribute('role', 'rowheader');
    nameCell.textContent = hero.name;
    row.append(nameCell);

    results.forEach((cell, i) => {
      const el = document.createElement('div');
      el.className = `ow-cell is-${cell.state}`;
      el.setAttribute('role', 'cell');
      el.style.setProperty('--ow-i', String(i));
      el.setAttribute(
        'aria-label',
        `${l10n.cols[cell.column]}: ${valueText(hero, cell.column)}. ${stateLabel(cell)}`,
      );
      const value = document.createElement('span');
      value.textContent = valueText(hero, cell.column);
      const glyph = document.createElement('span');
      glyph.className = 'ow-glyph';
      glyph.setAttribute('aria-hidden', 'true');
      glyph.textContent = glyphFor(cell);
      el.append(value, glyph);
      row.append(el);
    });

    // Newest guess sits directly under the header row.
    board.children[0]!.after(row);
  }

  function clearRows(): void {
    while (board.children.length > 1) board.children[1]!.remove();
  }

  // ---- stats ---------------------------------------------------------
  const statEls = [...app.querySelectorAll<HTMLElement>('[data-stat]')];
  function renderStats(): void {
    const s = store.stats;
    for (const el of statEls) {
      const k = el.dataset.stat as 'played' | 'won' | 'currentStreak' | 'maxStreak';
      el.textContent = String(s[k]);
    }
    distEl.replaceChildren();
    const max = Math.max(1, ...DIST_BUCKETS.map((b) => store.stats.dist[b] ?? 0));
    for (const bucket of DIST_BUCKETS) {
      const count = store.stats.dist[bucket] ?? 0;
      const li = document.createElement('li');
      li.className = 'ow-dist-row';
      const label = document.createElement('span');
      label.className = 'tabular-nums';
      label.textContent = bucket;
      const bar = document.createElement('span');
      bar.className = 'ow-dist-bar';
      bar.style.width = `${Math.round((count / max) * 100)}%`;
      const num = document.createElement('span');
      num.className = 'tabular-nums';
      num.textContent = String(count);
      li.append(label, bar, num);
      distEl.append(li);
    }
  }

  function persistDaily(): void {
    store.daily = { date: today, guesses: guessed.map((h) => h.id), solved };
    storage.save(store);
  }

  function markPlayed(): void {
    if (store.stats.lastPlayedDate !== today) {
      store.stats.played += 1;
      store.stats.lastPlayedDate = today;
      storage.save(store);
      renderStats();
    }
  }

  function markWon(guessCount: number): void {
    const s = store.stats;
    if (s.lastWonDate === today) return;
    s.won += 1;
    s.currentStreak = s.lastWonDate === previousDate(today) ? s.currentStreak + 1 : 1;
    s.maxStreak = Math.max(s.maxStreak, s.currentStreak);
    s.lastWonDate = today;
    const bucket = guessCount >= 8 ? '8+' : String(guessCount);
    s.dist[bucket] = (s.dist[bucket] ?? 0) + 1;
    storage.save(store);
    renderStats();
  }

  // ---- suggestions ----------------------------------------------------
  function hideSuggestions(): void {
    suggestions = [];
    activeSuggestion = -1;
    suggestionsEl.hidden = true;
    suggestionsEl.replaceChildren();
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  }

  function paintActiveSuggestion(): void {
    [...suggestionsEl.children].forEach((el, i) => {
      el.classList.toggle('is-active', i === activeSuggestion);
    });
    if (activeSuggestion >= 0) {
      input.setAttribute('aria-activedescendant', `ow-opt-${activeSuggestion}`);
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }

  function showSuggestions(): void {
    if (solved) return;
    suggestions = searchHeroes(pool, input.value, guessedIds()).slice(0, 8);
    activeSuggestion = suggestions.length > 0 ? 0 : -1;
    suggestionsEl.replaceChildren();
    if (suggestions.length === 0) {
      hideSuggestions();
      return;
    }
    suggestions.forEach((hero, i) => {
      const li = document.createElement('li');
      li.id = `ow-opt-${i}`;
      li.setAttribute('role', 'option');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ow-suggestion';
      btn.textContent = hero.name;
      btn.addEventListener('click', () => submitGuess(hero));
      li.append(btn);
      suggestionsEl.append(li);
    });
    suggestionsEl.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    paintActiveSuggestion();
  }

  input.addEventListener('input', () => {
    errorEl.textContent = '';
    showSuggestions();
  });

  input.addEventListener('keydown', (ev) => {
    if (suggestionsEl.hidden) return;
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      activeSuggestion = (activeSuggestion + 1) % suggestions.length;
      paintActiveSuggestion();
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      activeSuggestion = (activeSuggestion - 1 + suggestions.length) % suggestions.length;
      paintActiveSuggestion();
    } else if (ev.key === 'Escape') {
      hideSuggestions();
    }
  });

  document.addEventListener('click', (ev) => {
    if (!suggestionsEl.hidden && !form.contains(ev.target as Node)) hideSuggestions();
  });

  // ---- guessing --------------------------------------------------------
  function submitGuess(hero: OwdleHero): void {
    if (!answer || solved || guessedIds().has(hero.id)) return;
    guessed.push(hero);
    markPlayed();
    renderGuessRow(hero, compareHeroes(hero, answer), true);
    input.value = '';
    errorEl.textContent = '';
    hideSuggestions();
    if (hero.id === answer.id) {
      win();
    } else {
      input.focus({ preventScroll: true });
    }
    persistDaily();
  }

  function win(): void {
    if (!answer) return;
    solved = true;
    const template = guessed.length === 1 ? l10n.winBodyOne : l10n.winBody;
    completeBodyEl.textContent = template
      .replace('{hero}', answer.name)
      .replace('{count}', String(guessed.length));
    completeEl.hidden = false;
    input.disabled = true;
    submitBtn.disabled = true;
    hideSuggestions();
    markWon(guessed.length);
  }

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    if (solved) return;
    const picked =
      activeSuggestion >= 0 && suggestions[activeSuggestion]
        ? suggestions[activeSuggestion]
        : (findHero(pool, input.value) ?? suggestions[0]);
    if (picked && !guessedIds().has(picked.id)) {
      submitGuess(picked);
    } else {
      errorEl.textContent = l10n.unknownHero;
    }
  });

  // ---- share -----------------------------------------------------------
  function share(): void {
    if (!answer) return;
    const rows: CellState[][] = guessed.map((h) =>
      compareHeroes(h, answer!).map((cell) => cell.state),
    );
    const text = shareText(puzzleNumber(today), rows, window.location.href);
    const done = () => {
      shareBtn.textContent = l10n.shareCopied;
      window.setTimeout(() => {
        shareBtn.textContent = l10n.shareLabel;
      }, 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done, () => legacyCopy(text, done));
    } else {
      legacyCopy(text, done);
    }
  }

  function legacyCopy(text: string, done: () => void): void {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.append(ta);
    ta.select();
    try {
      document.execCommand('copy');
      done();
    } finally {
      ta.remove();
    }
  }

  shareBtn.addEventListener('click', share);

  // ---- fit toggle ------------------------------------------------------
  fitBtn.addEventListener('click', () => {
    const on = boardWrap.classList.toggle('is-fit');
    fitBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });

  // ---- day lifecycle ---------------------------------------------------
  function startDay(): void {
    today = nyDate();
    pool = playableHeroes(HEROES, today);
    answer = dailyAnswer(HEROES, today) ?? null;
    if (!answer) {
      // Pre-epoch or an empty pool: leave the fallback notice visible.
      ui.hidden = true;
      fallback.hidden = false;
      return;
    }
    clearRows();
    guessed = [];
    solved = false;
    input.disabled = false;
    submitBtn.disabled = false;
    input.value = '';
    errorEl.textContent = '';
    completeEl.hidden = true;
    hideSuggestions();
    numberEl.textContent = `#${puzzleNumber(today)}`;

    const y = dailyAnswer(HEROES, previousDate(today));
    yesterdayEl.hidden = !y;
    if (y) yesterdayNameEl.textContent = y.name;

    // Restore today's progress (replayed without animation).
    if (store.daily?.date === today) {
      for (const id of store.daily.guesses) {
        const hero = pool.find((h) => h.id === id);
        if (!hero) continue;
        guessed.push(hero);
        renderGuessRow(hero, compareHeroes(hero, answer), false);
      }
      if (store.daily.solved && guessed.length > 0) {
        solved = true;
        const template = guessed.length === 1 ? l10n.winBodyOne : l10n.winBody;
        completeBodyEl.textContent = template
          .replace('{hero}', answer.name)
          .replace('{count}', String(guessed.length));
        completeEl.hidden = false;
        input.disabled = true;
        submitBtn.disabled = true;
      }
    }

    renderStats();
    fallback.hidden = true;
    ui.hidden = false;
  }

  window.setInterval(() => {
    countdownEl.textContent = formatClock(secondsToNyMidnight());
    // Rollover: the NY date changed under us, start the fresh day.
    if (nyDate() !== today) {
      store = storage.load();
      startDay();
    }
  }, 1000);

  startDay();
}

init();

export {};
