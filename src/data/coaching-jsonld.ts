/**
 * JSON-LD for the coaching page: a Service node with one Offer per offering,
 * plus a Person node for the coach. Both reference the sitewide org by its
 * stable @id (https://najdorfesports.gg/#org) rather than redefining it.
 *
 * Locale-independent on purpose (mirrors matches-jsonld): canonical English
 * names and the canonical English page URL are emitted on every locale, so all
 * three pages point at the same @id. Prices come from the OFFERINGS data; the
 * English display names come from the `en` dictionary so this stays in sync
 * with the page copy without duplicating it.
 */
import { site } from './site';
import { OFFERINGS } from './coaching';
import { en } from '../i18n/en';

const ORG_ID = `${site.url}/#org`;
const PAGE_URL = `${site.url}/coaching/`;

export function buildCoachingJsonLd(): Array<Record<string, unknown>> {
  const items = en.coaching.offerings.items;

  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${PAGE_URL}#service`,
    name: 'Overwatch Coaching',
    serviceType: 'Esports coaching',
    url: PAGE_URL,
    description: en.pageMeta.coachingDescription,
    provider: { '@id': ORG_ID },
    areaServed: 'Asia Pacific',
    offers: OFFERINGS.map((o) => ({
      '@type': 'Offer',
      name: items[o.id].title,
      price: o.priceUsd.toFixed(2),
      priceCurrency: 'USD',
      url: `https://cal.com/${o.calLink}`,
      availability: 'https://schema.org/InStock',
    })),
  };

  const coach = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${PAGE_URL}#coach-brysonbtw`,
    name: 'brysonbtw',
    jobTitle: 'Overwatch Coach',
    worksFor: { '@id': ORG_ID },
    nationality: 'Hong Kong',
    knowsLanguage: ['Cantonese', 'Mandarin Chinese'],
  };

  return [service, coach];
}
