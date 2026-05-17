const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');

const DIRECTUS_URL = (process.env.DIRECTUS_URL || 'https://admin.projetceedo20.org').replace(/\/$/, '');
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || '';

const XML_PATH = path.join('imports', 'projetceedo20.WordPress.2026-05-17.xml');
const RESULT_PATH = path.join('imports', APPLY ? 'wordpress-docs-content-backfill-result.json' : 'wordpress-docs-content-backfill-dry-run.json');

if (!DIRECTUS_TOKEN) {
  console.error('Missing DIRECTUS_TOKEN. Define it in PowerShell before running this script.');
  process.exit(1);
}

function decodeXml(value = '') {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, '’')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—');
}

function stripCdata(value = '') {
  const trimmed = String(value).trim();
  if (trimmed.startsWith('<![CDATA[') && trimmed.endsWith(']]>')) {
    return trimmed.slice(9, -3).trim();
  }
  return trimmed;
}

function getTag(item, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  const match = item.match(re);
  return match ? decodeXml(stripCdata(match[1])) : '';
}

function getCdata(item, tag) {
  const escaped = tag.replace(':', '\\:');
  const re = new RegExp(`<${escaped}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${escaped}>`);
  const match = item.match(re);
  return match ? match[1].trim() : '';
}

async function directusFetch(endpoint, options = {}) {
  const res = await fetch(`${DIRECTUS_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error(`[${options.method || 'GET'} ${endpoint}] ${res.status}: ${JSON.stringify(json)}`);
    process.exit(1);
  }

  return json;
}

function extractDocsFromXml() {
  const xml = fs.readFileSync(XML_PATH, 'utf8');
  const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/g) || [];

  return itemMatches
    .map((item) => {
      const postType = getTag(item, 'wp:post_type');
      if (postType !== 'docs') return null;

      return {
        wpId: getTag(item, 'wp:post_id'),
        title: getTag(item, 'title'),
        slug: getTag(item, 'wp:post_name'),
        wpStatus: getTag(item, 'wp:status'),
        content: getCdata(item, 'content:encoded'),
      };
    })
    .filter(Boolean);
}

async function main() {
  console.log(`MODE: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`DIRECTUS_URL: ${DIRECTUS_URL}`);

  const docs = extractDocsFromXml();
  const docsBySlug = new Map(docs.map((doc) => [doc.slug, doc]));

  console.log(`XML docs found: ${docs.length}`);
  console.log(`XML docs with content: ${docs.filter((d) => d.content.length > 0).length}`);

  const filter = encodeURIComponent(JSON.stringify({ status: { _eq: 'review' } }));
  const fields = 'id,title,slug,status,content';
  const articlesRes = await directusFetch(`/items/articles?fields=${fields}&filter=${filter}&limit=100`);
  const articles = articlesRes.data || [];

  const actions = [];

  for (const article of articles) {
    const doc = docsBySlug.get(article.slug);
    const currentContentLength = String(article.content || '').length;

    if (!doc) {
      actions.push({
        id: article.id,
        slug: article.slug,
        title: article.title,
        action: 'SKIP_NO_XML_MATCH',
        currentContentLength,
        newContentLength: 0,
      });
      continue;
    }

    if (!doc.content || doc.content.length === 0) {
      actions.push({
        id: article.id,
        slug: article.slug,
        title: article.title,
        action: 'SKIP_XML_EMPTY_CONTENT',
        currentContentLength,
        newContentLength: 0,
      });
      continue;
    }

    if (currentContentLength > 0) {
      actions.push({
        id: article.id,
        slug: article.slug,
        title: article.title,
        action: 'SKIP_ALREADY_HAS_CONTENT',
        currentContentLength,
        newContentLength: doc.content.length,
      });
      continue;
    }

    if (APPLY) {
      await directusFetch(`/items/articles/${article.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ content: doc.content }),
      });
      console.log(`✓ Backfilled: ${article.slug}`);
    }

    actions.push({
      id: article.id,
      slug: article.slug,
      title: article.title,
      action: APPLY ? 'BACKFILLED' : 'WOULD_BACKFILL',
      currentContentLength,
      newContentLength: doc.content.length,
    });
  }

  const summary = {
    mode: APPLY ? 'APPLY' : 'DRY-RUN',
    xmlDocs: docs.length,
    xmlDocsWithContent: docs.filter((d) => d.content.length > 0).length,
    reviewArticles: articles.length,
    wouldBackfill: actions.filter((a) => a.action === 'WOULD_BACKFILL').length,
    backfilled: actions.filter((a) => a.action === 'BACKFILLED').length,
    skipNoXmlMatch: actions.filter((a) => a.action === 'SKIP_NO_XML_MATCH').length,
    skipXmlEmptyContent: actions.filter((a) => a.action === 'SKIP_XML_EMPTY_CONTENT').length,
    skipAlreadyHasContent: actions.filter((a) => a.action === 'SKIP_ALREADY_HAS_CONTENT').length,
  };

  fs.writeFileSync(RESULT_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), summary, actions }, null, 2), 'utf8');

  console.log('\nSUMMARY');
  console.table([summary]);
  console.log(`Wrote ${RESULT_PATH}`);

  if (!APPLY) {
    console.log('\nDry-run only. Re-run with --apply to backfill article content.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
