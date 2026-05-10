import { getToken } from './auth';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://admin.projetceedo20.org';

/**
 * Authenticated request helper for editorial endpoints (Author policy).
 * Sends the bearer token from auth.js. Throws with a useful message including
 * Directus's `errors[0].message` when present.
 */
async function authFetch(path, { method = 'GET', body } = {}) {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = `${method} ${path} failed (${res.status})`;
    try {
      const errJson = await res.json();
      const directusMsg = errJson?.errors?.[0]?.message;
      if (directusMsg) message = directusMsg;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  const json = await res.json();
  return json?.data ?? json;
}


/**
 * Helper to build common fetch options
 */
async function apiFetch(path, params = {}) {
  const url = new URL(`${DIRECTUS_URL}${path}`);
  
  // Helper to recursively build Directus-style bracket parameters
  const addToQuery = (key, value, prefix = '') => {
    if (value === undefined || value === null) return;
    const fullKey = prefix ? `${prefix}[${key}]` : key;

    if (Array.isArray(value)) {
      // Directus handles fields and sort as comma-separated strings
      if (key === 'fields' || key === 'sort') {
        url.searchParams.append(fullKey, value.join(','));
      } else {
        // Other arrays (like _or or _and in filters) use bracket index syntax
        value.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            addToQuery(index, item, fullKey);
          } else {
            url.searchParams.append(`${fullKey}[${index}]`, item);
          }
        });
      }
    } else if (typeof value === 'object' && value !== null) {
      // Recursively handle objects (especially useful for filters)
      Object.keys(value).forEach(subKey => {
        addToQuery(subKey, value[subKey], fullKey);
      });
    } else {
      // Primitive values
      url.searchParams.append(fullKey, value);
    }
  };

  Object.keys(params).forEach(key => {
    addToQuery(key, params[key]);
  });


  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error('Directus API Fetch Error:', error);
    throw error;
  }
}

/**
 * Normalizes an article from Directus API to a stable frontend shape
 */
function normalizeArticle(article) {
  if (!article) return null;

  const firstName = article.Author?.first_name || '';
  const lastName = article.Author?.last_name || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Auteur inconnu';

  const tags = article.tags?.map(t => ({
    id: t.tags_id?.id,
    name: t.tags_id?.name,
    slug: t.tags_id?.slug,
    type: t.tags_id?.type ? {
      id: t.tags_id.type.id,
      name: t.tags_id.type.name,
      slug: t.tags_id.type.slug
    } : null
  })).filter(t => t.id) || [];

  return {
    id: article.id,
    title: article.title || 'Sans titre',
    slug: article.slug,
    excerpt: article.excerpt || '',
    content: article.content || '',
    readingTime: api.computeReadingTime(article.content),
    metaTitle: article.meta_title || article.title,
    metaDescription: article.meta_description || article.excerpt,
    featuredImage: article.featured_image,
    category: article.category ? {
      id: article.category.id,
      name: article.category.name,
      slug: article.category.slug
    } : null,
    author: article.Author ? {
      id: article.Author.id,
      firstName,
      lastName,
      fullName
    } : null,
    tags,
    dateCreated: article.date_created,
    references: article.references || [],
    footnotes: article.footnotes || null,
    dossier: article.dossier || null,
    related_articles: article.related_articles || []
  };
}

/**
 * Normalizes a library document from Directus API
 */
function normalizeLibraryDocument(doc) {
  if (!doc) return null;

  // For library documents, we prioritize metadata if available
  // or fall back to article fields
  return {
    id: doc.id,
    title: doc.title || 'Sans titre',
    author: doc.author || (doc.Author ? `${doc.Author.first_name} ${doc.Author.last_name}` : 'Auteur inconnu'),
    year: doc.year || (doc.date_created ? new Date(doc.date_created).getFullYear() : 'N/A'),
    abstract: doc.excerpt || doc.abstract || '',
    documentType: doc.document_type || (doc.tags?.find(t => t.tags_id?.type?.slug === 'type-contenu')?.tags_id?.name) || 'Document',
    sourceType: doc.source_type || 'secondaire',
    citation: doc.citation || '',
    context: doc.context || '',
    language: doc.language || 'fr',
    fileUrl: doc.file ? `${DIRECTUS_URL}/assets/${doc.file}` : null,
    relatedCorpus: doc.tags?.filter(t => t.tags_id?.type?.slug === 'corpus').map(t => ({
      id: t.tags_id.id,
      title: t.tags_id.name,
      slug: t.tags_id.slug
    })) || [],
    tags: doc.tags?.map(t => ({
      id: t.tags_id?.id,
      name: t.tags_id?.name,
      slug: t.tags_id?.slug,
      type: t.tags_id?.type?.name
    })) || []
  };
}

/**
 * Normalizes a page record from the Directus `pages` collection
 */
function normalizePage(page) {
  if (!page) return null;
  return {
    id: page.id,
    title: page.title || '',
    slug: page.slug || '',
    headline: page.headline || page.title || '',
    intro: page.intro || null,
    content: page.content || null,
    metaTitle: page.meta_title || page.title || '',
    metaDescription: page.meta_description || page.intro || '',
    dateCreated: page.date_created || null,
    dateUpdated: page.date_updated || null,
  };
}

/**
 * Normalizes a community space from Directus API
 */
function normalizeCommunitySpace(space) {
  if (!space) return null;
  return {
    id: space.id,
    title: space.title || '',
    slug: space.slug || '',
    description: space.description || null,
    accessType: space.access_type || 'public',
    dateCreated: space.date_created || null,
    dateUpdated: space.date_updated || null,
  };
}

/**
 * Normalizes an event from Directus API
 */
function normalizeEvent(event) {
  if (!event) return null;
  return {
    id: event.id,
    title: event.title || 'Sans titre',
    slug: event.slug || null,
    description: event.description || null,
    eventType: event.event_type || null,
    mode: event.mode || null,
    startDate: event.start_date || null,
    endDate: event.end_date || null,
    location: event.location || null,
    onlineUrl: event.online_url || null,
    registrationUrl: event.registration_url || null,
    communitySlug: event.community?.slug || null,
  };
}

/**
 * Normalizes a program from Directus API
 */
function normalizeProgram(program) {
  if (!program) return null;
  return {
    id: program.id,
    title: program.title || 'Sans titre',
    slug: program.slug || null,
    description: program.description || null,
    level: program.level || null,
    format: program.format || null,
    communitySlug: program.community?.slug || null,
  };
}

/**
 * Publications API
 */
export const api = {
  /**
   * Get list of articles
   */
  async getArticles({ page = 1, limit = 12, category, search } = {}) {
    const params = {
      fields: [
        'id', 'title', 'slug', 'excerpt', 'meta_title', 'meta_description', 'featured_image', 'date_created',
        'category.id', 'category.name', 'category.slug',
        'Author.id', 'Author.first_name', 'Author.last_name',
        'tags.tags_id.id', 'tags.tags_id.name', 'tags.tags_id.slug',
        'tags.tags_id.type.id', 'tags.tags_id.type.name', 'tags.tags_id.type.slug'
      ],
      filter: {
        status: { _eq: 'published' }
      },
      sort: ['-date_created'],
      limit,
      page,
      meta: 'total_count'
    };

    if (category && category !== 'Tous') {
      params.filter.category = { slug: { _eq: category } };
    }

    if (search) {
      params.filter._or = [
        { title: { _icontains: search } },
        { excerpt: { _icontains: search } }
      ];
    }

    const data = await apiFetch('/items/articles', params);
    return data ? data.map(normalizeArticle) : [];
  },

  /**
   * Get a single article by its slug
   */
  async getArticleBySlug(slug) {
    const data = await apiFetch('/items/articles', {
      filter: {
        slug: { _eq: slug },
        status: { _eq: 'published' }
      },
      fields: [
        'id',
        'title',
        'slug',
        'excerpt',
        'content',
        'meta_title',
        'meta_description',
        'featured_image',
        'date_created',
        'category.id',
        'category.name',
        'category.slug',
        'Author.id',
        'Author.first_name',
        'Author.last_name',
        'tags.tags_id.id',
        'tags.tags_id.name',
        'tags.tags_id.slug',
        'tags.tags_id.type.id',
        'tags.tags_id.type.name',
        'tags.tags_id.type.slug'
      ],
      limit: 1
    });

    return data && data.length > 0 ? normalizeArticle(data[0]) : null;
  },


  /**
   * Get a single institutional page by its slug from the `pages` collection.
   * Only returns published pages.
   */
  async getPageBySlug(slug) {
    const data = await apiFetch('/items/pages', {
      filter: {
        slug: { _eq: slug },
        status: { _eq: 'published' },
      },
      fields: [
        'id',
        'title',
        'slug',
        'headline',
        'intro',
        'content',
        'meta_title',
        'meta_description',
        'date_created',
        'date_updated',
      ],
      limit: 1,
    });
    return data?.[0] ? normalizePage(data[0]) : null;
  },

  /**
   * Get categories list for filtering
   */
  async getCategories() {
    return apiFetch('/items/categories', {
      fields: ['id', 'name', 'slug'],
      sort: ['name']
    });
  },

  /**
   * Get a specific dossier (Corpus) by slug
   */
  async getDossierBySlug(slug) {
    // 1. Fetch tag info for the dossier/corpus
    const tagData = await apiFetch('/items/tags', {
      filter: {
        slug: { _eq: slug },
        type: { slug: { _eq: 'corpus' } }
      },
      fields: ['id', 'name', 'slug', 'description', 'intro'],
      limit: 1
    });

    if (!tagData || tagData.length === 0) return null;
    const tag = tagData[0];

    // 2. Fetch articles associated with this corpus tag
    const articlesData = await apiFetch('/items/articles', {
      filter: {
        status: { _eq: 'published' },
        tags: {
          tags_id: {
            slug: { _eq: slug }
          }
        }
      },
      fields: [
        'id', 'title', 'slug', 'excerpt', 'featured_image', 'date_created',
        'Author.id', 'Author.first_name', 'Author.last_name',
        'category.name',
        'tags.tags_id.id', 'tags.tags_id.name', 'tags.tags_id.slug', 'tags.tags_id.type.name'
      ],
      sort: ['-date_created']
    });

    return {
      id: tag.id,
      title: tag.name,
      slug: tag.slug,
      editorial_intro: tag.intro || tag.description,
      coordinator: 'Recherche Ceedo',
      date_published: null,
      articles: articlesData ? articlesData.map(normalizeArticle) : []
    };
  },

  /**
   * Get all dossiers (Corpus) - Now fetched from tags collection
   */
  async getDossiers({ limit = 10 } = {}) {
    const data = await apiFetch('/items/tags', {
      filter: {
        type: { slug: { _eq: 'corpus' } }
      },
      fields: ['id', 'name', 'slug', 'description', 'intro'],
      limit
    });

    return data ? data.map(tag => ({
      id: tag.id,
      title: tag.name,
      slug: tag.slug,
      editorial_intro: tag.intro || tag.description
    })) : [];
  },

  /**
   * Get related dossiers (Corpus) based on semantic proximity
   * Logic: Weighted scoring based on shared tags in articles
   */
  async getRelatedDossiers(currentCorpus, limit = 3) {
    // 1. Fetch all dossiers (tags of type 'corpus') with their articles and tags for scoring
    const allDossiersRaw = await apiFetch('/items/tags', {
      filter: {
        type: { slug: { _eq: 'corpus' } },
        slug: { _neq: currentCorpus.slug }
      },
      fields: [
        'id', 'name', 'slug', 'description', 'intro',
        'articles.articles_id.tags.tags_id.id',
        'articles.articles_id.tags.tags_id.type.name'
      ],
      limit: 100
    });

    if (!allDossiersRaw || allDossiersRaw.length === 0) return [];

    // Normalize raw data to match the expected dossier structure for scoring
    const allDossiers = allDossiersRaw.map(tag => ({
      id: tag.id,
      title: tag.name,
      slug: tag.slug,
      description: tag.description,
      intro: tag.intro,
      articles: tag.articles?.map(a => a.articles_id) || []
    }));

    // 2. Extract current corpus fingerprint (unique tags by ID)
    const currentTagsWithType = currentCorpus.articles?.flatMap(a => 
      a.tags?.map(t => ({ id: t.id, type: t.type?.name })) || []
    ) || [];

    // 3. Connection rules: Hierarchical Semantic Logic (Boolean)
    const validateConnection = (targetDossier) => {
      const targetTags = targetDossier.articles?.flatMap(a => 
        a.tags?.map(t => ({ id: t.tags_id?.id, type: t.tags_id?.type?.name })) || []
      ) || [];

      const sharedAxes = new Set();
      let hasSharedDiscipline = false;

      targetTags.forEach(tag => {
        const match = currentTagsWithType.find(t => t.id === tag.id);
        if (match) {
          sharedAxes.add(match.type);
          if (match.type === 'Discipline') hasSharedDiscipline = true;
        }
      });

      // Rule 2: Same Discipline OR Rule 3: 2+ different semantic axes
      return hasSharedDiscipline || sharedAxes.size >= 2;
    };

    // 4. Filter and return
    const connected = allDossiers
      .filter(validateConnection)
      .map(tag => ({
        id: tag.id,
        title: tag.title,
        slug: tag.slug,
        editorial_intro: tag.intro || tag.description
      }))
      .sort((a, b) => b.id - a.id); // Simple chronological sort for valid matches

    return connected.slice(0, limit);
  },



  /**
   * Get detail info for a specific tag including optional intro/description
   */
  async getTagBySlug(typeSlug, tagSlug) {
    const data = await apiFetch('/items/tags', {
      filter: {
        slug: { _eq: tagSlug },
        type: { slug: { _eq: typeSlug } }
      },
      fields: ['id', 'name', 'slug', 'intro', 'description', 'type.id', 'type.name', 'type.slug', 'type.intro'],
      limit: 1
    });
    return data?.[0] || null;
  },

  /**
   * Get all tag types and their nested tags
   */
  async getTagTypesWithTags() {
    const tags = await apiFetch('/items/tags', {
      fields: ['id', 'name', 'slug', 'type.id', 'type.name', 'type.slug'],
      limit: -1
    });
    
    if (!tags) return {};
    
    return tags.reduce((acc, tag) => {
      const type = tag.type || { name: 'Non classé', slug: 'non-classe' };
      if (!acc[type.slug]) {
        acc[type.slug] = {
          id: type.id,
          name: type.name,
          slug: type.slug,
          tags: []
        };
      }
      acc[type.slug].tags.push(tag);
      return acc;
    }, {});
  },

  /**
   * Get sibling tags (other tags in the same semantic type)
   */
  async getSiblingTags(typeSlug, currentTagSlug) {
    const data = await apiFetch('/items/tags', {
      filter: {
        type: { slug: { _eq: typeSlug } },
        slug: { _neq: currentTagSlug }
      },
      fields: ['id', 'name', 'slug', 'type.slug'],
      limit: 10
    });
    return data || [];
  },

  /**
   * Get articles filtered by a semantic tag (tag slug + type slug)
   */
  async getArticlesBySemanticTag(typeSlug, tagSlug) {
    const params = {
      fields: [
        'id', 'title', 'slug', 'excerpt', 'featured_image', 'date_created',
        'category.id', 'category.name', 'category.slug',
        'Author.id', 'Author.first_name', 'Author.last_name',
        'tags.tags_id.id', 'tags.tags_id.name', 'tags.tags_id.slug',
        'tags.tags_id.type.id', 'tags.tags_id.type.name', 'tags.tags_id.type.slug'
      ],
      filter: {
        status: { _eq: 'published' },
        tags: {
          tags_id: {
            slug: { _eq: tagSlug },
            type: { slug: { _eq: typeSlug } }
          }
        }
      },
      sort: ['-date_created'],
      limit: 50
    };

    const data = await apiFetch('/items/articles', params);
    return data ? data.map(normalizeArticle) : [];
  },

  /**
   * Get related articles by semantic axes
   * Logic: prioritized by Discipline, then Period, then Approach
   */
  async getRelatedArticlesBySemanticAxis(article, limit = 3) {
    if (!article?.tags?.length) return [];

    const tagsByType = this.groupTagsByType(article.tags);
    const priorities = ['Discipline', 'Période', 'Approche'];
    const matchingTags = [];

    priorities.forEach(p => {
      if (tagsByType[p]) {
        matchingTags.push(...tagsByType[p].map(t => t.id));
      }
    });

    if (matchingTags.length === 0) {
      matchingTags.push(...article.tags.map(t => t.id));
    }

    const params = {
      fields: [
        'id', 'title', 'slug', 'excerpt', 'featured_image', 'date_created',
        'Author.id', 'Author.first_name', 'Author.last_name'
      ],
      filter: {
        status: { _eq: 'published' },
        id: { _neq: article.id },
        tags: {
          tags_id: {
            id: { _in: matchingTags }
          }
        }
      },
      limit,
      sort: ['-date_created']
    };

    const data = await apiFetch('/items/articles', params);
    return data ? data.map(normalizeArticle) : [];
  },

  /**
   * Get library documents with research filters
   */
  async getLibraryDocuments({ search, filters = {} } = {}) {
    const params = {
      fields: [
        'id', 'title', 'slug', 'excerpt', 'date_created',
        'Author.first_name', 'Author.last_name',
        'tags.tags_id.id', 'tags.tags_id.name', 'tags.tags_id.slug', 'tags.tags_id.type.name', 'tags.tags_id.type.slug'
      ],
      filter: {
        status: { _eq: 'published' }
      },
      sort: ['-date_created'],
      limit: 50
    };

    // Apply search
    if (search) {
      params.filter._or = [
        { title: { _icontains: search } },
        { excerpt: { _icontains: search } }
      ];
    }

    // Apply semantic filters via tags
    if (filters.discipline) params.filter.tags = { tags_id: { slug: { _eq: filters.discipline } } };
    if (filters.periode) params.filter.tags = { tags_id: { slug: { _eq: filters.periode } } };
    if (filters.approche) params.filter.tags = { tags_id: { slug: { _eq: filters.approche } } };
    if (filters.corpus) params.filter.tags = { tags_id: { slug: { _eq: filters.corpus } } };
    
    // For type-contenu, we filter specifically by tags of that type
    if (filters.type) {
      params.filter.tags = { 
        tags_id: { 
          slug: { _eq: filters.type },
          type: { slug: { _eq: 'type-contenu' } }
        } 
      };
    } else {
      // By default in library, we might want to filter for everything that HAS a type-contenu tag
      // but if the UI handles it, we can leave it open.
    }

    const data = await apiFetch('/items/articles', params);
    return data ? data.map(normalizeLibraryDocument) : [];
  },

  /**
   * Get a single library document by its slug (article-based)
   */
  async getLibraryDocumentBySlug(slug) {
    const data = await apiFetch('/items/articles', {
      filter: {
        slug: { _eq: slug },
        status: { _eq: 'published' }
      },
      fields: [
        'id', 'title', 'slug', 'excerpt', 'content', 'date_created',
        'Author.first_name', 'Author.last_name',
        'tags.tags_id.id', 'tags.tags_id.name', 'tags.tags_id.slug', 'tags.tags_id.type.name', 'tags.tags_id.type.slug'
      ],
      limit: 1
    });

    return data && data.length > 0 ? normalizeLibraryDocument(data[0]) : null;
  },

  /**
   * Get related library documents based on strict semantic proximity
   */
  async getRelatedLibraryDocuments(currentDoc, limit = 3) {
    if (!currentDoc?.tags?.length) return [];

    const tagIds = currentDoc.tags.map(t => t.id);
    
    const data = await apiFetch('/items/bibliotheque', {
      filter: {
        status: { _eq: 'published' },
        id: { _neq: currentDoc.id },
        tags: {
          tags_id: {
            id: { _in: tagIds }
          }
        }
      },
      fields: [
        'id', 'title', 'slug', 'author', 'year', 'document_type', 'source_type',
        'tags.tags_id.id', 'tags.tags_id.type.name'
      ],
      limit: 50 // Fetch many to score them
    });

    if (!data || data.length === 0) return [];

    // Rule-based filtering: Hierarchical Semantic Logic
    const connected = data.filter(doc => {
      // Rule 1: Same Corpus (Highest Priority)
      const hasSharedCorpus = doc.related_corpus?.some(c => 
        currentDoc.relatedCorpus?.some(cc => cc.slug === c.slug)
      );
      if (hasSharedCorpus) return true;

      // Rules 2 & 3: Semantic Axes
      const sharedAxes = new Set();
      let hasSharedDiscipline = false;

      const docTags = doc.tags || [];
      docTags.forEach(t => {
        const match = currentDoc.tags.find(ct => ct.id === t.tags_id.id);
        if (match) {
          const typeName = t.tags_id.type?.name;
          sharedAxes.add(typeName);
          if (typeName === 'Discipline') hasSharedDiscipline = true;
        }
      });

      return hasSharedDiscipline || sharedAxes.size >= 2;
    });

    return connected
      .slice(0, limit)
      .map(normalizeLibraryDocument);
  },

  /**
   * Get library documents associated with a specific corpus
   */
  async getLibraryDocumentsByCorpus(corpusSlug) {
    const params = {
      fields: ['id', 'title', 'slug', 'author', 'year', 'document_type', 'source_type'],
      filter: {
        status: { _eq: 'published' },
        related_corpus: { slug: { _eq: corpusSlug } }
      },
      sort: ['-year', 'title'],
      limit: 10
    };
    const data = await apiFetch('/items/bibliotheque', params);
    return data ? data.map(normalizeLibraryDocument) : [];
  },

  /**
   * Get articles that analyze or relate to a library source
   * Logic: Strong semantic match via shared tags
   */
  async getArticlesByLibrarySource(docTags, limit = 3) {
    if (!docTags?.length) return [];
    
    const tagIds = docTags.map(t => t.id);
    const params = {
      fields: [
        'id', 'title', 'slug', 'excerpt', 'featured_image', 'date_created',
        'Author.id', 'Author.first_name', 'Author.last_name',
        'tags.tags_id.id' // Need this for local scoring
      ],
      filter: {
        status: { _eq: 'published' },
        tags: {
          tags_id: {
            id: { _in: tagIds }
          }
        }
      },
      sort: ['-date_created'],
      limit: 20 // Fetch more to filter down
    };

    const data = await apiFetch('/items/articles', params);
    if (!data) return [];

    // Rule-based filtering: Hierarchical Semantic Logic
    const connected = data.filter(article => {
      const sharedAxes = new Set();
      let hasSharedDiscipline = false;

      const articleTags = article.tags || [];
      articleTags.forEach(t => {
        const match = docTags.find(dt => dt.id === (t.tags_id?.id || t.tags_id));
        if (match) {
          const typeName = match.type || t.tags_id?.type?.name;
          sharedAxes.add(typeName);
          if (typeName === 'Discipline') hasSharedDiscipline = true;
        }
      });

      return hasSharedDiscipline || sharedAxes.size >= 2;
    });

    return connected
      .slice(0, limit)
      .map(normalizeArticle);
  },

  /**
   * Get unique values for filters (types, languages, etc.)
   */
  async getLibraryFilterMetadata() {
    // This would ideally come from schema or distinct values
    // For now, we return the structure needed for the UI
    return {
      documentTypes: ['Livre', 'Article scientifique', 'Manuscrit', 'Rapport d\'archéologie', 'Carte', 'Archive'],
      sourceTypes: [
        { id: 'primaire', label: 'Source Primaire' },
        { id: 'secondaire', label: 'Source Secondaire' },
        { id: 'critique', label: 'Appareil Critique' }
      ]
    };
  },

  /**
   * Utility to compute reading time from content
   */
  computeReadingTime(html) {
    if (!html) return 0;
    const text = html.replace(/<[^>]*>/g, ' ');
    const wordsPerMinute = 200;
    const noOfWords = text.split(/\s+/g).length;
    return Math.ceil(noOfWords / wordsPerMinute);
  },

  /**
   * Helper to group tags by their type
   * Returns an object where keys are type names/slugs
   */
  groupTagsByType(tags) {
    if (!tags) return {};
    return tags.reduce((groups, tag) => {
      const typeKey = tag.type?.name || 'Autres';
      if (!groups[typeKey]) groups[typeKey] = [];
      groups[typeKey].push(tag);
      return groups;
    }, {});
  },

  // ─── Community Spaces ────────────────────────────────────────────────────────

  /**
   * Get all publicly visible community spaces (excludes private)
   */
  async getCommunitySpaces() {
    const data = await apiFetch('/items/community_spaces', {
      filter: {
        status: { _eq: 'published' },
        access_type: { _neq: 'private' },
      },
      fields: ['id', 'title', 'slug', 'description', 'access_type'],
      sort: ['title'],
    });
    return data ? data.map(normalizeCommunitySpace) : [];
  },

  /**
   * Get a single community space by slug
   */
  async getCommunitySpaceBySlug(slug) {
    const data = await apiFetch('/items/community_spaces', {
      filter: {
        slug: { _eq: slug },
        status: { _eq: 'published' },
      },
      fields: ['id', 'title', 'slug', 'description', 'access_type'],
      limit: 1,
    });
    return data?.[0] ? normalizeCommunitySpace(data[0]) : null;
  },

  /**
   * Get published events linked to a community space by slug
   */
  async getEventsByCommunity(communitySlug) {
    const data = await apiFetch('/items/events', {
      filter: {
        status: { _eq: 'published' },
        community: { slug: { _eq: communitySlug } },
      },
      fields: [
        'id', 'title', 'slug', 'description',
        'event_type', 'mode',
        'start_date', 'end_date',
        'location', 'online_url', 'registration_url',
        'community.slug',
      ],
      sort: ['-start_date'],
      limit: 50,
    });
    return data ? data.map(normalizeEvent) : [];
  },

  /**
   * Get published programs linked to a community space by slug
   */
  async getProgramsByCommunity(communitySlug) {
    const data = await apiFetch('/items/programs', {
      filter: {
        status: { _eq: 'published' },
        community: { slug: { _eq: communitySlug } },
      },
      fields: [
        'id', 'title', 'slug', 'description',
        'level', 'format',
        'community.slug',
      ],
      sort: ['title'],
      limit: 50,
    });
    return data ? data.map(normalizeProgram) : [];
  },

  /**
   * Get the latest published articles linked to a community space (by slug).
   * Used by CommunityDetailPage's "Publications" tab.
   */
  // ─── Editorial (Author policy) ─────────────────────────────────────────
  // These four endpoints require authentication. Directus presets handle
  // Author = $CURRENT_USER and status = draft on create.

  async createArticleDraft(payload = {}) {
    const allowed = [
      'title', 'slug', 'excerpt', 'content',
      'community', 'category',
      'meta_title', 'meta_description',
    ];
    const body = {};
    for (const key of allowed) {
      if (payload[key] !== undefined && payload[key] !== '') {
        body[key] = payload[key];
      }
    }
    // Defensive: never let the caller smuggle these through.
    delete body.Author;
    delete body.status;
    return authFetch('/items/articles', { method: 'POST', body });
  },

  async getArticleById(id) {
    if (!id) throw new Error('Article id is required');
    return authFetch(`/items/articles/${id}?fields=id,status,title,slug,excerpt,content,community,category,meta_title,meta_description,featured_image,editor_notes,revision_count,last_editorial_action,reviewed_at,approved_at,published_at,Author.id,Author.first_name,Author.last_name,reviewed_by.first_name,reviewed_by.last_name,approved_by.first_name,approved_by.last_name,published_by.first_name,published_by.last_name`);
  },

  async getArticles(status = 'review') {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    const url = new URL(`${DIRECTUS_URL}/items/articles`);
    
    const filter = {};
    if (status !== 'Tous') {
      filter.status = { _eq: status };
    }

    url.searchParams.set('filter', JSON.stringify(filter));
    url.searchParams.set(
      'fields',
      'id,title,slug,excerpt,status,date_created,date_updated,revision_count,last_editorial_action,community.title,category.name,featured_image,Author.first_name,Author.last_name'
    );
    url.searchParams.set('sort', '-date_updated');
    url.searchParams.set('limit', '100');

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error(`Failed to load articles (${res.status})`);
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  },

  async getMyArticles() {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    const url = new URL(`${DIRECTUS_URL}/items/articles`);
    url.searchParams.set(
      'filter',
      JSON.stringify({ Author: { _eq: '$CURRENT_USER' } }),
    );
    url.searchParams.set(
      'fields',
      'id,title,slug,excerpt,status,date_created,date_updated,community.title,community.slug,category.name,featured_image',
    );
    url.searchParams.set('sort', '-date_updated');
    url.searchParams.set('limit', '100');

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      let message = `Failed to load my articles (${res.status})`;
      try {
        const errJson = await res.json();
        const directusMsg = errJson?.errors?.[0]?.message;
        if (directusMsg) message = directusMsg;
      } catch { /* ignore */ }
      throw new Error(message);
    }
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  },

  async updateArticle(id, payload = {}) {
    if (!id) throw new Error('Article id is required');
    const allowed = [
      'title', 'slug', 'excerpt', 'content',
      'community', 'category',
      'meta_title', 'meta_description',
      'status', 'editor_notes',
      'reviewed_by', 'reviewed_at',
      'approved_by', 'approved_at',
      'published_by', 'published_at',
      'revision_count', 'last_editorial_action'
    ];
    const body = {};
    for (const key of allowed) {
      if (payload[key] !== undefined) body[key] = payload[key];
    }
    return authFetch(`/items/articles/${id}`, { method: 'PATCH', body });
  },

  async updateArticleDraft(id, payload = {}) {
    const { status, Author, ...rest } = payload;
    return this.updateArticle(id, rest);
  },

  async submitArticleForReview(id) {
    if (!id) throw new Error('Article id is required');
    return this.updateArticle(id, {
      status: 'review',
      last_editorial_action: 'submitted'
    });
  },

  async requestArticleChanges(id, comment, userId) {
    const article = await this.getArticleById(id);
    const revCount = (article.revision_count || 0) + 1;
    
    await this.createArticleComment({
      article_id: id,
      content: comment,
      visibility: 'author_visible',
      role: 'editor' // Should be dynamic based on current user role, but simplified for now
    });

    return this.updateArticle(id, {
      status: 'revisions',
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
      revision_count: revCount,
      last_editorial_action: 'changes_requested'
    });
  },

  async approveArticle(id, userId) {
    return this.updateArticle(id, {
      status: 'approved',
      approved_by: userId,
      approved_at: new Date().toISOString(),
      last_editorial_action: 'approved'
    });
  },

  async publishArticle(id, userId) {
    return this.updateArticle(id, {
      status: 'published',
      published_by: userId,
      published_at: new Date().toISOString(),
      editor_notes: null,
      last_editorial_action: 'published'
    });
  },

  async archiveArticle(id) {
    return this.updateArticle(id, {
      status: 'archived',
      last_editorial_action: 'archived'
    });
  },

  async restoreArticleToDraft(id) {
    return this.updateArticle(id, {
      status: 'draft',
      last_editorial_action: 'restored'
    });
  },

  // ─── Comments ───────────────────────────────────────────────────────────

  async getArticleComments(articleId) {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    
    const url = new URL(`${DIRECTUS_URL}/items/article_comments`);
    url.searchParams.set('filter', JSON.stringify({ article_id: { _eq: articleId } }));
    url.searchParams.set('fields', 'id,content,visibility,role,date_created,author_id.first_name,author_id.last_name');
    url.searchParams.set('sort', 'date_created');

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error(`Failed to load comments (${res.status})`);
    const json = await res.json();
    return json.data || [];
  },

  async createArticleComment(payload) {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    
    const res = await fetch(`${DIRECTUS_URL}/items/article_comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to create comment (${res.status})`);
    const json = await res.json();
    return json.data;
  },

  // ─── Think Tank Infrastructure (Level 17) ────────────────────────────────

  async getPublications(params = {}) {
    const { category, limit = 12 } = params;
    let filter = { status: { _eq: 'published' } };
    if (category) filter.category = { _eq: category };

    const url = new URL(`${DIRECTUS_URL}/items/publications`);
    url.searchParams.set('filter', JSON.stringify(filter));
    url.searchParams.set('fields', 'id,title,slug,abstract,published_at,reading_time,cover_image,author.first_name,author.last_name,category.name,keywords');
    url.searchParams.set('sort', '-published_at');
    url.searchParams.set('limit', String(limit));

    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  },

  async getPublicationBySlug(slug) {
    const url = new URL(`${DIRECTUS_URL}/items/publications`);
    url.searchParams.set('filter', JSON.stringify({ slug: { _eq: slug }, status: { _eq: 'published' } }));
    url.searchParams.set('fields', '*,author.first_name,author.last_name,category.name');
    url.searchParams.set('limit', '1');

    const res = await fetch(url);
    const json = await res.json();
    return json.data?.[0] || null;
  },

  async getDossiers() {
    const url = new URL(`${DIRECTUS_URL}/items/dossiers`);
    url.searchParams.set('filter', JSON.stringify({ status: { _eq: 'published' } }));
    url.searchParams.set('fields', 'id,title,slug,description,cover_image');
    url.searchParams.set('sort', '-date_created');

    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  },

  async getDossierBySlug(slug) {
    const url = new URL(`${DIRECTUS_URL}/items/dossiers`);
    url.searchParams.set('filter', JSON.stringify({ slug: { _eq: slug }, status: { _eq: 'published' } }));
    url.searchParams.set('fields', '*,articles.articles_id.*,publications.publications_id.*');
    url.searchParams.set('limit', '1');

    const res = await fetch(url);
    const json = await res.json();
    const dossier = json.data?.[0];
    if (!dossier) return null;

    // Flatten relations for easier use
    return {
      ...dossier,
      articles: dossier.articles?.map(item => item.articles_id) || [],
      publications: dossier.publications?.map(item => item.publications_id) || []
    };
  },

  async getLibraryResources(params = {}) {
    const { category, search, filters = {} } = params;
    const url = new URL(`${DIRECTUS_URL}/items/library_resources`);
    
    let filter = {};
    if (category) filter.category = { _eq: category };
    if (search) {
      filter._or = [
        { title: { _icontains: search } },
        { author: { _icontains: search } }
      ];
    }
    
    // Advanced filters
    if (filters.discipline) filter.discipline = { _eq: filters.discipline };
    if (filters.periode) filter.periode = { _eq: filters.periode };
    if (filters.approche) filter.approche = { _eq: filters.approche };
    if (filters.type) filter.type = { _eq: filters.type };

    url.searchParams.set('filter', JSON.stringify(filter));
    url.searchParams.set('fields', '*');
    url.searchParams.set('sort', '-year');

    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  },

  // Alias for compatibility with existing BibliothequePage
  async getLibraryDocuments(params) {
    return this.getLibraryResources(params);
  },

  async getRelatedDossiers(dossier, limit = 3) {
    // Basic logic: find other dossiers (excluding current)
    const url = new URL(`${DIRECTUS_URL}/items/dossiers`);
    url.searchParams.set('filter', JSON.stringify({ 
      id: { _neq: dossier.id },
      status: { _eq: 'published' }
    }));
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('fields', 'id,title,slug,description,cover_image');
    
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  },

  async getLibraryDocumentsByCorpus(slug) {
    // Find documents related to a specific dossier/corpus
    // This assumes a relationship exists or we filter by category/tag
    return this.getLibraryResources({ filters: { corpus: slug } });
  },

  async getArticlesByCommunity(communityId) {
    if (!communityId) return [];
    const data = await apiFetch('/items/articles', {
      filter: {
        status: { _eq: 'published' },
        community: { id: { _eq: communityId } },
      },
      fields: [
        'id', 'title', 'slug', 'excerpt', 'date_created', 'featured_image',
        'Author.first_name', 'Author.last_name',
        'community.slug', 'category.name',
      ],
      sort: ['-date_created'],
      limit: 10,
    });
    return data ? data.map(normalizeArticle) : [];
  },

  // ─── Académie CEEDO (Level 18) ───────────────────────────────────────────

  async getCourses(params = {}) {
    const { limit = 12 } = params;
    const url = new URL(`${DIRECTUS_URL}/items/courses`);
    url.searchParams.set('filter', JSON.stringify({ status: { _eq: 'published' } }));
    url.searchParams.set('fields', 'id,title,slug,subtitle,level,duration,cover_image,is_paid,price,currency,instructor.first_name,instructor.last_name');
    url.searchParams.set('sort', '-published_at');
    url.searchParams.set('limit', String(limit));

    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  },

  async getFeaturedCourses() {
    return this.getCourses({ limit: 3 });
  },

  async getCourseBySlug(slug) {
    const url = new URL(`${DIRECTUS_URL}/items/courses`);
    url.searchParams.set('filter', JSON.stringify({ slug: { _eq: slug }, status: { _eq: 'published' } }));
    url.searchParams.set('fields', [
      '*',
      'instructor.first_name', 'instructor.last_name', 'instructor.description', 'instructor.avatar',
      'modules.*',
      'modules.lessons.id', 'modules.lessons.title', 'modules.lessons.slug', 'modules.lessons.status',
      'related_dossier.*',
      'related_publications.*',
      'related_library_resources.*'
    ].join(','));
    url.searchParams.set('limit', '1');

    const res = await fetch(url);
    const json = await res.json();
    const course = json.data?.[0];
    if (!course) return null;

    // Ensure modules are sorted by order
    if (course.modules) {
      course.modules.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return course;
  },

  async getLessonBySlug(courseSlug, lessonSlug) {
    // 1. Get course to verify and get hierarchy
    const course = await this.getCourseBySlug(courseSlug);
    if (!course) return null;

    // 2. Get lesson details
    const url = new URL(`${DIRECTUS_URL}/items/lessons`);
    url.searchParams.set('filter', JSON.stringify({
      slug: { _eq: lessonSlug },
      status: { _eq: 'published' }
    }));
    url.searchParams.set('fields', '*,module_id.course_id.slug,module_id.title');
    url.searchParams.set('limit', '1');

    const res = await fetch(url);
    const json = await res.json();
    const lesson = json.data?.[0];
    if (!lesson) return null;

    // 3. Attach course context for navigation
    return { ...lesson, course };
  },

  // ─── Académie CEEDO — User Learning System (Level 19) ───────────────────

  /**
   * Enroll the authenticated user in a course.
   * Idempotent: returns existing enrollment if already enrolled.
   */
  async enrollInCourse(courseId) {
    const existing = await authFetch(
      `/items/course_enrollments?filter[course_id][_eq]=${courseId}&filter[user_id][_eq]=$CURRENT_USER&limit=1`
    );
    if (existing?.length) return existing[0];

    return authFetch('/items/course_enrollments', {
      method: 'POST',
      body: {
        course_id: courseId,
        status: 'active',
        progress_percentage: 0,
        started_at: new Date().toISOString(),
      },
    });
  },

  /**
   * Get all enrollments for the authenticated user,
   * with course title, slug, and current progress.
   */
  async getUserEnrollments() {
    return authFetch(
      '/items/course_enrollments?fields=id,status,progress_percentage,started_at,completed_at,course_id.id,course_id.title,course_id.slug,course_id.cover_image,course_id.level,course_id.duration&sort=-started_at'
    );
  },

  /**
   * Get full progress data for a specific course:
   * enrollment record + per-lesson completion status.
   */
  async getCourseProgress(courseId) {
    const [enrollments, lessonProgressData, course] = await Promise.all([
      authFetch(`/items/course_enrollments?filter[course_id][_eq]=${courseId}&filter[user_id][_eq]=$CURRENT_USER&limit=1`),
      authFetch(`/items/lesson_progress?filter[user_id][_eq]=$CURRENT_USER&fields=lesson_id,completed,completed_at`),
      authFetch(`/items/courses/${courseId}?fields=id,title,modules.id,modules.title,modules.order,modules.lessons.id,modules.lessons.title,modules.lessons.order`),
    ]);

    const enrollment = enrollments?.[0] || null;

    // Build a Set of completed lesson IDs for O(1) lookup
    const completedIds = new Set(
      (lessonProgressData || []).filter(p => p.completed).map(p => p.lesson_id)
    );

    // Attach completion status to each lesson in the hierarchy
    const modules = (course?.modules || [])
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(mod => ({
        ...mod,
        lessons: (mod.lessons || [])
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(lesson => ({ ...lesson, completed: completedIds.has(lesson.id) })),
      }));

    const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const completedLessons = modules.reduce(
      (sum, m) => sum + m.lessons.filter(l => l.completed).length, 0
    );

    return {
      enrollment,
      modules,
      totalLessons,
      completedLessons,
      progressPercentage: totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0,
    };
  },

  /**
   * Mark a lesson as completed for the authenticated user.
   * Creates the record if absent; updates it if already present.
   * After marking, recomputes and persists progress_percentage
   * on the enrollment; issues certificate if course is 100% done.
   */
  async markLessonComplete(lessonId) {
    // 1. Upsert lesson_progress
    const existing = await authFetch(
      `/items/lesson_progress?filter[lesson_id][_eq]=${lessonId}&filter[user_id][_eq]=$CURRENT_USER&limit=1`
    );

    let progress;
    if (existing?.length) {
      progress = await authFetch(`/items/lesson_progress/${existing[0].id}`, {
        method: 'PATCH',
        body: { completed: true, completed_at: new Date().toISOString() },
      });
    } else {
      progress = await authFetch('/items/lesson_progress', {
        method: 'POST',
        body: {
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        },
      });
    }

    // 2. Resolve course_id from lesson → module → course chain
    const lesson = await authFetch(
      `/items/lessons/${lessonId}?fields=module.course_id`
    );
    const courseId = lesson?.module?.course_id;
    if (!courseId) return progress;

    // 3. Recompute progress and update enrollment
    const progressData = await this.getCourseProgress(courseId);
    const { totalLessons, completedLessons, progressPercentage, enrollment } = progressData;
    if (!enrollment) return progress;

    const isComplete = totalLessons > 0 && completedLessons === totalLessons;
    await authFetch(`/items/course_enrollments/${enrollment.id}`, {
      method: 'PATCH',
      body: {
        progress_percentage: progressPercentage,
        ...(isComplete && {
          status: 'completed',
          completed_at: new Date().toISOString(),
        }),
      },
    });

    // 4. Issue certificate if just completed and none yet exists
    if (isComplete) {
      const certs = await authFetch(
        `/items/certificates?filter[course_id][_eq]=${courseId}&filter[user_id][_eq]=$CURRENT_USER&limit=1`
      );
      if (!certs?.length) {
        await authFetch('/items/certificates', {
          method: 'POST',
          body: {
            course_id: courseId,
            issued_at: new Date().toISOString(),
          },
        });
      }
    }

    return { ...progress, progressPercentage, isComplete };
  },

  /**
   * Get all lesson_progress records for lessons belonging to a course.
   * Useful for hydrating a course player UI without re-fetching the full hierarchy.
   */
  async getLessonProgress(courseId) {
    // Fetch all completed lesson IDs for current user, then filter client-side
    // to the course's lessons (avoids a complex nested filter).
    const [allProgress, course] = await Promise.all([
      authFetch('/items/lesson_progress?filter[user_id][_eq]=$CURRENT_USER&fields=lesson_id,completed,completed_at&limit=500'),
      authFetch(`/items/courses/${courseId}?fields=modules.lessons.id`),
    ]);

    const lessonIdsInCourse = new Set(
      (course?.modules || []).flatMap(m => (m.lessons || []).map(l => l.id))
    );

    return (allProgress || []).filter(p => lessonIdsInCourse.has(p.lesson_id));
  },

  /**
   * Get all certificates for the authenticated user,
   * with course title and slug for display.
   */
  async getUserCertificates() {
    return authFetch(
      '/items/certificates?fields=id,issued_at,certificate_url,certificate_code,course_id.id,course_id.title,course_id.slug,course_id.cover_image,user_id.first_name,user_id.last_name&sort=-issued_at'
    );
  },

  /**
   * Get a single certificate by ID for the authenticated user.
   */
  async getCertificateById(id) {
    const data = await authFetch(
      `/items/certificates?filter[id][_eq]=${id}&filter[user_id][_eq]=$CURRENT_USER&fields=id,issued_at,certificate_url,certificate_code,course_id.id,course_id.title,user_id.first_name,user_id.last_name&limit=1`
    );
    return data?.[0] || null;
  },

  /**
   * Check if user has explicit access to a paid course
   */
  async hasCourseAccess(courseId) {
    try {
      const access = await authFetch(
        `/items/course_access?filter[course_id][_eq]=${courseId}&filter[user_id][_eq]=$CURRENT_USER&filter[status][_eq]=active&limit=1`
      );
      return access && access.length > 0;
    } catch (e) {
      return false;
    }
  },

  /**
   * Get the full access status (active, pending, etc.)
   */
  async getCourseAccessStatus(courseId) {
    try {
      const access = await authFetch(
        `/items/course_access?filter[course_id][_eq]=${courseId}&filter[user_id][_eq]=$CURRENT_USER&limit=1&sort=-requested_at`
      );
      if (!access || access.length === 0) return { status: 'none' };
      return { status: access[0].status };
    } catch (e) {
      return { status: 'none' };
    }
  },

  /**
   * Request manual access (Level 22)
   */
  async requestCourseAccess(courseId) {
    return authFetch('/items/course_access', {
      method: 'POST',
      body: {
        course_id: courseId,
        access_type: 'request',
        status: 'pending',
        requested_at: new Date().toISOString()
      }
    });
  },

  /**
   * Create a Stripe Checkout Session
   */
  async createStripeCheckoutSession(courseId) {
    const token = localStorage.getItem('directus_token');
    const user = JSON.parse(localStorage.getItem('directus_user') || '{}');
    
    // In production, this URL would be the deployed Express server
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    const res = await fetch(`${API_URL}/api/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, userId: user?.id, token })
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erreur lors du paiement');
    }
    
    return res.json();
  },

  /**
   * Level 25: Get Admin Stats
   */
  async getAdminStats() {
    const token = localStorage.getItem('directus_token');
    if (!token) throw new Error('Not authenticated');
    
    const fetchCount = async (path) => {
      const res = await fetch(`${DIRECTUS_URL}${path}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return 0;
      const json = await res.json();
      return json?.meta?.filter_count || 0;
    };

    try {
      const [totalCourses, pendingRequests, activeEnrollments, certificatesIssued] = await Promise.all([
        fetchCount('/items/courses?limit=0&meta=filter_count'),
        fetchCount('/items/course_access?filter[status][_eq]=pending&limit=0&meta=filter_count'),
        fetchCount('/items/course_enrollments?filter[status][_eq]=active&limit=0&meta=filter_count'),
        fetchCount('/items/certificates?limit=0&meta=filter_count')
      ]);

      return { totalCourses, pendingRequests, activeEnrollments, certificatesIssued };
    } catch (err) {
      console.error('Admin stats error:', err);
      return { totalCourses: 0, pendingRequests: 0, activeEnrollments: 0, certificatesIssued: 0 };
    }
  },

  /**
   * Admin: Get Course Access Requests
   */
  async getCourseAccessRequests(status = null) {
    let url = '/items/course_access?fields=id,status,access_type,requested_at,granted_at,user_id.first_name,user_id.last_name,user_id.email,course_id.title&sort=-requested_at';
    if (status) {
      url += `&filter[status][_eq]=${status}`;
    }
    return authFetch(url);
  },

  /**
   * Admin: Approve Course Access Request
   */
  async approveCourseAccess(id) {
    return authFetch(`/items/course_access/${id}`, {
      method: 'PATCH',
      body: {
        status: 'active',
        access_type: 'admin_grant',
        granted_at: new Date().toISOString()
      }
    });
  },

  /**
   * Admin: Revoke Course Access
   */
  async revokeCourseAccess(id) {
    return authFetch(`/items/course_access/${id}`, {
      method: 'PATCH',
      body: {
        status: 'revoked'
      }
    });
  },

  /**
   * Admin: Restore Course Access
   */
  async restoreCourseAccess(id) {
    return authFetch(`/items/course_access/${id}`, {
      method: 'PATCH',
      body: {
        status: 'active',
        granted_at: new Date().toISOString()
      }
    });
  },

  /**
   * Admin: Get Courses with enrollment/certificate counts
   */
  async getAdminCourses() {
    const [courses, enrollments, certificates] = await Promise.all([
      authFetch('/items/courses?fields=id,title,slug,status,is_paid,price,currency&limit=-1'),
      authFetch('/items/course_enrollments?fields=course_id,id&limit=-1'),
      authFetch('/items/certificates?fields=course_id.id,id&limit=-1')
    ]);

    const enrollmentCounts = (enrollments || []).reduce((acc, e) => {
      const cId = typeof e.course_id === 'object' ? e.course_id?.id : e.course_id;
      if (cId) acc[cId] = (acc[cId] || 0) + 1;
      return acc;
    }, {});

    const certificateCounts = (certificates || []).reduce((acc, c) => {
      const cId = typeof c.course_id === 'object' ? c.course_id?.id : c.course_id;
      if (cId) acc[cId] = (acc[cId] || 0) + 1;
      return acc;
    }, {});

    return (courses || []).map(course => ({
      ...course,
      enrollments_count: enrollmentCounts[course.id] || 0,
      certificates_count: certificateCounts[course.id] || 0
    }));
  },

  /**
   * Admin: Get Users Learning Overview
   */
  async getAdminUsersLearningOverview() {
    const [users, enrollments, certificates] = await Promise.all([
      authFetch('/items/directus_users?fields=id,first_name,last_name,email&limit=-1'),
      authFetch('/items/course_enrollments?fields=id,user_id,course_id.title,status,progress_percentage&limit=-1'),
      authFetch('/items/certificates?fields=id,user_id,course_id.title&limit=-1')
    ]);

    const activeUsers = new Map();

    const getOrCreateUser = (id) => {
      if (!activeUsers.has(id)) {
        const userMeta = (users || []).find(u => u.id === id) || { first_name: 'Inconnu', last_name: '', email: '' };
        activeUsers.set(id, {
          id,
          name: `${userMeta.first_name || ''} ${userMeta.last_name || ''}`.trim(),
          email: userMeta.email,
          enrollments: [],
          certificates: [],
          completed_count: 0
        });
      }
      return activeUsers.get(id);
    };

    (enrollments || []).forEach(e => {
      const uId = typeof e.user_id === 'object' ? e.user_id?.id : e.user_id;
      if (!uId) return;
      const u = getOrCreateUser(uId);
      u.enrollments.push(e);
      if (e.status === 'completed') u.completed_count++;
    });

    (certificates || []).forEach(c => {
      const uId = typeof c.user_id === 'object' ? c.user_id?.id : c.user_id;
      if (!uId) return;
      const u = getOrCreateUser(uId);
      u.certificates.push(c);
    });

    return Array.from(activeUsers.values());
  }
};
