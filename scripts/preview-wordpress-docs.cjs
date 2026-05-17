const fs = require('fs');
const path = require('path');

const xmlPath = path.join(process.cwd(), 'imports', 'projetceedo20.WordPress.2026-05-17.xml');
const outJsonPath = path.join(process.cwd(), 'imports', 'wordpress-docs-preview.json');
const outMdPath = path.join(process.cwd(), 'imports', 'wordpress-docs-report.md');

if (!fs.existsSync(xmlPath)) {
  throw new Error(`XML not found: ${xmlPath}`);
}

const xml = fs.readFileSync(xmlPath, 'utf8');

function decodeEntities(value = '') {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getTag(block, tagName) {
  const tag = escapeRegExp(tagName);
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = block.match(re);
  return match ? decodeEntities(match[1]) : '';
}

function getCategories(block) {
  const categories = [];
  const re = /<category\s+([^>]*)>([\s\S]*?)<\/category>/gi;
  let match;

  while ((match = re.exec(block))) {
    const attrs = match[1] || '';
    const label = decodeEntities(match[2] || '');
    const domain = (attrs.match(/domain="([^"]+)"/i) || [])[1] || '';
    const nicename = (attrs.match(/nicename="([^"]+)"/i) || [])[1] || '';

    categories.push({ domain, nicename, label });
  }

  return categories;
}

function getPostMeta(block) {
  const meta = {};
  const re = /<wp:postmeta>([\s\S]*?)<\/wp:postmeta>/gi;
  let match;

  while ((match = re.exec(block))) {
    const metaBlock = match[1];
    const key = getTag(metaBlock, 'wp:meta_key');
    const value = getTag(metaBlock, 'wp:meta_value');

    if (!key) continue;

    if (meta[key] === undefined) {
      meta[key] = value;
    } else if (Array.isArray(meta[key])) {
      meta[key].push(value);
    } else {
      meta[key] = [meta[key], value];
    }
  }

  return meta;
}

function getUrls(content = '') {
  const found = content.match(/https?:\/\/[^\s"'<>]+/g) || [];
  return [...new Set(found.map(url => url.replace(/[),.;]+$/g, '')))];
}

function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

const itemBlocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(match => match[1]);

const allItems = itemBlocks.map(block => {
  const meta = getPostMeta(block);
  const categories = getCategories(block);

  return {
    raw: block,
    postId: getTag(block, 'wp:post_id'),
    postType: getTag(block, 'wp:post_type'),
    status: getTag(block, 'wp:status'),
    title: getTag(block, 'title'),
    slug: getTag(block, 'wp:post_name'),
    link: getTag(block, 'link'),
    guid: getTag(block, 'guid'),
    creator: getTag(block, 'dc:creator'),
    pubDate: getTag(block, 'pubDate'),
    postDate: getTag(block, 'wp:post_date'),
    postDateGmt: getTag(block, 'wp:post_date_gmt'),
    content: getTag(block, 'content:encoded'),
    excerpt: getTag(block, 'excerpt:encoded'),
    categories,
    meta,
    attachmentUrl: getTag(block, 'wp:attachment_url'),
  };
});

const attachmentsById = new Map(
  allItems
    .filter(item => item.postType === 'attachment')
    .map(item => [String(item.postId), item])
);

const docs = allItems
  .filter(item => item.postType === 'docs')
  .map(item => {
    const thumbnailId = item.meta._thumbnail_id || '';
    const attachment = thumbnailId ? attachmentsById.get(String(thumbnailId)) : null;
    const urls = getUrls(item.content);
    const plainText = stripHtml(item.content);

    return {
      wpId: item.postId,
      title: item.title,
      slug: item.slug,
      status: item.status,
      author: item.creator,
      postDate: item.postDate,
      pubDate: item.pubDate,
      categories: item.categories
        .filter(cat => cat.domain && cat.domain !== 'post_tag')
        .map(cat => ({
          domain: cat.domain,
          slug: cat.nicename,
          name: cat.label,
        })),
      tags: item.categories
        .filter(cat => cat.domain === 'post_tag')
        .map(cat => ({
          slug: cat.nicename,
          name: cat.label,
        })),
      excerpt: item.excerpt,
      contentLength: item.content.length,
      wordCount: plainText ? plainText.split(/\s+/).length : 0,
      thumbnailId,
      thumbnailUrl: attachment?.attachmentUrl || '',
      hasFeaturedImage: Boolean(attachment?.attachmentUrl),
      seo: {
        title: item.meta._yoast_wpseo_title || '',
        description: item.meta._yoast_wpseo_metadesc || '',
      },
      urls,
      externalUrls: urls.filter(url => !url.includes('buurceedo.com') && !url.includes('projetceedo20.org')),
    };
  });

const categoryCounts = {};
for (const doc of docs) {
  for (const category of doc.categories) {
    categoryCounts[category.name] = (categoryCounts[category.name] || 0) + 1;
  }
}

const docsWithoutImages = docs.filter(doc => !doc.hasFeaturedImage);
const docsWithExternalUrls = docs.filter(doc => doc.externalUrls.length > 0);

const summary = {
  source: 'WordPress BetterDocs XML',
  xmlFile: path.relative(process.cwd(), xmlPath),
  totalItems: allItems.length,
  postTypes: allItems.reduce((acc, item) => {
    acc[item.postType] = (acc[item.postType] || 0) + 1;
    return acc;
  }, {}),
  statuses: allItems.reduce((acc, item) => {
    const key = `${item.postType}:${item.status}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {}),
  docsCount: docs.length,
  attachmentsCount: attachmentsById.size,
  docsWithFeaturedImage: docs.filter(doc => doc.hasFeaturedImage).length,
  docsWithoutFeaturedImage: docsWithoutImages.length,
  docsWithExternalUrls: docsWithExternalUrls.length,
  categoryCounts,
};

const preview = {
  generatedAt: new Date().toISOString(),
  summary,
  docs,
};

const md = [
  '# WordPress BetterDocs Preview Report',
  '',
  `Generated at: ${preview.generatedAt}`,
  '',
  '## Summary',
  '',
  `- Total XML items: ${summary.totalItems}`,
  `- Docs: ${summary.docsCount}`,
  `- Attachments: ${summary.attachmentsCount}`,
  `- Docs with featured image: ${summary.docsWithFeaturedImage}`,
  `- Docs without featured image: ${summary.docsWithoutFeaturedImage}`,
  `- Docs with external URLs: ${summary.docsWithExternalUrls}`,
  '',
  '## Post types',
  '',
  ...Object.entries(summary.postTypes).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Statuses',
  '',
  ...Object.entries(summary.statuses).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Categories',
  '',
  ...Object.entries(summary.categoryCounts).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Docs without featured image',
  '',
  ...(docsWithoutImages.length
    ? docsWithoutImages.map(doc => `- ${doc.title} (${doc.slug})`)
    : ['- None']),
  '',
  '## Docs',
  '',
  ...docs.map((doc, index) => [
    `### ${index + 1}. ${doc.title}`,
    '',
    `- WP ID: ${doc.wpId}`,
    `- Slug: ${doc.slug}`,
    `- Status: ${doc.status}`,
    `- Author: ${doc.author}`,
    `- Date: ${doc.postDate}`,
    `- Categories: ${doc.categories.map(cat => cat.name).join(', ') || '—'}`,
    `- Word count: ${doc.wordCount}`,
    `- Featured image: ${doc.hasFeaturedImage ? doc.thumbnailUrl : 'NO'}`,
    `- External URLs: ${doc.externalUrls.length}`,
    '',
  ].join('\n')),
].join('\n');

fs.writeFileSync(outJsonPath, JSON.stringify(preview, null, 2), 'utf8');
fs.writeFileSync(outMdPath, md, 'utf8');

console.log('Preview generated successfully.');
console.log(`JSON: ${path.relative(process.cwd(), outJsonPath)}`);
console.log(`Report: ${path.relative(process.cwd(), outMdPath)}`);
console.log('');
console.log(JSON.stringify(summary, null, 2));
