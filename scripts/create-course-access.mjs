#!/usr/bin/env node
/**
 * create-course-access.mjs — Phase 24.7B
 *
 * Create the `course_access` collection in Directus 11.x with the exact
 * schema audited from the codebase. Idempotent. Dry-run by default.
 *
 * SAFETY:
 *   • Dry-run by default — prints the plan, applies nothing.
 *   • --apply writes to Directus.
 *   • Idempotent — re-runnable; skips parts that already exist.
 *   • Touches only `course_access` and one O2M alias field on `courses`.
 *   • Never modifies existing collections, fields, or data.
 *   • Aborts if Directus major version != 11 (this script is tuned for 11.x).
 *   • Aborts if `courses.id` is not INTEGER (mismatch would corrupt the M2O).
 *   • Token redacted from any echoed error response.
 *
 * USAGE:
 *   DIRECTUS_URL=https://admin.projetceedo20.org \
 *   DIRECTUS_TOKEN=<root-admin-static-token> \
 *   node scripts/create-course-access.mjs --dry-run
 *
 *   …review the plan, then:
 *   DIRECTUS_URL=… DIRECTUS_TOKEN=… node scripts/create-course-access.mjs --apply
 *
 * WHAT IT CREATES:
 *   Collection course_access (UUID primary key, accountability: all)
 *     id                        uuid PK
 *     user_id                   M2O → directus_users (uuid, on_delete SET NULL)
 *     course_id                 M2O → courses (integer, on_delete CASCADE)
 *     status                    string dropdown [pending|active|revoked], default pending
 *     access_type               string dropdown [request|admin_grant|payment]
 *     requested_at              timestamp nullable
 *     granted_at                timestamp nullable
 *     stripe_session_id         string(255) nullable
 *     stripe_payment_intent_id  string(255) nullable
 *     amount_paid               decimal(10,2) nullable
 *     currency                  string(3) nullable
 *     date_created              timestamp (system)
 *     date_updated              timestamp (system)
 *     user_created              uuid M2O directus_users (system)
 *     user_updated              uuid M2O directus_users (system)
 *
 *   O2M alias on courses:
 *     courses.course_access     (one_field of the course_id M2O)
 *
 * AFTER APPLY:
 *   Verify in Directus UI:
 *     - course_access appears in Settings → Data Model
 *     - course_access is selectable in Policies' collection selector
 *     - courses now has a "course_access" alias field
 *   Then proceed with the permissions script (apply-directus-permissions.mjs).
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL;
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;
const APPLY = process.argv.includes('--apply');

if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
  console.error('Missing DIRECTUS_URL or DIRECTUS_TOKEN. See script header.');
  process.exit(1);
}

// ─── HTTP helper ─────────────────────────────────────────────────────────────

async function dx(path, { method = 'GET', body, expect404 = false } = {}) {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 404 && expect404) return null;
  if (!res.ok) {
    const text = await res.text();
    const safe = String(text).replaceAll(DIRECTUS_TOKEN, '<REDACTED>');
    throw new Error(`[${method} ${path}] ${res.status}: ${safe}`);
  }
  if (res.status === 204) return null;
  const json = await res.json();
  return json?.data ?? json;
}

// ─── Pre-flight checks ───────────────────────────────────────────────────────

async function preflight() {
  console.log('Pre-flight checks…');

  // 1. Directus version must be 11.x
  const info = await dx('/server/info');
  const version = info?.directus?.version || info?.version || 'unknown';
  const major = parseInt(String(version).split('.')[0], 10);
  console.log(`  • Directus version: ${version}`);
  if (major !== 11) {
    console.error(`✗ This script is tuned for Directus 11.x. Detected ${version}.`);
    console.error('  Aborting. Adapt the script or use the UI for your version.');
    process.exit(2);
  }

  // 2. courses collection must exist and courses.id must be INTEGER
  let coursesIdField;
  try {
    coursesIdField = await dx('/fields/courses/id');
  } catch (err) {
    console.error('✗ Cannot read /fields/courses/id. Does the courses collection exist?');
    console.error(`  ${err.message}`);
    process.exit(2);
  }
  const idType = coursesIdField?.type || coursesIdField?.schema?.data_type;
  console.log(`  • courses.id type: ${idType}`);
  if (idType !== 'integer') {
    console.error(`✗ courses.id is "${idType}" but this script assumes INTEGER.`);
    console.error('  Aborting. Re-spec course_access.course_id to match.');
    process.exit(2);
  }

  // 3. course_access must NOT exist (otherwise script is for create only)
  const existing = await dx('/collections/course_access', { expect404: true });
  if (existing) {
    console.warn('  ⚠ course_access already exists. Script will be idempotent:');
    console.warn('    it will only add missing fields/relations, never modify or drop.');
  } else {
    console.log('  • course_access does not exist — will be created.');
  }

  console.log('');
  return { existsAlready: !!existing };
}

// ─── Schema definitions ──────────────────────────────────────────────────────

const COLLECTION_BODY = {
  collection: 'course_access',
  schema: { name: 'course_access' },
  meta: {
    collection: 'course_access',
    icon: 'lock_open',
    note: 'Per-user course access grants (manual approval + Stripe payment).',
    singleton: false,
    archive_field: null,
    sort_field: null,
    accountability: 'all',
    display_template: '{{user_id.first_name}} {{user_id.last_name}} — {{course_id.title}} ({{status}})',
  },
  fields: [
    {
      field: 'id',
      type: 'uuid',
      meta: { hidden: true, readonly: true, interface: 'input', special: ['uuid'] },
      schema: { is_primary_key: true, length: 36, has_auto_increment: false },
    },
  ],
};

// Custom fields created in order after the collection exists.
// M2O fields are created here; the actual relation rows are POSTed to /relations after.
const CUSTOM_FIELDS = [
  {
    field: 'user_id',
    type: 'uuid',
    meta: {
      interface: 'select-dropdown-m2o',
      special: ['m2o'],
      required: true,
      options: { template: '{{first_name}} {{last_name}} ({{email}})' },
    },
    schema: { is_nullable: false },
  },
  {
    field: 'course_id',
    type: 'integer',
    meta: {
      interface: 'select-dropdown-m2o',
      special: ['m2o'],
      required: true,
      options: { template: '{{title}}' },
    },
    schema: { is_nullable: false },
  },
  {
    field: 'status',
    type: 'string',
    meta: {
      interface: 'select-dropdown',
      required: true,
      options: {
        choices: [
          { text: 'Pending',  value: 'pending'  },
          { text: 'Active',   value: 'active'   },
          { text: 'Revoked',  value: 'revoked'  },
        ],
      },
      display: 'labels',
    },
    schema: { default_value: 'pending', is_nullable: false },
  },
  {
    field: 'access_type',
    type: 'string',
    meta: {
      interface: 'select-dropdown',
      required: true,
      options: {
        choices: [
          { text: 'Manual request',  value: 'request'      },
          { text: 'Admin grant',     value: 'admin_grant'  },
          { text: 'Stripe payment',  value: 'payment'      },
        ],
      },
    },
    schema: { is_nullable: false },
  },
  {
    field: 'requested_at',
    type: 'timestamp',
    meta: { interface: 'datetime', display: 'datetime', display_options: { relative: true } },
    schema: { is_nullable: true },
  },
  {
    field: 'granted_at',
    type: 'timestamp',
    meta: { interface: 'datetime', display: 'datetime', display_options: { relative: true } },
    schema: { is_nullable: true },
  },
  {
    field: 'stripe_session_id',
    type: 'string',
    meta: { interface: 'input', hidden: false, readonly: false, width: 'half' },
    schema: { is_nullable: true, max_length: 255 },
  },
  {
    field: 'stripe_payment_intent_id',
    type: 'string',
    meta: { interface: 'input', hidden: false, readonly: false, width: 'half' },
    schema: { is_nullable: true, max_length: 255 },
  },
  {
    field: 'amount_paid',
    type: 'decimal',
    meta: { interface: 'input', width: 'half' },
    schema: { is_nullable: true, numeric_precision: 10, numeric_scale: 2 },
  },
  {
    field: 'currency',
    type: 'string',
    meta: { interface: 'input', width: 'half', note: 'ISO 4217 lowercase (eur, usd, …)' },
    schema: { is_nullable: true, max_length: 3 },
  },
  // ── System fields ──
  {
    field: 'date_created',
    type: 'timestamp',
    meta: {
      special: ['date-created'],
      interface: 'datetime',
      readonly: true,
      hidden: true,
      width: 'half',
      display: 'datetime',
      display_options: { relative: true },
    },
    schema: { is_nullable: true },
  },
  {
    field: 'date_updated',
    type: 'timestamp',
    meta: {
      special: ['date-updated'],
      interface: 'datetime',
      readonly: true,
      hidden: true,
      width: 'half',
      display: 'datetime',
      display_options: { relative: true },
    },
    schema: { is_nullable: true },
  },
  {
    field: 'user_created',
    type: 'uuid',
    meta: {
      special: ['user-created'],
      interface: 'select-dropdown-m2o',
      readonly: true,
      hidden: true,
      width: 'half',
      options: { template: '{{avatar.$thumbnail}} {{first_name}} {{last_name}}' },
      display: 'user',
    },
    schema: { is_nullable: true },
  },
  {
    field: 'user_updated',
    type: 'uuid',
    meta: {
      special: ['user-updated'],
      interface: 'select-dropdown-m2o',
      readonly: true,
      hidden: true,
      width: 'half',
      options: { template: '{{avatar.$thumbnail}} {{first_name}} {{last_name}}' },
      display: 'user',
    },
    schema: { is_nullable: true },
  },
];

// Relations created after fields exist. `meta.one_field` controls whether
// Directus also creates an O2M alias on the parent collection.
const RELATIONS = [
  {
    collection: 'course_access',
    field: 'user_id',
    related_collection: 'directus_users',
    schema: { on_delete: 'SET NULL' },
    meta: {
      // No alias on directus_users (would clutter the system collection).
      one_field: null,
      sort_field: null,
      one_deselect_action: 'nullify',
    },
  },
  {
    collection: 'course_access',
    field: 'course_id',
    related_collection: 'courses',
    schema: { on_delete: 'CASCADE' },
    meta: {
      // THIS creates the courses.course_access O2M alias required by the
      // dynamic lessons.content permission filter from Phase 24.7.
      one_field: 'course_access',
      sort_field: null,
      one_deselect_action: 'nullify',
    },
  },
  // System-field relations
  {
    collection: 'course_access',
    field: 'user_created',
    related_collection: 'directus_users',
    schema: { on_delete: 'SET NULL' },
    meta: { one_field: null, sort_field: null, one_deselect_action: 'nullify' },
  },
  {
    collection: 'course_access',
    field: 'user_updated',
    related_collection: 'directus_users',
    schema: { on_delete: 'SET NULL' },
    meta: { one_field: null, sort_field: null, one_deselect_action: 'nullify' },
  },
];

// ─── Apply helpers ───────────────────────────────────────────────────────────

async function ensureCollection() {
  const existing = await dx('/collections/course_access', { expect404: true });
  if (existing) {
    console.log('  ✓ collection course_access (exists, skipping)');
    return;
  }
  console.log('  + collection course_access (creating)');
  if (APPLY) await dx('/collections', { method: 'POST', body: COLLECTION_BODY });
}

async function ensureField(spec) {
  const existing = await dx(`/fields/course_access/${spec.field}`, { expect404: true });
  if (existing) {
    console.log(`    ✓ field ${spec.field} (exists)`);
    return;
  }
  console.log(`    + field ${spec.field} :: ${spec.type}`);
  if (APPLY) await dx('/fields/course_access', { method: 'POST', body: spec });
}

async function ensureRelation(spec) {
  // Directus exposes relations under /relations/{collection}/{field}
  const existing = await dx(`/relations/course_access/${spec.field}`, { expect404: true });
  if (existing) {
    console.log(`    ✓ relation course_access.${spec.field} → ${spec.related_collection} (exists)`);
    return;
  }
  console.log(`    + relation course_access.${spec.field} → ${spec.related_collection}` +
              (spec.meta?.one_field ? ` (one_field=${spec.meta.one_field})` : ''));
  if (APPLY) await dx('/relations', { method: 'POST', body: spec });
}

async function verifyCoursesAlias() {
  const alias = await dx('/fields/courses/course_access', { expect404: true });
  if (alias) {
    console.log('  ✓ alias courses.course_access (auto-generated by Directus)');
    return true;
  }
  console.warn('  ⚠ alias courses.course_access NOT FOUND.');
  console.warn('    Directus normally generates this from the one_field of the M2O relation.');
  console.warn('    If you applied this script and the alias is still missing, create it');
  console.warn('    manually: Data Model → courses → "+ Create Field" → Alias → One to Many,');
  console.warn('    alias name "course_access", related collection course_access, FK field course_id.');
  return false;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
  console.log('');

  await preflight();

  console.log('Plan:');
  console.log('');
  console.log('1) Collection');
  await ensureCollection();

  console.log('');
  console.log('2) Custom fields');
  for (const spec of CUSTOM_FIELDS) {
    await ensureField(spec);
  }

  console.log('');
  console.log('3) Relations');
  for (const spec of RELATIONS) {
    await ensureRelation(spec);
  }

  console.log('');
  console.log('4) Verify courses.course_access alias');
  const hasAlias = await verifyCoursesAlias();

  console.log('');
  if (APPLY) {
    console.log(hasAlias
      ? '✓ Applied. course_access schema is in place.'
      : '⚠ Applied, but alias is missing — see note above.');
  } else {
    console.log('✓ Dry-run complete. Re-run with --apply to write.');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
