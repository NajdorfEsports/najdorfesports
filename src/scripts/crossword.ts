/**
 * Daily mini crossword engine. Loaded only on /games/crossword/ (all
 * locales) as a processed module; the page shell and every label are
 * server-rendered by CrosswordPageBody.astro, this module only fetches
 * the date-keyed puzzle JSON, builds the grid + clue lists, and wires
 * input, check/reveal, stats, the rollover countdown, and sharing.
 *
 * Storage: localStorage under the games exception to the zero-storage
 * policy (owner approval 2026-06-11; OWdle shares the same exception,
 * see src/scripts/owdle.ts). Stats live only on the player's device and
 * never leave it; every access is wrapped so a blocked storage API
 * (private browsing) degrades to in-memory.
 */
import type { Difficulty, Puzzle, PuzzleSlot } from '../data/crossword/types';

interface L10n {
  loadError: string;
  noPuzzle: string;
  shareCopied: string;
  shareLabel: string;
  completeBody: string;
  completeAssisted: string;
  ariaGrid: string;
}

interface TierStats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string | null;
  lastWonDate: string | null;
  bestTimeSeconds: number | null;
  history: Array<{ date: string; timeSeconds: number; assisted: boolean }>;
}

interface StoredState {
  version: 1;
  lastDifficulty: Difficulty;
  tiers: Record<Difficulty, TierStats>;
}

const STORAGE_KEY = 'najdorf:crossword:v1';
const NY_TZ = 'America/New_York';

function emptyTier(): TierStats {
  return {
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedDate: null,
    lastWonDate: null,
    bestTimeSeconds: null,
    history: [],
  };
}

function emptyState(): StoredState {
  return {
    version: 1,
    lastDifficulty: 'easy',
    tiers: { easy: emptyTier(), medium: emptyTier(), hard: emptyTier() },
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
        if (parsed && parsed.version === 1 && parsed.tiers) return parsed;
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

/** Seconds remaining until the next New York midnight (DST-correct: it is
 *  derived from the formatted NY wall clock, not from a fixed offset). */
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

function yesterdayOf(isoDate: string): string {
  const [y, mo, d] = isoDate.split('-').map(Number);
  const t = Date.UTC(y!, mo! - 1, d!) - 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

function init(): void {
  const appEl = document.getElementById('crossword-app');
  if (!appEl) return;
  const app: HTMLElement = appEl;
  const l10n = JSON.parse(app.dataset.l10n ?? '{}') as L10n;
  const puzzleBase = app.dataset.puzzleBase ?? '/games/crossword/puzzles/';

  const $ = <T extends HTMLElement>(sel: string): T => {
    const el = app.querySelector<T>(sel);
    if (!el) throw new Error(`crossword: missing ${sel}`);
    return el;
  };
  const fallback = $('[data-xw-fallback]');
  const ui = $('[data-xw-ui]');
  const gridEl = $('[data-xw-grid]');
  const activeClueEl = $('[data-xw-active-clue]');
  const timerEl = $('[data-xw-timer]');
  const countdownEl = $('[data-xw-countdown]');
  const completeEl = $('[data-xw-complete]');
  const completeBodyEl = $('[data-xw-complete-body]');
  const shareBtn = $('[data-xw-share]');
  const acrossList = $('[data-xw-clues="across"]');
  const downList = $('[data-xw-clues="down"]');
  const tabs = [...app.querySelectorAll<HTMLButtonElement>('[data-difficulty]')];

  // ---- state ---------------------------------------------------------
  let store = storage.load();
  let difficulty: Difficulty = store.lastDifficulty;
  let today = nyDate();
  let puzzle: Puzzle | null = null;
  let solution: string[] = [];
  let letters: string[][] = [];
  let cellEls: Array<Array<HTMLElement | null>> = [];
  let active: { r: number; c: number } | null = null;
  let direction: 'across' | 'down' = 'across';
  let assisted = new Set<string>(); // cells revealed or once marked wrong
  let started = false;
  let completed = false;
  let seconds = 0;

  const key = (r: number, c: number) => `${r},${c}`;
  const isWhite = (r: number, c: number) =>
    r >= 0 &&
    c >= 0 &&
    puzzle !== null &&
    r < puzzle.size &&
    c < puzzle.size &&
    solution[r]![c] !== '#';

  const slotsThrough = (r: number, c: number): PuzzleSlot[] =>
    (puzzle?.entries ?? []).filter((e) => {
      if (e.dir === 'across') return e.row === r && c >= e.col && c < e.col + e.answer.length;
      return e.col === c && r >= e.row && r < e.row + e.answer.length;
    });
  const slotAt = (r: number, c: number, dir: 'across' | 'down'): PuzzleSlot | undefined =>
    slotsThrough(r, c).find((e) => e.dir === dir);
  const cellsOf = (slot: PuzzleSlot): Array<[number, number]> =>
    [...slot.answer].map((_, i) =>
      slot.dir === 'across' ? [slot.row, slot.col + i] : [slot.row + i, slot.col],
    );

  // ---- stats ---------------------------------------------------------
  const statEls = [...app.querySelectorAll<HTMLElement>('[data-stat]')];
  function renderStats(): void {
    const t = store.tiers[difficulty];
    for (const el of statEls) {
      const k = el.dataset.stat!;
      if (k === 'bestTime') {
        el.textContent = t.bestTimeSeconds === null ? '-' : formatClock(t.bestTimeSeconds);
      } else {
        el.textContent = String(t[k as 'played' | 'won' | 'currentStreak' | 'maxStreak']);
      }
    }
  }
  function markPlayed(): void {
    const t = store.tiers[difficulty];
    if (t.lastPlayedDate !== today) {
      t.played += 1;
      t.lastPlayedDate = today;
      storage.save(store);
      renderStats();
    }
  }
  function markWon(): void {
    const t = store.tiers[difficulty];
    if (t.lastWonDate === today) return;
    t.won += 1;
    t.currentStreak = t.lastWonDate === yesterdayOf(today) ? t.currentStreak + 1 : 1;
    t.maxStreak = Math.max(t.maxStreak, t.currentStreak);
    t.lastWonDate = today;
    if (t.bestTimeSeconds === null || seconds < t.bestTimeSeconds) t.bestTimeSeconds = seconds;
    t.history.push({ date: today, timeSeconds: seconds, assisted: assisted.size > 0 });
    if (t.history.length > 30) t.history = t.history.slice(-30);
    storage.save(store);
    renderStats();
  }

  // ---- rendering -----------------------------------------------------
  function buildBoard(p: Puzzle): void {
    puzzle = p;
    solution = p.grid;
    letters = p.grid.map((row) => [...row].map(() => ''));
    cellEls = p.grid.map((row) => [...row].map(() => null));
    assisted = new Set();
    started = false;
    completed = false;
    seconds = 0;
    timerEl.textContent = '0:00';
    completeEl.hidden = true;
    shareBtn.hidden = true;
    gridEl.classList.remove('is-complete');
    gridEl.style.setProperty('--xw-size', String(p.size));
    gridEl.replaceChildren();
    acrossList.replaceChildren();
    downList.replaceChildren();

    const numbers = new Map<string, number>();
    for (const e of p.entries) numbers.set(key(e.row, e.col), e.number);

    let cellIndex = 0;
    for (let r = 0; r < p.size; r += 1) {
      const rowEl = document.createElement('div');
      rowEl.setAttribute('role', 'row');
      rowEl.style.display = 'contents';
      for (let c = 0; c < p.size; c += 1) {
        const cell = document.createElement('div');
        cell.setAttribute('role', 'gridcell');
        if (solution[r]![c] === '#') {
          cell.className = 'xw-cell xw-block';
          cell.setAttribute('aria-hidden', 'true');
        } else {
          cell.className = 'xw-cell';
          cell.tabIndex = -1;
          cell.dataset.r = String(r);
          cell.dataset.c = String(c);
          cell.style.setProperty('--xw-i', String(cellIndex));
          cellIndex += 1;
          const num = numbers.get(key(r, c));
          if (num !== undefined) {
            const numEl = document.createElement('span');
            numEl.className = 'xw-num';
            numEl.setAttribute('aria-hidden', 'true');
            numEl.textContent = String(num);
            cell.append(numEl);
          }
          const letterEl = document.createElement('span');
          letterEl.dataset.letter = '';
          cell.append(letterEl);
          cellEls[r]![c] = cell;
        }
        rowEl.append(cell);
      }
      gridEl.append(rowEl);
    }

    for (const e of p.entries) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'xw-clue';
      btn.dataset.number = String(e.number);
      btn.dataset.dir = e.dir;
      const num = document.createElement('span');
      num.className = 'xw-clue-num';
      num.textContent = String(e.number);
      const text = document.createElement('span');
      text.textContent = e.clue;
      btn.append(num, text);
      btn.addEventListener('click', () => {
        direction = e.dir;
        setActive(e.row, e.col, true);
      });
      li.append(btn);
      (e.dir === 'across' ? acrossList : downList).append(li);
    }

    const first = p.entries.find((e) => e.dir === 'across') ?? p.entries[0]!;
    direction = first.dir;
    setActive(first.row, first.col, false);

    fallback.hidden = true;
    ui.hidden = false;
  }

  function activeSlot(): PuzzleSlot | undefined {
    if (!active) return undefined;
    return slotAt(active.r, active.c, direction) ?? slotsThrough(active.r, active.c)[0];
  }

  function paint(): void {
    if (!puzzle || !active) return;
    const slot = activeSlot();
    const inWord = new Set((slot ? cellsOf(slot) : []).map(([r, c]) => key(r, c)));
    for (let r = 0; r < puzzle.size; r += 1) {
      for (let c = 0; c < puzzle.size; c += 1) {
        const el = cellEls[r]![c];
        if (!el) continue;
        el.classList.toggle('is-word', inWord.has(key(r, c)));
        el.classList.toggle('is-active', active.r === r && active.c === c);
        el.tabIndex = active.r === r && active.c === c ? 0 : -1;
      }
    }
    for (const btn of app.querySelectorAll<HTMLElement>('.xw-clue')) {
      btn.classList.toggle(
        'is-active',
        slot !== undefined &&
          btn.dataset.number === String(slot.number) &&
          btn.dataset.dir === slot.dir,
      );
    }
    if (slot) {
      activeClueEl.textContent = `${slot.number} ${slot.dir === 'across' ? '→' : '↓'} ${slot.clue}`;
    }
  }

  function setActive(r: number, c: number, focus: boolean): void {
    if (!isWhite(r, c)) return;
    // Pick a direction that actually has a word through this cell.
    if (!slotAt(r, c, direction)) {
      const other = direction === 'across' ? 'down' : 'across';
      if (slotAt(r, c, other)) direction = other;
    }
    active = { r, c };
    paint();
    if (focus) cellEls[r]?.[c]?.focus({ preventScroll: true });
  }

  function setLetter(r: number, c: number, letter: string): void {
    letters[r]![c] = letter;
    const el = cellEls[r]?.[c];
    if (el) {
      el.querySelector<HTMLElement>('[data-letter]')!.textContent = letter;
      el.classList.remove('is-wrong');
    }
  }

  function updateSolvedClues(): void {
    if (!puzzle) return;
    for (const e of puzzle.entries) {
      const solved = cellsOf(e).every(([r, c]) => letters[r]![c] === solution[r]![c]);
      const btn = app.querySelector<HTMLElement>(
        `.xw-clue[data-number="${e.number}"][data-dir="${e.dir}"]`,
      );
      btn?.classList.toggle('is-solved', solved);
    }
  }

  function checkComplete(): void {
    if (!puzzle || completed) return;
    for (let r = 0; r < puzzle.size; r += 1) {
      for (let c = 0; c < puzzle.size; c += 1) {
        if (solution[r]![c] !== '#' && letters[r]![c] !== solution[r]![c]) return;
      }
    }
    completed = true;
    gridEl.classList.add('is-complete');
    completeBodyEl.textContent =
      (assisted.size > 0 ? l10n.completeAssisted + ' ' : '') +
      l10n.completeBody.replace('{time}', formatClock(seconds));
    completeEl.hidden = false;
    shareBtn.hidden = false;
    markWon();
  }

  // ---- input ---------------------------------------------------------
  function advance(step: 1 | -1): void {
    if (!active) return;
    const slot = activeSlot();
    if (!slot) return;
    const cells = cellsOf(slot);
    const idx = cells.findIndex(([r, c]) => r === active!.r && c === active!.c);
    const next = cells[idx + step];
    if (next) setActive(next[0], next[1], true);
  }

  function move(dr: number, dc: number): void {
    if (!active || !puzzle) return;
    let { r, c } = active;
    for (let i = 0; i < puzzle.size; i += 1) {
      r += dr;
      c += dc;
      if (r < 0 || c < 0 || r >= puzzle.size || c >= puzzle.size) return;
      if (isWhite(r, c)) {
        setActive(r, c, true);
        return;
      }
    }
  }

  function inputLetter(letter: string): void {
    if (!active || completed) return;
    if (!started) {
      started = true;
      markPlayed();
    }
    setLetter(active.r, active.c, letter);
    updateSolvedClues();
    checkComplete();
    if (!completed) advance(1);
  }

  function backspace(): void {
    if (!active || completed) return;
    if (letters[active.r]![active.c]) {
      setLetter(active.r, active.c, '');
    } else {
      advance(-1);
      if (active) setLetter(active.r, active.c, '');
    }
    updateSolvedClues();
  }

  function stepClue(offset: 1 | -1): void {
    if (!puzzle) return;
    const ordered = [...puzzle.entries].sort((a, b) =>
      a.dir === b.dir ? a.number - b.number : a.dir === 'across' ? -1 : 1,
    );
    const current = activeSlot();
    const idx = current
      ? ordered.findIndex((e) => e.number === current.number && e.dir === current.dir)
      : -1;
    const next = ordered[(idx + offset + ordered.length) % ordered.length]!;
    direction = next.dir;
    setActive(next.row, next.col, true);
  }

  gridEl.addEventListener('click', (ev) => {
    const cell = (ev.target as HTMLElement).closest<HTMLElement>('.xw-cell:not(.xw-block)');
    if (!cell) return;
    const r = Number(cell.dataset.r);
    const c = Number(cell.dataset.c);
    if (active && active.r === r && active.c === c) {
      direction = direction === 'across' ? 'down' : 'across';
    }
    setActive(r, c, true);
  });

  gridEl.addEventListener('keydown', (ev) => {
    const k = ev.key;
    if (/^[a-zA-Z]$/.test(k)) {
      ev.preventDefault();
      inputLetter(k.toUpperCase());
    } else if (k === 'Backspace' || k === 'Delete') {
      ev.preventDefault();
      backspace();
    } else if (k === 'ArrowUp') {
      ev.preventDefault();
      move(-1, 0);
    } else if (k === 'ArrowDown') {
      ev.preventDefault();
      move(1, 0);
    } else if (k === 'ArrowLeft') {
      ev.preventDefault();
      move(0, -1);
    } else if (k === 'ArrowRight') {
      ev.preventDefault();
      move(0, 1);
    } else if (k === 'Enter' || k === ' ') {
      ev.preventDefault();
      direction = direction === 'across' ? 'down' : 'across';
      paint();
    } else if (k === 'Tab') {
      ev.preventDefault();
      stepClue(ev.shiftKey ? -1 : 1);
    }
  });

  app.querySelector('[data-xw-keyboard]')!.addEventListener('click', (ev) => {
    const btn = (ev.target as HTMLElement).closest<HTMLElement>('[data-key]');
    if (!btn) return;
    if (btn.dataset.key === 'backspace') backspace();
    else inputLetter(btn.dataset.key!);
    // Keep focus on the grid so physical keyboards keep working too.
    if (active) cellEls[active.r]?.[active.c]?.focus({ preventScroll: true });
  });

  // ---- check / reveal / clear / share --------------------------------
  function closeMenus(): void {
    for (const menu of app.querySelectorAll<HTMLDetailsElement>('[data-xw-menu]')) {
      menu.open = false;
    }
  }

  function checkCells(cells: Array<[number, number]>): void {
    for (const [r, c] of cells) {
      if (!letters[r]![c]) continue;
      if (letters[r]![c] !== solution[r]![c]) {
        cellEls[r]?.[c]?.classList.add('is-wrong');
        assisted.add(key(r, c));
      }
    }
  }

  function revealCells(cells: Array<[number, number]>): void {
    if (!started) {
      started = true;
      markPlayed();
    }
    for (const [r, c] of cells) {
      if (letters[r]![c] !== solution[r]![c]) {
        assisted.add(key(r, c));
        setLetter(r, c, solution[r]![c]!);
        cellEls[r]?.[c]?.classList.add('is-revealed');
      }
    }
    updateSolvedClues();
    checkComplete();
  }

  function allWhiteCells(): Array<[number, number]> {
    const out: Array<[number, number]> = [];
    if (!puzzle) return out;
    for (let r = 0; r < puzzle.size; r += 1) {
      for (let c = 0; c < puzzle.size; c += 1) {
        if (solution[r]![c] !== '#') out.push([r, c]);
      }
    }
    return out;
  }

  app.addEventListener('click', (ev) => {
    const btn = (ev.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!btn || !puzzle) return;
    const slot = activeSlot();
    const action = btn.dataset.action!;
    if (action === 'check-letter' && active) checkCells([[active.r, active.c]]);
    else if (action === 'check-word' && slot) checkCells(cellsOf(slot));
    else if (action === 'check-puzzle') checkCells(allWhiteCells());
    else if (action === 'reveal-letter' && active) revealCells([[active.r, active.c]]);
    else if (action === 'reveal-word' && slot) revealCells(cellsOf(slot));
    else if (action === 'reveal-puzzle') revealCells(allWhiteCells());
    else if (action === 'clear') {
      for (const [r, c] of allWhiteCells()) {
        setLetter(r, c, '');
        cellEls[r]?.[c]?.classList.remove('is-revealed');
      }
      assisted = new Set();
      updateSolvedClues();
    } else if (action === 'share') {
      share();
      return;
    }
    closeMenus();
  });

  function share(): void {
    if (!puzzle) return;
    const label =
      tabs.find((t) => t.dataset.difficulty === difficulty)?.dataset.label ?? difficulty;
    const rows = puzzle.grid
      .map((row, r) =>
        [...row]
          .map((ch, c) => (ch === '#' ? '⬛' : assisted.has(key(r, c)) ? '🟨' : '🟦'))
          .join(''),
      )
      .join('\n');
    const text = `Najdorf Mini Crossword · ${puzzle.date} · ${label} · ${formatClock(seconds)}\n${rows}\n${window.location.href}`;
    const done = () => {
      const original = l10n.shareLabel;
      shareBtn.textContent = l10n.shareCopied;
      window.setTimeout(() => {
        shareBtn.textContent = original;
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

  // ---- difficulty tabs ------------------------------------------------
  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      const next = tab.dataset.difficulty as Difficulty;
      if (next === difficulty) return;
      difficulty = next;
      store.lastDifficulty = next;
      storage.save(store);
      for (const other of tabs) {
        other.setAttribute('aria-pressed', other === tab ? 'true' : 'false');
      }
      renderStats();
      void loadPuzzle();
    });
  }
  for (const tab of tabs) {
    tab.setAttribute('aria-pressed', tab.dataset.difficulty === difficulty ? 'true' : 'false');
  }

  // ---- fetch + clocks --------------------------------------------------
  async function loadPuzzle(): Promise<void> {
    today = nyDate();
    try {
      const res = await fetch(`${puzzleBase}${today}-${difficulty}.json`);
      if (!res.ok) {
        ui.hidden = true;
        fallback.textContent = l10n.noPuzzle;
        fallback.hidden = false;
        return;
      }
      buildBoard((await res.json()) as Puzzle);
    } catch {
      ui.hidden = true;
      fallback.textContent = l10n.loadError;
      fallback.hidden = false;
    }
  }

  window.setInterval(() => {
    if (started && !completed && document.visibilityState === 'visible') {
      seconds += 1;
      timerEl.textContent = formatClock(seconds);
    }
    const remaining = secondsToNyMidnight();
    countdownEl.textContent = formatClock(remaining);
    // Rollover: the NY date changed under us, fetch the fresh puzzle.
    if (nyDate() !== today) void loadPuzzle();
  }, 1000);

  renderStats();
  void loadPuzzle();
}

init();

export {};
