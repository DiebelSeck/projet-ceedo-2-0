/**
 * Directus Migration Script — Institutional Operational Data Model
 * 
 * Creates 5 collections for Académie, Événements, and Communauté:
 *   - programs
 *   - courses (→ programs)
 *   - course_sessions (→ courses)
 *   - events
 *   - community_spaces
 * 
 * DOES NOT modify existing collections (articles, tags, tag_types, categories, pages).
 * DOES NOT change public permissions.
 * DOES NOT create sample records.
 * 
 * Usage:
 *   node scripts/migrate-institutional.mjs YOUR_ADMIN_TOKEN
 * 
 * To get your admin token:
 *   1. Log into https://admin.projetceedo20.org
 *   2. Go to Settings → (your profile icon top-left) → Token
 *   3. Generate or copy a static admin token
 *   OR pass email:password and the script will authenticate.
 */

const DIRECTUS_URL = 'https://admin.projetceedo20.org';

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

let TOKEN = process.argv[2];

if (!TOKEN) {
  console.error('\n  Usage: node scripts/migrate-institutional.mjs <ADMIN_TOKEN>\n');
  console.error('  You can also pass email:password and the script will log in.\n');
  process.exit(1);
}

// If token looks like email:password, authenticate first
if (TOKEN.includes(':') && TOKEN.includes('@')) {
  const [email, password] = [TOKEN.split(':')[0], TOKEN.split(':').slice(1).join(':')];
  console.log(`\n→ Authenticating as ${email}...`);
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    console.error(`  ✗ Authentication failed: ${res.status}`);
    process.exit(1);
  }
  const data = await res.json();
  TOKEN = data.data.access_token;
  console.log('  ✓ Authenticated\n');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function apiCall(method, path, body = null) {
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${DIRECTUS_URL}${path}`, opts);
  const text = await res.text();

  if (!res.ok) {
    // If collection already exists, skip gracefully
    if (res.status === 400 && text.includes('already exists')) {
      return { skipped: true };
    }
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }

  return text ? JSON.parse(text) : {};
}

async function createCollection(collection, meta = {}) {
  const label = meta.label || collection;
  try {
    await apiCall('POST', '/collections', {
      collection,
      meta: {
        icon: meta.icon || 'folder',
        note: meta.note || null,
        hidden: false,
        singleton: false,
        sort_field: meta.sort_field || null,
        archive_field: 'status',
        archive_value: 'archived',
        unarchive_value: 'draft',
        ...meta,
      },
      schema: {},
    });
    console.log(`  ✓ Collection "${collection}" created`);
    return true;
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log(`  ⊘ Collection "${collection}" already exists — skipping`);
      return false;
    }
    throw e;
  }
}

async function createField(collection, field, spec) {
  try {
    await apiCall('POST', `/fields/${collection}`, {
      field,
      type: spec.type,
      schema: spec.schema || {},
      meta: spec.meta || {},
    });
    console.log(`    + ${collection}.${field}`);
  } catch (e) {
    if (e.message.includes('already exists') || e.message.includes('already been')) {
      console.log(`    ⊘ ${collection}.${field} already exists — skipping`);
    } else {
      throw e;
    }
  }
}

async function createRelation(manyCollection, manyField, oneCollection) {
  try {
    await apiCall('POST', '/relations', {
      collection: manyCollection,
      field: manyField,
      related_collection: oneCollection,
      meta: {
        sort_field: null,
      },
      schema: {
        on_delete: 'SET NULL',
      },
    });
    console.log(`    ↗ ${manyCollection}.${manyField} → ${oneCollection}`);
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log(`    ⊘ Relation ${manyCollection}.${manyField} → ${oneCollection} already exists`);
    } else {
      throw e;
    }
  }
}

// ---------------------------------------------------------------------------
// Field Builders (DRY)
// ---------------------------------------------------------------------------

function stringField(required = false) {
  return {
    type: 'string',
    schema: { is_nullable: !required, max_length: 255 },
    meta: { interface: 'input', width: 'full', required },
  };
}

function slugField() {
  return {
    type: 'string',
    schema: { is_nullable: false, is_unique: true, max_length: 255 },
    meta: { interface: 'input', width: 'half', required: true, options: { slug: true } },
  };
}

function richTextField() {
  return {
    type: 'text',
    schema: { is_nullable: true },
    meta: { interface: 'input-rich-text-html', width: 'full' },
  };
}

function selectField(choices, defaultValue = null) {
  return {
    type: 'string',
    schema: { is_nullable: true, default_value: defaultValue, max_length: 50 },
    meta: {
      interface: 'select-dropdown',
      width: 'half',
      options: {
        choices: choices.map((c) => ({
          text: c.charAt(0).toUpperCase() + c.slice(1),
          value: c,
        })),
      },
    },
  };
}

function statusField() {
  return {
    type: 'string',
    schema: { is_nullable: false, default_value: 'draft', max_length: 20 },
    meta: {
      interface: 'select-dropdown',
      width: 'half',
      display: 'labels',
      options: {
        choices: [
          { text: 'Draft', value: 'draft', foreground: '#FFFFFF', background: '#6B7280' },
          { text: 'Published', value: 'published', foreground: '#FFFFFF', background: '#059669' },
          { text: 'Archived', value: 'archived', foreground: '#FFFFFF', background: '#D97706' },
        ],
      },
    },
  };
}

function datetimeField(required = false) {
  return {
    type: 'timestamp',
    schema: { is_nullable: !required },
    meta: { interface: 'datetime', width: 'half', required },
  };
}

function m2oField(relatedCollection, required = false) {
  return {
    type: 'integer',
    schema: { is_nullable: !required },
    meta: {
      interface: 'select-dropdown-m2o',
      width: 'half',
      required,
      special: ['m2o'],
      options: { template: '{{title}}' },
    },
  };
}

// ---------------------------------------------------------------------------
// Migration
// ---------------------------------------------------------------------------

console.log('═══════════════════════════════════════════════════════');
console.log('  Directus Migration — Institutional Operational Model');
console.log('═══════════════════════════════════════════════════════\n');

// Verify connection
try {
  await apiCall('GET', '/server/info');
  console.log(`→ Connected to ${DIRECTUS_URL}\n`);
} catch {
  console.error('  ✗ Cannot connect to Directus. Check URL and token.');
  process.exit(1);
}

// ─── 1. PROGRAMS ───────────────────────────────────────────────────────────

console.log('1/5  Programs (Académie)');
await createCollection('programs', {
  icon: 'school',
  note: 'Programmes de formation structurés — Académie Ceedo',
});
await createField('programs', 'title', stringField(true));
await createField('programs', 'slug', slugField());
await createField('programs', 'description', richTextField());
await createField('programs', 'level', selectField(['initiation', 'approfondissement', 'production']));
await createField('programs', 'format', selectField(['online', 'presentiel', 'hybride']));
await createField('programs', 'status', statusField());

// ─── 2. COURSES ────────────────────────────────────────────────────────────

console.log('\n2/5  Courses');
await createCollection('courses', {
  icon: 'menu_book',
  note: 'Cours individuels rattachés aux programmes',
});
await createField('courses', 'title', stringField(true));
await createField('courses', 'slug', slugField());
await createField('courses', 'program', m2oField('programs', false));
await createField('courses', 'description', richTextField());
await createField('courses', 'duration', stringField(false));
await createField('courses', 'status', statusField());

// Relation: courses.program → programs
await createRelation('courses', 'program', 'programs');

// ─── 3. COURSE SESSIONS ───────────────────────────────────────────────────

console.log('\n3/5  Course Sessions');
await createCollection('course_sessions', {
  icon: 'event_note',
  note: 'Sessions planifiées de cours',
});
await createField('course_sessions', 'course', m2oField('courses', true));
await createField('course_sessions', 'start_date', datetimeField(false));
await createField('course_sessions', 'end_date', datetimeField(false));
await createField('course_sessions', 'mode', selectField(['online', 'presentiel', 'hybride']));
await createField('course_sessions', 'location', stringField(false));
await createField('course_sessions', 'registration_url', stringField(false));
await createField('course_sessions', 'status', statusField());

// Relation: course_sessions.course → courses
await createRelation('course_sessions', 'course', 'courses');

// ─── 4. EVENTS ─────────────────────────────────────────────────────────────

console.log('\n4/5  Events (Événements)');
await createCollection('events', {
  icon: 'event',
  note: 'Conférences, colloques, webinaires et rencontres',
});
await createField('events', 'title', stringField(true));
await createField('events', 'slug', slugField());
await createField('events', 'description', richTextField());
await createField('events', 'event_type', selectField([
  'conference', 'webinaire', 'seminar', 'atelier', 'colloque', 'live',
]));
await createField('events', 'mode', selectField(['online', 'presentiel', 'hybride']));
await createField('events', 'start_date', datetimeField(true));
await createField('events', 'end_date', datetimeField(false));
await createField('events', 'location', stringField(false));
await createField('events', 'online_url', stringField(false));
await createField('events', 'registration_url', stringField(false));
await createField('events', 'status', statusField());

// ─── 5. COMMUNITY SPACES ──────────────────────────────────────────────────

console.log('\n5/5  Community Spaces (Communauté)');
await createCollection('community_spaces', {
  icon: 'groups',
  note: 'Espaces communautaires en ligne ou physiques',
});
await createField('community_spaces', 'title', stringField(true));
await createField('community_spaces', 'slug', slugField());
await createField('community_spaces', 'description', richTextField());
await createField('community_spaces', 'access_type', selectField(['public', 'members', 'private']));
await createField('community_spaces', 'platform_url', stringField(false));
await createField('community_spaces', 'status', statusField());

// ─── SUMMARY ───────────────────────────────────────────────────────────────

console.log('\n═══════════════════════════════════════════════════════');
console.log('  Migration complete');
console.log('═══════════════════════════════════════════════════════');
console.log(`
  Created:
    ✓ programs          (Académie)
    ✓ courses           (→ programs)
    ✓ course_sessions   (→ courses)
    ✓ events            (Événements)
    ✓ community_spaces  (Communauté)

  Relations:
    ✓ courses.program → programs
    ✓ course_sessions.course → courses

  NOT modified:
    • articles, tags, tag_types, categories, pages
    • Public role permissions
    • Frontend code

  Next steps:
    1. Verify collections in Directus admin panel
    2. Adjust field ordering/display in Settings → Data Model
    3. Add public read permissions when ready for frontend
`);
