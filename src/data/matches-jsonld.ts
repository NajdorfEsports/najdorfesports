/**
 * SportsEvent JSON-LD for the matches page. Locale-independent, the same
 * block is emitted at /matches/, /zh-TW/matches/, and /zh-CN/matches/.
 * Tournament and team names stay in their canonical English form, which is
 * what schema.org consumers expect regardless of the page's display locale.
 *
 * One SportsEvent per match, upcoming and past. Past matches get
 * EventCompleted status; upcoming get EventScheduled. Location is a
 * VirtualLocation pointing at the Twitch stream URL when available. Each
 * event references the SportsOrganization @id emitted by BaseLayout.
 */
import { site } from './site';
import { loadMatches } from './loaders';
import { ORG_ID } from './org-jsonld';

const orgId = ORG_ID;

export function buildMatchesJsonLd(): Array<Record<string, unknown>> {
  const allMatches = loadMatches();
  return allMatches.map((m) => {
    const isPast = +new Date(m.date) < Date.now();
    return {
      '@context': 'https://schema.org',
      '@type': 'SportsEvent',
      name: `${site.name} vs ${m.opponent}`,
      startDate: new Date(m.date).toISOString(),
      sport: 'Overwatch 2',
      eventStatus: isPast
        ? 'https://schema.org/EventCompleted'
        : 'https://schema.org/EventScheduled',
      ...(m.streamUrl
        ? {
            location: {
              '@type': 'VirtualLocation',
              url: m.streamUrl,
            },
          }
        : {}),
      competitor: [
        { '@type': 'SportsTeam', '@id': orgId, name: site.name },
        { '@type': 'SportsTeam', name: m.opponent },
      ],
      superEvent: {
        '@type': 'SportsEvent',
        name: m.tournament,
        ...(m.liquipediaUrl ? { url: m.liquipediaUrl } : {}),
      },
      ...(m.streamUrl ? { url: m.streamUrl } : {}),
    };
  });
}
