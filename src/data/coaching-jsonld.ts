/**
 * JSON-LD for the coaching page: a Service node with one Offer per offering tier,
 * plus a Person node per coach. All reference the sitewide org by its stable @id
 * (https://najdorfesports.gg/#org) rather than redefining it.
 *
 * Locale-independent on purpose (mirrors matches-jsonld): canonical English
 * names and the canonical English page URL are emitted on every locale, so all
 * three pages point at the same @id. Prices come from the COACHES data; the
 * English tier display names come from the `en` dictionary so this stays in sync
 * with the page copy without duplicating it. The Offer url uses the canonical
 * card (Stripe) booking link for each tier.
 */
import { site } from './site';
import { COACHES, bookingUrl, linkFor } from './coaching';
import { en } from '../i18n/en';

const ORG_ID = `${site.url}/#org`;
const PAGE_URL = `${site.url}/coaching/`;

export function buildCoachingJsonLd(): Array<Record<string, unknown>> {
  const items = en.coaching.offerings.items;

  const offers = COACHES.flatMap((coach) =>
    coach.offerings.map((o) => {
      const canonical = linkFor(o, 'stripe') ?? o.links[0];
      return {
        '@type': 'Offer',
        name: items[o.tier].title,
        price: o.priceUsd.toFixed(2),
        priceCurrency: 'USD',
        url: bookingUrl(canonical.calLink),
        availability: 'https://schema.org/InStock',
      };
    }),
  );

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
    offers,
  };

  const knowsLanguageByCoach: Record<string, string[]> = {
    cantonese: ['Cantonese'],
    mandarin: ['Mandarin Chinese'],
  };

  const coaches = COACHES.map((coach) => ({
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${PAGE_URL}#coach-${coach.slug}`,
    name: coach.displayName,
    jobTitle: 'Overwatch Coach',
    worksFor: { '@id': ORG_ID },
    knowsLanguage: coach.languages.flatMap((l) => knowsLanguageByCoach[l.id] ?? []),
  }));

  return [service, ...coaches];
}
