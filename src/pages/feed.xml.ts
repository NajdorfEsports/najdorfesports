import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site } from '../data/site';

const escape = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const GET: APIRoute = async () => {
  // English-only feed: the collection now holds per-locale entries, so filter
  // to en or every article would appear three times.
  const posts = (
    await getCollection('news', ({ data }) => !data.draft && data.locale === 'en')
  ).sort((a, b) => +b.data.date - +a.data.date);

  const lastBuild =
    posts[0]?.data.date.toUTCString() ?? new Date().toUTCString();

  const items = posts
    .map((post) => {
      const url = `${site.url}/news/${post.data.slug}/`;
      const desc = post.data.description
        ? `      <description>${escape(post.data.description)}</description>\n`
        : '';
      return `    <item>
      <title>${escape(post.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${post.data.date.toUTCString()}</pubDate>
${desc}      <author>${escape(site.contactEmail)} (${escape(post.data.author)})</author>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(site.name)}</title>
    <link>${site.url}</link>
    <description>${escape(site.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
};
