#!/usr/bin/env node
/**
 * import-wordpress-docs-to-articles.cjs
 *
 * Safe importer for WordPress BetterDocs XML preview into Directus articles.
 *
 * SAFETY:
 * - Dry-run by default.
 * - Requires --apply to create records.
 * - Creates only planned CREATE_REVIEW docs.
 * - Skips duplicates.
 * - Never updates existing articles.
 * - Never publishes automatically.
 * - Does not upload images/assets.
 * - Does not modify schema, permissions, users, roles, or categories.
 *
 * USAGE:
 *   DIRECTUS_URL=https://admin.projetceedo20.org DIRECTUS_TOKEN=<admin-token> node scripts/import-wordpress-docs-to-articles.cjs
 *   DIRECTUS_URL=https://admin.projetceedo20.org DIRECTUS_TOKEN=<admin-token> node scripts/import-wordpress-docs-to-articles.cjs --apply
 */

const fs = require('fs');
const path = require('path');

const DIRECTUS_URL = (process.env.DIRECTUS_URL || '').replace(/\/$/, '');
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || '';
const APPLY = process.argv.includes('--apply');

const previewPath = path.join(process.cwd(), 'imports', 'wordpress-docs-preview.json');
const planPath = path.join(process.cwd(), 'imports', 'wordpress-docs-import-plan.json');
const outPath = path.join(process.cwd(), 'imports', APPLY ? 'wordpress-docs-import-result.json' : 'wordpress-docs-import-dry-run.json');

if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
  console.error('Missing DIRECTUS_URL or DIRECTUS_TOKEN.');
  console.error('Dry-run still requires token because the script verifies current Directus state.');
  process.exit(1);
}

if (!fs.existsSync(previewPath)) {
  console.error(`Missing preview file: ${previewPath}`);
  process.exit(1);
}

if (!fs.existsSync(planPath)) {
  console.error(`Missing import plan file: ${planPath}`);
  process.exit(1);
}

const preview = JSON.parse(fs.readFileSync(previewPath, 'utf8'));
const importPlan = JSON.parse(fs.readFileSync(planPath, 'utf8'));

function redact(value) {
  return String(value).replaceAll(DIRECTUS_TOKEN, '<REDACTED>');
}

async function dx(pathname, { method = 'GET', body, query } = {}) {
  const url = new URL(`${DIRECTUS_URL}${pathname}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
  }

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(redact(`[${method} ${pathname}] ${res.status}: ${text}`));
  }

  if (!text) return null;

  const json = JSON.parse(text);
  return json.data ?? json;
}

function getDocBySlug(slug) {
  return preview.docs.find((doc) => doc.slug === slug);
}

function buildExcerpt(doc) {
  if (doc.excerpt) return doc.excerpt;

  const source = doc.content || '';
  const plain = source
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return plain.slice(0, 280);
}

function buildPayload(doc, planItem) {
  return {
    title: doc.title,
    slug: doc.slug,
    excerpt: buildExcerpt(doc),
    content: doc.content,
    category: planItem.categoryId,
    status: 'review',
    meta_title: doc.seo?.title || doc.title,
    meta_description: doc.seo?.description || buildExcerpt(doc),
  };
}

async function main() {
  console.log(APPLY ? 'MODE: APPLY' : 'MODE: DRY-RUN');
  console.log(`DIRECTUS_URL: ${DIRECTUS_URL}`);

  const categories = await dx('/items/categories', {
    query: {
      fields: 'id,name,slug',
      limit: '200',
    },
  });

  const existingArticles = await dx('/items/articles', {
    query: {
      fields: 'id,title,slug,status',
      limit: '500',
    },
  });

  const categoryIds = new Set((categories || []).map((cat) => cat.id));
  const existingSlugs = new Set((existingArticles || []).map((article) => article.slug));

  const plannedCreates = importPlan.plan.filter((item) => item.action === 'CREATE_REVIEW');
  const plannedSkips = importPlan.plan.filter((item) => item.action === 'SKIP_DUPLICATE');

  const results = {
    generatedAt: new Date().toISOString(),
    mode: APPLY ? 'apply' : 'dry-run',
    summary: {
      plannedCreates: plannedCreates.length,
      plannedSkips: plannedSkips.length,
      created: 0,
      skippedDuplicate: plannedSkips.length,
      skippedNowExisting: 0,
      skippedMissingCategory: 0,
      failed: 0,
    },
    created: [],
    skipped: [],
    failed: [],
  };

  for (const item of plannedSkips) {
    results.skipped.push({
      reason: 'PLANNED_DUPLICATE',
      title: item.title,
      slug: item.slug,
    });
  }

  for (const item of plannedCreates) {
    const doc = getDocBySlug(item.slug);

    if (!doc) {
      results.summary.failed += 1;
      results.failed.push({
        reason: 'DOC_NOT_FOUND_IN_PREVIEW',
        title: item.title,
        slug: item.slug,
      });
      continue;
    }

    if (!item.categoryId || !categoryIds.has(item.categoryId)) {
      results.summary.skippedMissingCategory += 1;
      results.skipped.push({
        reason: 'MISSING_CATEGORY',
        title: item.title,
        slug: item.slug,
        categoryId: item.categoryId,
      });
      continue;
    }

    if (existingSlugs.has(item.slug)) {
      results.summary.skippedNowExisting += 1;
      results.skipped.push({
        reason: 'ALREADY_EXISTS_AT_RUNTIME',
        title: item.title,
        slug: item.slug,
      });
      continue;
    }

    const payload = buildPayload(doc, item);

    if (!APPLY) {
      results.created.push({
        dryRun: true,
        title: payload.title,
        slug: payload.slug,
        status: payload.status,
        category: payload.category,
        hasContent: Boolean(payload.content),
        hasFeaturedImage: false,
      });
      continue;
    }

    try {
      const created = await dx('/items/articles', {
        method: 'POST',
        body: payload,
      });

      existingSlugs.add(item.slug);
      results.summary.created += 1;
      results.created.push({
        id: created.id,
        title: created.title,
        slug: created.slug,
        status: created.status,
        category: payload.category,
      });

      console.log(`✓ Created: ${created.slug}`);
    } catch (err) {
      results.summary.failed += 1;
      results.failed.push({
        reason: 'DIRECTUS_CREATE_FAILED',
        title: item.title,
        slug: item.slug,
        error: redact(err.message),
      });
      console.error(`✗ Failed: ${item.slug}`);
      console.error(redact(err.message));
    }
  }

  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');

  console.log('');
  console.log('SUMMARY');
  console.table([results.summary]);
  console.log(`Wrote ${path.relative(process.cwd(), outPath)}`);

  if (!APPLY) {
    console.log('');
    console.log('Dry-run only. Re-run with --apply to create articles.');
  }

  if (results.summary.failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(redact(err.message));
  process.exit(1);
});
