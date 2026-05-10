export const FEATURED_PUBLICATIONS = [
  {
    id: 'pub-001',
    type: 'article',
    category: 'Histoire',
    title: 'Les fondements épistémiques de la civilisation kémitique',
    excerpt:
      'Une relecture critique des sources primaires de la Vallée du Nil, confrontée aux interprétations contemporaines de l\'égyptologie classique.',
    author: { name: 'Dr. Aminata Diallo', affiliation: 'Université de Dakar' },
    date: '2025-11-12',
    readingTime: 18,
    featured: true,
  },
  {
    id: 'pub-002',
    type: 'dossier',
    category: 'Philosophie',
    title: 'Ma\'at et justice sociale : héritages et actualité',
    excerpt:
      'Dossier thématique réunissant sept contributions sur la notion de Ma\'at comme principe d\'ordre, d\'équité et d\'harmonie dans la pensée africaine ancienne.',
    author: { name: 'Collectif éditorial', affiliation: 'Projet Ceedo' },
    date: '2025-10-03',
    readingTime: 45,
    featured: true,
  },
  {
    id: 'pub-003',
    type: 'recension',
    category: 'Sciences humaines',
    title: 'Recension : "African Philosophy: Myth and Reality" de Paulin Hountondji',
    excerpt:
      'Analyse critique et contextualisation d\'un ouvrage fondateur pour la philosophie africaine contemporaine, à la lumière des débats académiques récents.',
    author: { name: 'Prof. Jean-Baptiste Nkosi', affiliation: 'Institut Cheikh Anta Diop' },
    date: '2025-09-20',
    readingTime: 12,
    featured: false,
  },
  {
    id: 'pub-004',
    type: 'article',
    category: 'Linguistique',
    title: 'Méroïtique et langues nilo-sahariennes : filiations et convergences',
    excerpt:
      'Étude comparative des structures grammaticales et du lexique entre le méroïtique antique et les familles linguistiques contemporaines d\'Afrique subsaharienne.',
    author: { name: 'Dr. Khoukha Ould Meyine', affiliation: 'EHESS Paris' },
    date: '2025-08-15',
    readingTime: 22,
    featured: false,
  },
]

export const PUBLICATION_AXES = [
  {
    id: 'axe-histoire',
    icon: '⊕',
    title: 'Histoire & Archéologie',
    description:
      'Restitution rigoureuse des sources, relectures critiques et nouvelles hypothèses sur les civilisations africaines anciennes et médiévales.',
  },
  {
    id: 'axe-philosophie',
    icon: '⊗',
    title: 'Philosophie & Épistémologie',
    description:
      'Exploration des systèmes de pensée africains, de leurs fondements logiques et de leur pertinence dans le débat intellectuel mondial.',
  },
  {
    id: 'axe-sciences',
    icon: '⊕',
    title: 'Sciences & Savoirs techniques',
    description:
      'Documentation des savoirs scientifiques, mathématiques et techniques développés sur le continent africain à travers les âges.',
  },
  {
    id: 'axe-arts',
    icon: '⊗',
    title: 'Arts, Langues & Littératures',
    description:
      'Étude des expressions artistiques, des patrimoines linguistiques et des traditions littéraires orales et écrites de l\'Afrique.',
  },
]
