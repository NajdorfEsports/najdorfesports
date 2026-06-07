import { describe, it, expect, vi } from 'vitest';
import {
  mergeByKey,
  competedAsFor,
  confirmed,
  playerSlug,
  hasDetailPage,
  displaySocials,
  communitySocials,
  sameAsUrls,
} from './site';
import { portraitPath } from './roster-portraits';

describe('mergeByKey', () => {
  type Row = { id: string; x?: number; y?: number };
  it('manual wins on collision and shallow-merges fields', () => {
    const out = mergeByKey<Row>([{ id: 'a', x: 1, y: 1 }], [{ id: 'a', y: 2 }], 'id');
    expect(out).toEqual([{ id: 'a', x: 1, y: 2 }]);
  });

  it('keeps auto-only and appends manual-only', () => {
    const out = mergeByKey<Row>([{ id: 'a' }], [{ id: 'b' }], 'id');
    expect(out).toEqual([{ id: 'a' }, { id: 'b' }]);
  });

  it('skips entries with a missing/blank key (and warns)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const out = mergeByKey<Row>([{ id: '' }, { id: 'a' }], [{ id: '  ' }], 'id');
    expect(out).toEqual([{ id: 'a' }]);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('competedAsFor', () => {
  it('tags Stage 1 events with the former roster name', () => {
    expect(competedAsFor('OWCS Pacific 2026 Stage 1')).toBe('Rankers');
    expect(competedAsFor('Stage 1 Playoffs')).toBe('Rankers');
    expect(competedAsFor('Stage 1 Regular Season')).toBe('Rankers');
  });
  it('does not tag Stage 2, Stage 10, or empty', () => {
    expect(competedAsFor('Stage 2')).toBeNull();
    expect(competedAsFor('Stage 10 Playoffs')).toBeNull();
    expect(competedAsFor(undefined)).toBeNull();
    expect(competedAsFor('')).toBeNull();
  });
});

describe('confirmed', () => {
  it('drops TODO and falsy urls', () => {
    expect(confirmed([{ url: 'https://x' }, { url: 'TODO' }, { url: '' }])).toEqual([
      { url: 'https://x' },
    ]);
  });
});

describe('playerSlug', () => {
  it('lowercases and strips non-alphanumerics', () => {
    expect(playerSlug('Skel3d1rge')).toBe('skel3d1rge');
    expect(playerSlug('TiAmo')).toBe('tiamo');
    expect(playerSlug('OH1YO')).toBe('oh1yo');
    expect(playerSlug('a b.c:d')).toBe('abcd');
  });
});

describe('portraitPath reuses playerSlug', () => {
  it('equals /roster/<playerSlug>.webp for varied handles', () => {
    for (const h of ['Skel3d1rge', 'TiAmo', 'OH1YO', 'a b.c', "King's"]) {
      expect(portraitPath(h)).toBe(`/roster/${playerSlug(h)}.webp`);
    }
  });
});

describe('hasDetailPage', () => {
  it('players + coach get pages; managers + inactive do not', () => {
    expect(hasDetailPage({ role: 'Tank' })).toBe(true);
    expect(hasDetailPage({ role: 'Coach' })).toBe(true);
    expect(hasDetailPage({ role: 'Manager' })).toBe(false);
    expect(hasDetailPage({ role: 'Tank', status: 'inactive' })).toBe(false);
  });
});

describe('social helpers derive from the single registry', () => {
  it('displaySocials excludes TODO/display:false and only returns real urls', () => {
    const d = displaySocials();
    expect(d.length).toBeGreaterThan(0);
    for (const c of d) expect(c.url).not.toBe('TODO');
  });
  it('communitySocials are all community:true with real urls', () => {
    for (const c of communitySocials()) {
      expect(c.community).toBe(true);
      expect(c.url).not.toBe('TODO');
    }
  });
  it('sameAsUrls are absolute and confirmed', () => {
    const urls = sameAsUrls();
    expect(urls.length).toBeGreaterThan(0);
    for (const u of urls) expect(u).toMatch(/^https:\/\//);
  });
});
