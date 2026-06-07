import { describe, it, expect } from 'vitest';
import { buildOrgJsonLd, personNode, splitName, ORG_ID } from './org-jsonld';
import { buildMatchesJsonLd } from './matches-jsonld';
import { buildPlayerJsonLd } from './roster-jsonld';
import { serializeJsonLd } from '../lib/jsonld';
import type { RosterEntry } from './site';

const player = (over: Partial<RosterEntry>): RosterEntry => ({
  handle: 'Z',
  role: 'DPS',
  country: 'Taiwan',
  ...over,
});

describe('splitName', () => {
  it('splits surname-first romanized names', () => {
    expect(splitName('Kim Dohyeon')).toEqual({ familyName: 'Kim', givenName: 'Dohyeon' });
    expect(splitName('Park Do yun')).toEqual({ familyName: 'Park', givenName: 'Do yun' });
  });
  it('handles single tokens and empty input', () => {
    expect(splitName('Mononym')).toEqual({ givenName: 'Mononym' });
    expect(splitName(undefined)).toEqual({});
  });
});

describe('personNode', () => {
  it('builds a Person linked to the org, with sameAs only when links exist', () => {
    const node = personNode(player({ realName: 'Lai Yuli', twitch: 'https://twitch.tv/z' }));
    expect(node['@type']).toBe('Person');
    expect(node.name).toBe('Z');
    expect(node.jobTitle).toBe('DPS');
    expect(node.memberOf).toEqual({ '@id': ORG_ID });
    expect(node.sameAs).toContain('https://twitch.tv/z');
    expect(node['@context']).toBeUndefined();
  });
  it('omits sameAs/nationality when absent and adds @context with withContext', () => {
    const bare = personNode(player({ country: 'TBD' }), { withContext: true });
    expect(bare.sameAs).toBeUndefined();
    expect(bare.nationality).toBeUndefined(); // TBD is dropped
    expect(bare['@context']).toBe('https://schema.org');
  });
});

describe('buildOrgJsonLd (runs against the real, validated roster)', () => {
  it('minimal node carries the stable @id and core fields, no roster', () => {
    const org = buildOrgJsonLd();
    expect(org['@id']).toBe(ORG_ID);
    expect(org['@type']).toBe('SportsOrganization');
    expect(org.name).toBeTruthy();
    expect(org.url).toBeTruthy();
    expect(org.athlete).toBeUndefined();
  });
  it('enriched node embeds athletes, all of whom are real players', () => {
    const org = buildOrgJsonLd({ withRoster: true });
    expect(Array.isArray(org.athlete)).toBe(true);
    for (const a of org.athlete as Array<Record<string, unknown>>) {
      expect(a['@type']).toBe('Person');
      expect(['Tank', 'DPS', 'Support', 'Flex']).toContain(a.jobTitle);
    }
  });
});

describe('buildMatchesJsonLd', () => {
  it('every event is a valid SportsEvent referencing the org', () => {
    for (const ev of buildMatchesJsonLd()) {
      expect(ev['@type']).toBe('SportsEvent');
      expect(Number.isNaN(Date.parse(ev.startDate as string))).toBe(false);
      expect([
        'https://schema.org/EventCompleted',
        'https://schema.org/EventScheduled',
      ]).toContain(ev.eventStatus);
      const competitors = ev.competitor as Array<Record<string, unknown>>;
      expect(competitors[0]['@id']).toBe(ORG_ID);
    }
  });
});

describe('buildPlayerJsonLd', () => {
  it('is a standalone Person with @context', () => {
    const node = buildPlayerJsonLd(player({ handle: 'A', role: 'Tank' }));
    expect(node['@type']).toBe('Person');
    expect(node['@context']).toBe('https://schema.org');
  });
});

describe('JSON-LD escaping, end to end', () => {
  it('a </script>-laced field cannot break out after serialization', () => {
    const node = personNode(player({ handle: 'A</script><b>' }));
    expect(serializeJsonLd(node)).not.toContain('</script>');
  });
});
