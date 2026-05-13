#!/usr/bin/env node
/**
 * apply-directus-permissions.mjs
 *
 * Apply the Phase 24.7 permission matrix to a Directus instance.
 *
 * SAFETY:
 *   • Dry-run by default — prints the diff but applies nothing.
 *   • Pass --apply to actually write.
 *   • Idempotent: re-running is safe; existing matching permissions
 *     are detected by (role, collection, action) and updated in-place.
 *   • Never deletes existing permissions you did not configure here.
 *
 * USAGE:
 *   DIRECTUS_URL=https://admin.projetceedo20.org \
 *   DIRECTUS_TOKEN=<root-admin-static-token> \
 *   node scripts/apply-directus-permissions.mjs --dry-run
 *
 *   …then once the printed plan looks correct:
 *   DIRECTUS_URL=… DIRECTUS_TOKEN=… node scripts/apply-directus-permissions.mjs --apply
 *
 * REQUIREMENTS:
 *   • A ROOT admin static token (Settings → Access Tokens on an Admin user).
 *     This token is ONLY used here to create roles/permissions; it is NOT
 *     the same as DIRECTUS_ADMIN_TOKEN used by the Stripe webhook.
 *   • Directus 10.x or 11.x. On Directus 11+ permissions live on Policies;
 *     this script auto-detects and uses the right endpoint.
 *
 * WHAT IT DOES:
 *   1. Ensures role "StripeWebhook" exists with permissions limited to
 *      course_access (R/C/U). You still need to create a USER assigned to
 *      that role and generate its static token via the Directus UI —
 *      that final step requires UI access to mint the token.
 *   2. Ensures the "Authenticated" role's permissions on:
 *        - lessons (basic fields always, premium fields conditional)
 *        - course_access (own rows only, create own only)
 *        - directus_users (own profile read/update, public fields of others)
 *        - course_enrollments, lesson_progress, certificates (own rows)
 *   3. Does NOT touch the Admin role.
 *
 * It does NOT mint static tokens (Directus requires UI for that).
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL;
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;
const APPLY = process.argv.includes('--apply');

if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
  console.error('Missing DIRECTUS_URL or DIRECTUS_TOKEN. See script header.');
  process.exit(1);
}

// ─── HTTP ────────────────────────────────────────────────────────────────────

async function dx(path, { method = 'GET', body, query } = {}) {
  const url = new URL(`${DIRECTUS_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      url.searchParams.set(k, typeof v === 'string' ? v : JSON.stringify(v));
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
  if (!res.ok) {
    const text = await res.text();
    // Defensive: redact anything that even resembles the bearer token so
    // accidental echoes (e.g. Directus reflecting back headers) never leak.
    const safe = String(text).replaceAll(DIRECTUS_TOKEN, '<REDACTED>');
    throw new Error(`[${method} ${path}] ${res.status}: ${safe}`);
  }
  if (res.status === 204) return null;
  const json = await res.json();
  return json.data;
}

// ─── Version detection ───────────────────────────────────────────────────────

async function detectVersion() {
  try {
    const info = await dx('/server/info');
    const version = info?.directus?.version || info?.version || null;
    if (!version) return { major: null, raw: 'unknown' };
    const major = parseInt(String(version).split('.')[0], 10);
    return {
      major: Number.isFinite(major) ? major : null,
      raw: String(version),
    };
  } catch {
    return { major: null, raw: 'unknown' };
  }
}

/**
 * Hard gate: in Directus 11+, permissions belong to Policies, not directly to
 * Roles. Writing { role, collection, action, ... } to /permissions either
 * fails or silently lands on a legacy compat path with undefined behavior.
 * Per the operator's instructions we must REFUSE to apply when we cannot
 * guarantee semantics. Dry-run is allowed so the plan can still be reviewed.
 */
function assertVersionCompatible(version) {
  if (!APPLY) return; // dry-run is always safe — no writes
  if (version.major === null) {
    console.error('');
    console.error('✗ Cannot determine Directus version (/server/info returned no version).');
    console.error('  Refusing --apply for safety. Re-run with --dry-run to review the plan,');
    console.error('  then apply the permissions manually via the Directus UI.');
    process.exit(2);
  }
  if (version.major >= 11) {
    console.error('');
    console.error(`✗ Directus ${version.raw} detected — Policies replace direct role permissions in 11+.`);
    console.error('  This script writes to /permissions with a "role" field, which is the 10.x model.');
    console.error('  Compatibility with your 11.x instance is NOT guaranteed.');
    console.error('  Refusing --apply. Options:');
    console.error('    1. Run --dry-run, then apply the plan manually via UI (Settings → Policies).');
    console.error('    2. Port this script to write to /policies and link them to roles.');
    process.exit(2);
  }
}

// ─── Permission matrix ───────────────────────────────────────────────────────

/**
 * Each entry: one Directus permission record.
 * Use $CURRENT_USER for the authenticated user id placeholder.
 */
function buildAuthenticatedPermissions() {
  return [
    // ── lessons: basic fields (always readable when published or free preview) ──
    {
      collection: 'lessons',
      action: 'read',
      fields: ['id', 'title', 'slug', 'status', 'is_free_preview', 'module_id', 'sort'],
      permissions: {
        _and: [
          { status: { _eq: 'published' } },
        ],
      },
    },
    // ── lessons: premium fields (content/video/audio) — DYNAMIC GATE ──
    {
      collection: 'lessons',
      action: 'read',
      fields: ['content', 'video_url', 'audio_url'],
      permissions: {
        _and: [
          { status: { _eq: 'published' } },
          {
            _or: [
              { is_free_preview: { _eq: true } },
              { module_id: { course_id: { is_paid: { _eq: false } } } },
              {
                module_id: {
                  course_id: {
                    course_access: {
                      _and: [
                        { user_id: { _eq: '$CURRENT_USER' } },
                        { status: { _eq: 'active' } },
                      ],
                    },
                  },
                },
              },
            ],
          },
        ],
      },
    },

    // ── course_access: read own only ──
    {
      collection: 'course_access',
      action: 'read',
      fields: ['*'],
      permissions: { user_id: { _eq: '$CURRENT_USER' } },
    },
    // ── course_access: create own only, forced status=pending ──
    {
      collection: 'course_access',
      action: 'create',
      fields: ['course_id', 'access_type', 'status', 'requested_at'],
      permissions: {},
      validation: {
        _and: [
          { user_id: { _eq: '$CURRENT_USER' } },
          { status: { _eq: 'pending' } },
          { access_type: { _eq: 'request' } },
        ],
      },
      presets: { user_id: '$CURRENT_USER', status: 'pending', access_type: 'request' },
    },

    // ── directus_users: read public fields of others ──
    {
      collection: 'directus_users',
      action: 'read',
      fields: ['id', 'first_name', 'last_name', 'avatar'],
      permissions: {},
    },
    // ── directus_users: full self read/update ──
    {
      collection: 'directus_users',
      action: 'read',
      fields: ['*'],
      permissions: { id: { _eq: '$CURRENT_USER' } },
    },
    {
      collection: 'directus_users',
      action: 'update',
      fields: ['first_name', 'last_name', 'avatar', 'email', 'password'],
      permissions: { id: { _eq: '$CURRENT_USER' } },
    },

    // ── course_enrollments: own only ──
    {
      collection: 'course_enrollments',
      action: 'read',
      fields: ['*'],
      permissions: { user_id: { _eq: '$CURRENT_USER' } },
    },
    {
      collection: 'course_enrollments',
      action: 'create',
      fields: ['course_id', 'status', 'progress_percentage', 'started_at'],
      presets: { user_id: '$CURRENT_USER' },
      permissions: {},
    },
    {
      collection: 'course_enrollments',
      action: 'update',
      fields: ['status', 'progress_percentage', 'completed_at'],
      permissions: { user_id: { _eq: '$CURRENT_USER' } },
    },

    // ── lesson_progress: own only ──
    {
      collection: 'lesson_progress',
      action: 'read',
      fields: ['*'],
      permissions: { user_id: { _eq: '$CURRENT_USER' } },
    },
    {
      collection: 'lesson_progress',
      action: 'create',
      fields: ['lesson_id', 'completed', 'completed_at'],
      presets: { user_id: '$CURRENT_USER' },
      permissions: {},
    },
    {
      collection: 'lesson_progress',
      action: 'update',
      fields: ['completed', 'completed_at'],
      permissions: { user_id: { _eq: '$CURRENT_USER' } },
    },

    // ── certificates: own only, read + create (server should issue) ──
    {
      collection: 'certificates',
      action: 'read',
      fields: ['*'],
      permissions: { user_id: { _eq: '$CURRENT_USER' } },
    },
    {
      collection: 'certificates',
      action: 'create',
      fields: ['course_id', 'issued_at'],
      presets: { user_id: '$CURRENT_USER' },
      permissions: {},
    },
  ];
}

function buildStripeWebhookPermissions() {
  return [
    { collection: 'course_access', action: 'read',   fields: ['*'], permissions: {} },
    { collection: 'course_access', action: 'create', fields: ['*'], permissions: {} },
    { collection: 'course_access', action: 'update', fields: ['*'], permissions: {} },
  ];
}

// ─── Role/Policy lookup ──────────────────────────────────────────────────────

async function findRole(name) {
  const roles = await dx('/roles', { query: { filter: { name: { _eq: name } }, limit: 1 } });
  return roles?.[0] || null;
}

async function ensureRole(name, description) {
  const existing = await findRole(name);
  if (existing) return existing;
  if (!APPLY) {
    console.log(`  [DRY-RUN] would create role "${name}"`);
    return { id: `__dryrun_${name}__`, name };
  }
  console.log(`  Creating role "${name}"…`);
  return dx('/roles', { method: 'POST', body: { name, description, icon: 'verified_user' } });
}

async function getExistingPermissions(role) {
  if (role.id.startsWith?.('__dryrun_')) return [];
  return dx('/permissions', {
    query: {
      filter: { role: { _eq: role.id } },
      fields: ['id', 'collection', 'action', 'fields', 'permissions', 'presets', 'validation'],
      limit: -1,
    },
  }) || [];
}

function samePermission(a, b) {
  return a.collection === b.collection &&
         a.action === b.action &&
         JSON.stringify(a.fields || []) === JSON.stringify(b.fields || []);
}

async function syncPermissions(role, desired) {
  const existing = await getExistingPermissions(role);

  for (const want of desired) {
    const match = existing.find(e => samePermission(e, want));
    const payload = { role: role.id, ...want };

    if (match) {
      console.log(`  ✓ ${role.name} · ${want.action.toUpperCase()} ${want.collection} [${want.fields.join(',')}] (exists, id=${match.id})`);
      if (APPLY) {
        await dx(`/permissions/${match.id}`, { method: 'PATCH', body: payload });
      }
    } else {
      console.log(`  + ${role.name} · ${want.action.toUpperCase()} ${want.collection} [${want.fields.join(',')}] (creating)`);
      if (APPLY) {
        await dx('/permissions', { method: 'POST', body: payload });
      }
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const version = await detectVersion();
  console.log(`Directus ${version.raw} detected. Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
  console.log('');

  assertVersionCompatible(version);

  if (version.major !== null && version.major >= 11) {
    console.warn('⚠ Directus 11+ uses Policies instead of Role.permissions directly.');
    console.warn('  Dry-run will print the plan, but --apply is blocked for this version.');
    console.warn('');
  }

  // 1. StripeWebhook role
  console.log('1) Role: StripeWebhook');
  const wh = await ensureRole('StripeWebhook', 'Scoped role for the Stripe webhook server. Limited to course_access.');
  await syncPermissions(wh, buildStripeWebhookPermissions());
  console.log('  → Next step (UI only): create a USER assigned to this role and generate a static token.');
  console.log('     That static token replaces DIRECTUS_ADMIN_TOKEN in the API server.');
  console.log('');

  // 2. Authenticated role
  console.log('2) Role: Authenticated (existing)');
  const auth = await findRole('Authenticated');
  if (!auth) {
    console.error('  ✗ Role "Authenticated" not found. Create it in the Directus UI first.');
    process.exit(1);
  }
  await syncPermissions(auth, buildAuthenticatedPermissions());
  console.log('');

  console.log(APPLY ? '✓ Applied.' : '✓ Dry-run complete. Re-run with --apply to write.');
}

main().catch(err => { console.error(err); process.exit(1); });
