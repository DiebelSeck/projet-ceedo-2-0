/**
 * seed-ceedo-data.mjs
 *
 * Seeds the Projet Ceedo 2.0 Directus instance with three community spaces
 * (Cercle MAI, Cercle HFA, Cercle Économie) and their associated events and
 * programs.
 *
 * Safe to re-run: each item is matched by slug; existing slugs are skipped.
 *
 * Usage:
 *   1. Set DIRECTUS_TOKEN below (static admin token from Directus user profile).
 *   2. node seed-ceedo-data.mjs
 */

// ─── Config ──────────────────────────────────────────────────────────────────

const DIRECTUS_URL = 'https://admin.projetceedo20.org';
const DIRECTUS_TOKEN = 'YOUR_TOKEN'; // ← replace with a static admin token

// ─── HTTP helper ─────────────────────────────────────────────────────────────

async function directus(path, { method = 'GET', body, query } = {}) {
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
    throw new Error(`[${method} ${path}] ${res.status} ${res.statusText}: ${text}`);
  }

  // Some Directus responses (e.g. DELETE) return 204 No Content.
  if (res.status === 204) return null;
  const json = await res.json();
  return json.data;
}

// ─── Generic upsert by slug ──────────────────────────────────────────────────

async function findBySlug(collection, slug) {
  const data = await directus(`/items/${collection}`, {
    query: {
      filter: { slug: { _eq: slug } },
      fields: ['id', 'slug', 'title'],
      limit: 1,
    },
  });
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

async function createIfMissing(collection, payload, label) {
  const existing = await findBySlug(collection, payload.slug);
  if (existing) {
    console.log(`↷  Skipped ${label}: "${payload.title}" (slug "${payload.slug}" already exists, id: ${existing.id})`);
    return existing;
  }

  const created = await directus(`/items/${collection}`, {
    method: 'POST',
    body: payload,
  });
  console.log(`✓  Created ${label}: ${payload.title} (id: ${created.id})`);
  return created;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const communitiesData = [
  {
    title: 'Cercle MAI',
    slug: 'cercle-mai',
    description:
      '<p>Le <strong>Cercle MAI</strong> (Méthodologie, Archéologie, Inscriptions) réunit chercheurs et étudiants autour de l\'étude critique des sources matérielles de l\'Antiquité. Les travaux s\'articulent autour de l\'épigraphie, de la culture matérielle et des méthodes archéométriques appliquées aux corpus méditerranéens.</p><p>Les rencontres mensuelles privilégient l\'analyse de cas concrets, la confrontation des hypothèses et la transmission rigoureuse des protocoles.</p>',
    access_type: 'members',
    status: 'published',
  },
  {
    title: 'Cercle HFA',
    slug: 'cercle-hfa',
    description:
      '<p>Le <strong>Cercle HFA</strong> (Histoire, Philologie, Archives) s\'attache à la lecture critique des textes anciens et médiévaux, à la philologie comparée et à l\'exploitation raisonnée des fonds d\'archives. Le groupe accueille latinistes, hellénistes, arabisants et historiens des institutions.</p><p>Les séances alternent ateliers de traduction, présentations de recherche en cours et débats méthodologiques sur l\'établissement des sources.</p>',
    access_type: 'members',
    status: 'published',
  },
  {
    title: 'Cercle Économie',
    slug: 'cercle-economie',
    description:
      '<p>Le <strong>Cercle Économie</strong> consacre ses travaux à l\'histoire économique, à l\'économie politique classique et à l\'analyse des institutions marchandes anciennes et modernes. Les discussions s\'appuient sur des sources primaires (registres, comptes, traités) et sur la littérature scientifique contemporaine.</p><p>Le cercle organise des séminaires de lecture, des conférences invitées et des journées d\'étude inter-cercles.</p>',
    access_type: 'members',
    status: 'published',
  },
];

function eventsFor(communityIds) {
  return [
    // Cercle MAI
    {
      title: 'Séminaire — Épigraphie latine : nouvelles lectures',
      slug: 'mai-seminaire-epigraphie-latine-2026',
      description:
        '<p>Séance de travail consacrée à la relecture d\'inscriptions funéraires latines récemment publiées dans le <em>Corpus Inscriptionum Latinarum</em>. Présentation de Dr. A. Ferrand suivie d\'une discussion ouverte.</p>',
      event_type: 'seminar',
      mode: 'in-person',
      start_date: '2026-05-14T17:00:00.000Z',
      end_date: '2026-05-14T19:30:00.000Z',
      location: 'Maison de la Recherche, salle 204, Paris',
      registration_url: 'https://projetceedo20.org/inscription/mai-epigraphie',
      community: communityIds['cercle-mai'],
      status: 'published',
    },
    {
      title: 'Atelier — Archéométrie des céramiques antiques',
      slug: 'mai-atelier-archeometrie-2026',
      description:
        '<p>Atelier pratique sur les méthodes d\'analyse pétrographique et de fluorescence X appliquées aux céramiques de Méditerranée occidentale. Sessions limitées à 15 participants.</p>',
      event_type: 'workshop',
      mode: 'in-person',
      start_date: '2026-06-20T09:30:00.000Z',
      end_date: '2026-06-20T17:00:00.000Z',
      location: 'Laboratoire CRPAA, Bordeaux',
      registration_url: 'https://projetceedo20.org/inscription/mai-archeometrie',
      community: communityIds['cercle-mai'],
      status: 'published',
    },

    // Cercle HFA
    {
      title: 'Conférence — Manuscrits arabes des bibliothèques européennes',
      slug: 'hfa-conference-manuscrits-arabes-2026',
      description:
        '<p>Conférence en ligne du Pr. M. Lasri (EPHE) sur la circulation des manuscrits arabes médiévaux dans les fonds européens entre le XVIe et le XIXe siècle.</p>',
      event_type: 'conference',
      mode: 'online',
      start_date: '2026-05-28T18:00:00.000Z',
      end_date: '2026-05-28T20:00:00.000Z',
      online_url: 'https://meet.projetceedo20.org/hfa-manuscrits',
      registration_url: 'https://projetceedo20.org/inscription/hfa-manuscrits',
      community: communityIds['cercle-hfa'],
      status: 'published',
    },
    {
      title: 'Journée d\'étude — Philologie et critique des sources',
      slug: 'hfa-journee-philologie-2026',
      description:
        '<p>Journée d\'étude réunissant six intervenants autour de l\'établissement critique des sources médiévales latines et grecques. Format hybride : présentiel à Lyon, retransmission en ligne.</p>',
      event_type: 'study-day',
      mode: 'hybrid',
      start_date: '2026-09-12T09:00:00.000Z',
      end_date: '2026-09-12T18:00:00.000Z',
      location: 'ENS de Lyon, amphithéâtre Descartes',
      online_url: 'https://meet.projetceedo20.org/hfa-philologie',
      registration_url: 'https://projetceedo20.org/inscription/hfa-philologie',
      community: communityIds['cercle-hfa'],
      status: 'published',
    },

    // Cercle Économie
    {
      title: 'Séminaire — Adam Smith et la théorie de la valeur',
      slug: 'economie-seminaire-adam-smith-2026',
      description:
        '<p>Lecture commentée du Livre I de la <em>Richesse des Nations</em>, animée par Dr. C. Bovary. Pré-lecture des chapitres I-V recommandée.</p>',
      event_type: 'reading-circle',
      mode: 'online',
      start_date: '2026-05-22T19:00:00.000Z',
      end_date: '2026-05-22T21:00:00.000Z',
      online_url: 'https://meet.projetceedo20.org/eco-smith',
      registration_url: 'https://projetceedo20.org/inscription/eco-smith',
      community: communityIds['cercle-economie'],
      status: 'published',
    },
    {
      title: 'Table ronde — Histoire des institutions marchandes',
      slug: 'economie-table-ronde-institutions-2026',
      description:
        '<p>Table ronde réunissant historiens et économistes sur l\'émergence des institutions marchandes en Méditerranée (XIIIe-XVIIe s.).</p>',
      event_type: 'roundtable',
      mode: 'in-person',
      start_date: '2026-10-08T17:30:00.000Z',
      end_date: '2026-10-08T20:00:00.000Z',
      location: 'EHESS, salle Lombard, Paris',
      registration_url: 'https://projetceedo20.org/inscription/eco-institutions',
      community: communityIds['cercle-economie'],
      status: 'published',
    },
  ];
}

function programsFor(communityIds) {
  return [
    // Cercle MAI
    {
      title: 'Initiation à l\'épigraphie latine',
      slug: 'mai-programme-epigraphie-latine',
      description:
        '<p>Programme de douze séances couvrant les fondamentaux de la lecture des inscriptions latines : abréviations, formulaires, datation, édition critique. Travaux dirigés sur corpus réel.</p>',
      level: 'intermediate',
      format: 'cohort',
      community: communityIds['cercle-mai'],
      status: 'published',
    },
    {
      title: 'Méthodes de l\'archéologie de terrain',
      slug: 'mai-programme-archeologie-terrain',
      description:
        '<p>Cycle long alternant cours théoriques (stratigraphie, enregistrement, post-fouille) et stages de terrain encadrés sur sites partenaires.</p>',
      level: 'advanced',
      format: 'fieldwork',
      community: communityIds['cercle-mai'],
      status: 'published',
    },

    // Cercle HFA
    {
      title: 'Atelier permanent de traduction grecque',
      slug: 'hfa-programme-traduction-grecque',
      description:
        '<p>Atelier hebdomadaire de traduction et commentaire de textes grecs classiques et patristiques. Niveau intermédiaire requis (deux années de grec ancien).</p>',
      level: 'intermediate',
      format: 'workshop',
      community: communityIds['cercle-hfa'],
      status: 'published',
    },
    {
      title: 'Paléographie et codicologie médiévales',
      slug: 'hfa-programme-paleographie-medievale',
      description:
        '<p>Programme structuré sur deux semestres : écritures latines du VIIIe au XVe siècle, structure du codex, datation et localisation des manuscrits.</p>',
      level: 'advanced',
      format: 'cohort',
      community: communityIds['cercle-hfa'],
      status: 'published',
    },

    // Cercle Économie
    {
      title: 'Lectures de l\'économie politique classique',
      slug: 'economie-programme-lectures-classiques',
      description:
        '<p>Cycle de lectures dirigées des grands textes de l\'économie politique classique : Smith, Ricardo, Mill, Marx. Une œuvre par trimestre.</p>',
      level: 'beginner',
      format: 'reading-group',
      community: communityIds['cercle-economie'],
      status: 'published',
    },
    {
      title: 'Histoire économique de la Méditerranée moderne',
      slug: 'economie-programme-histoire-mediterranee',
      description:
        '<p>Séminaire de recherche consacré aux circulations commerciales, monétaires et institutionnelles en Méditerranée du XVIe au XIXe siècle. Travaux sur sources primaires.</p>',
      level: 'advanced',
      format: 'seminar',
      community: communityIds['cercle-economie'],
      status: 'published',
    },
  ];
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!DIRECTUS_TOKEN || DIRECTUS_TOKEN === 'YOUR_TOKEN') {
    console.error('✗  Please set DIRECTUS_TOKEN at the top of this script before running.');
    process.exit(1);
  }

  console.log(`\n→ Seeding Directus at ${DIRECTUS_URL}\n`);

  // 1. Communities ───────────────────────────────────────────────────────────
  console.log('— Step 1/3: Communities —');
  const communityIds = {};
  for (const community of communitiesData) {
    try {
      const created = await createIfMissing('community_spaces', community, 'community');
      communityIds[community.slug] = created.id;
    } catch (err) {
      console.error(`✗  Failed to create community "${community.title}":`, err.message);
    }
  }

  // Sanity check: ensure every slug now has an ID before linking events/programs.
  const missing = communitiesData.filter((c) => !communityIds[c.slug]);
  if (missing.length > 0) {
    console.error(`\n✗  Aborting: missing community IDs for: ${missing.map((c) => c.slug).join(', ')}`);
    process.exit(1);
  }

  // 2. Events ────────────────────────────────────────────────────────────────
  console.log('\n— Step 2/3: Events —');
  for (const event of eventsFor(communityIds)) {
    try {
      await createIfMissing('events', event, 'event');
    } catch (err) {
      console.error(`✗  Failed to create event "${event.title}":`, err.message);
    }
  }

  // 3. Programs ──────────────────────────────────────────────────────────────
  console.log('\n— Step 3/3: Programs —');
  for (const program of programsFor(communityIds)) {
    try {
      await createIfMissing('programs', program, 'program');
    } catch (err) {
      console.error(`✗  Failed to create program "${program.title}":`, err.message);
    }
  }

  console.log('\n✓  Seeding complete.\n');
}

main().catch((err) => {
  console.error('\n✗  Fatal error:', err);
  process.exit(1);
});

// ─── Usage ───────────────────────────────────────────────────────────────────
//
//   node seed-ceedo-data.mjs
//
