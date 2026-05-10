import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { calculateReadingTime } from '../lib/readingTime';
import SectionHeader from '../components/ui/SectionHeader';
import AuthorNav from '../components/editorial/AuthorNav';
import ArticleCommentsBox from '../components/editorial/ArticleCommentsBox';
import EditorialNotesBox from '../components/editorial/EditorialNotesBox';
import RichTextEditor from '../components/editorial/RichTextEditor';

/**
 * Author submission form — creates a draft article.
 * Authentication required. The Directus Author policy enforces
 *   Author = $CURRENT_USER, status = draft
 * so this form deliberately omits both fields.
 */
export default function SubmitArticlePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const articleId = searchParams.get('id');
  const isEditing = Boolean(articleId);

  // ─── Form state ──────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    community: '',
    category: '',
    meta_title: '',
    meta_description: '',
  });
  const slugTouchedRef = useRef(false);

  // ─── Reference data ──────────────────────────────────────────────────────
  const [communities, setCommunities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [refDataError, setRefDataError] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(false);

  // ─── Submission state ────────────────────────────────────────────────────
  const [submitState, setSubmitState] = useState('idle'); // idle | loading | success | error
  const [submitError, setSubmitError] = useState(null);
  const [createdArticle, setCreatedArticle] = useState(null);

  // ─── Title → slug autoderive ─────────────────────────────────────────────
  useEffect(() => {
    if (slugTouchedRef.current) return;
    setForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
  }, [form.title]);

  // ─── Load reference data once ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [comms, cats] = await Promise.all([
          api.getCommunitySpaces().catch(() => []),
          api.getCategories().catch(() => null), // categories optional
        ]);
        if (cancelled) return;
        setCommunities(comms || []);
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (err) {
        if (cancelled) return;
        setRefDataError(err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ─── Load article for editing ────────────────────────────────────────────
  useEffect(() => {
    if (!articleId || !isAuthenticated) return;
    let cancelled = false;
    (async () => {
      setLoadingArticle(true);
      try {
        const article = await api.getArticleById(articleId);
        if (cancelled) return;
        if (article) {
          setForm({
            title: article.title || '',
            slug: article.slug || '',
            excerpt: article.excerpt || '',
            content: article.content || '',
            community: article.community?.id || article.community || '',
            category: article.category?.id || article.category || '',
            meta_title: article.meta_title || '',
            meta_description: article.meta_description || '',
          });
          // Avoid auto-slugging over the existing slug
          slugTouchedRef.current = true;
        }
      } catch (err) {
        console.error('[SubmitArticlePage] Failed to load article:', err);
        setRefDataError(new Error("Impossible de charger l'article pour modification."));
      } finally {
        if (!cancelled) setLoadingArticle(false);
      }
    })();
    return () => { cancelled = true; };
  }, [articleId, isAuthenticated]);

  // ─── Document title ──────────────────────────────────────────────────────
  useEffect(() => {
    document.title = 'Soumettre un article — Projet Ceedo 2.0';
    return () => { document.title = 'Projet Ceedo 2.0'; };
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const onChange = (key) => (e) => {
    const value = e.target.value;
    if (key === 'slug') slugTouchedRef.current = true;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isValid = useMemo(() => {
    return (
      form.title.trim().length >= 3 &&
      form.slug.trim().length >= 3 &&
      form.content.trim().length > 0 &&
      Boolean(form.community)
    );
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || submitState === 'loading') return;
    setSubmitState('loading');
    setSubmitError(null);
    try {
      const payload = { ...form };
      // Strip empties so optional fields aren't posted as ""
      Object.keys(payload).forEach((k) => {
        if (payload[k] === '' || payload[k] === null) delete payload[k];
      });
      // Coerce numeric M2O ids
      if (payload.community && !Number.isNaN(Number(payload.community))) {
        payload.community = Number(payload.community);
      }
      if (payload.category && !Number.isNaN(Number(payload.category))) {
        payload.category = Number(payload.category);
      }
      
      let created;
      if (isEditing) {
        created = await api.updateArticleDraft(articleId, payload);
      } else {
        created = await api.createArticleDraft(payload);
      }
      
      setCreatedArticle(created);
      setSubmitState('success');
    } catch (err) {
      console.error('[SubmitArticlePage] Submit failed:', err);
      setSubmitError(err?.message || 'Une erreur est survenue.');
      setSubmitState('error');
    }
  };

  // ─── Render: auth gate ───────────────────────────────────────────────────
  if (authLoading || loadingArticle) {
    return <PageLoading />;
  }
  if (!isAuthenticated) {
    return <NotAuthenticated />;
  }

  // ─── Render: success ─────────────────────────────────────────────────────
  if (submitState === 'success') {
    return (
      <main className="bg-white min-h-screen">
        <AuthorNav />
        <div className="max-w-3xl mx-auto px-6 py-20 lg:py-32 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#8b6914] mb-6">
            Brouillon créé
          </p>
          <h1 className="text-3xl font-serif text-[#1a1a1a] mb-6">
            {isEditing ? 'Modification enregistrée' : 'Brouillon créé avec succès'}
          </h1>
          <p className="text-[#4a4a4a] leading-relaxed mb-10 max-w-xl mx-auto">
            Votre article <span className="font-serif italic">{createdArticle?.title || form.title}</span> a été enregistré comme brouillon.
            Vous pouvez le retravailler depuis votre espace auteur, puis le soumettre pour révision.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/my-articles"
              className="inline-block px-8 py-3 bg-[#8b6914] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#c4965a] transition-all"
            >
              Voir mes articles
            </Link>
            <button
              type="button"
              onClick={() => {
                setForm({
                  title: '', slug: '', excerpt: '', content: '',
                  community: '', category: '',
                  meta_title: '', meta_description: '',
                });
                slugTouchedRef.current = false;
                setCreatedArticle(null);
                setSubmitState('idle');
              }}
              className="inline-block px-8 py-3 border border-[#1a1a1a] text-[#1a1a1a] text-[10px] font-bold uppercase tracking-widest hover:bg-[#1a1a1a] hover:text-white transition-all"
            >
              {isEditing ? 'Continuer à modifier' : 'Soumettre un autre brouillon'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ─── Render: form ────────────────────────────────────────────────────────
  return (
    <main className="bg-white min-h-screen">
      <AuthorNav />
      <section className="border-b border-[#d8d5ce]/30 pt-16 pb-10 lg:pt-24 lg:pb-14">
        <div className="max-w-3xl mx-auto px-6">
          <SectionHeader
            eyebrow={isEditing ? 'Modification du brouillon' : 'Espace auteur'}
            title={isEditing ? 'Modifier l\'article' : 'Soumettre un article'}
            subtitle={isEditing 
              ? "Apportez vos corrections. Les changements seront visibles dans votre espace personnel."
              : "Rédigez votre brouillon. Il sera enregistré dans votre espace personnel et soumis pour révision quand vous le déciderez."
            }
          />
          {user && (
            <p className="mt-4 text-[10px] uppercase tracking-widest text-[#767676]">
              Connecté en tant que <span className="text-[#1a1a1a]">{authorLabel(user)}</span>
            </p>
          )}
        </div>
      </section>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 py-12 lg:py-16 space-y-10">
        {isEditing && (
          <div className="mb-10">
            <ArticleCommentsBox articleId={articleId} />
          </div>
        )}
        <EditorialNotesBox notes={form.editor_notes} />

        {/* Title */}
        <Field label="Titre" required hint="Le titre s'affichera dans la liste des publications.">
          <input
            type="text"
            value={form.title}
            onChange={onChange('title')}
            required
            minLength={3}
            className={inputClass}
            placeholder="Ex. : Lecture critique d'une inscription latine inédite"
          />
        </Field>

        {/* Slug */}
        <Field
          label="Identifiant URL (slug)"
          required
          hint="Généré automatiquement depuis le titre. Modifiable si nécessaire."
        >
          <input
            type="text"
            value={form.slug}
            onChange={onChange('slug')}
            required
            minLength={3}
            className={inputClass}
            placeholder="lecture-critique-inscription-latine"
          />
        </Field>

        {/* Excerpt */}
        <Field label="Chapeau" hint="Court résumé éditorial (1 à 3 phrases).">
          <textarea
            value={form.excerpt}
            onChange={onChange('excerpt')}
            rows={3}
            className={inputClass}
            placeholder="Quelques phrases pour introduire l'article."
          />
        </Field>

        {/* Content */}
        <Field
          label="Contenu"
          required
          hint="Texte intégral de l'article."
        >
          <RichTextEditor
            value={form.content}
            onChange={(html) => setForm((prev) => ({ ...prev, content: html }))}
          />
          <div className="mt-3 flex items-center gap-6 text-[10px] uppercase font-bold tracking-widest text-[#767676]">
            <span>
              {form.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length} mots
            </span>
            <span>
              Temps de lecture estimé : {calculateReadingTime(form.content)} min
            </span>
          </div>
        </Field>

        {/* Community */}
        <Field label="Cercle" required hint="Espace communautaire auquel l'article est rattaché.">
          <select
            value={form.community}
            onChange={onChange('community')}
            required
            className={inputClass}
          >
            <option value="">— Sélectionnez un cercle —</option>
            {communities.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </Field>

        {/* Category (optional) */}
        {categories.length > 0 && (
          <Field label="Catégorie" hint="Optionnel. Permet de classer l'article éditorialement.">
            <select
              value={form.category}
              onChange={onChange('category')}
              className={inputClass}
            >
              <option value="">— Aucune —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
        )}

        {/* SEO */}
        <fieldset className="border border-[#d8d5ce] p-6 lg:p-8 space-y-6">
          <legend className="px-2 text-[10px] uppercase font-bold tracking-widest text-[#8b6914]">
            Référencement (optionnel)
          </legend>
          <Field label="Méta-titre">
            <input
              type="text"
              value={form.meta_title}
              onChange={onChange('meta_title')}
              className={inputClass}
              placeholder="Titre alternatif pour les moteurs de recherche"
            />
          </Field>
          <Field label="Méta-description">
            <textarea
              value={form.meta_description}
              onChange={onChange('meta_description')}
              rows={2}
              className={inputClass}
              placeholder="Résumé court (≤160 caractères) pour les moteurs de recherche"
            />
          </Field>
        </fieldset>

        {/* Error */}
        {submitState === 'error' && submitError && (
          <p className="text-sm text-[#8b6914] border-l-2 border-[#8b6914] pl-4 py-2 bg-[#faf9f6]">
            {submitError}
          </p>
        )}
        {refDataError && (
          <p className="text-xs italic text-[#767676]">
            Certaines listes de référence n'ont pas pu être chargées. Vous pouvez tout de même enregistrer un brouillon.
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-[#d8d5ce]/60">
          <button
            type="submit"
            disabled={!isValid || submitState === 'loading'}
            className="inline-block px-8 py-3 bg-[#8b6914] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#c4965a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitState === 'loading' ? 'Enregistrement…' : isEditing ? 'Mettre à jour le brouillon' : 'Enregistrer le brouillon'}
          </button>
          <Link
            to="/my-articles"
            className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] border-b border-[#1a1a1a] pb-1 hover:text-[#8b6914] hover:border-[#8b6914] transition-all"
          >
            Voir mes articles
          </Link>
          <p className="text-xs text-[#767676] sm:ml-auto">
            Statut à la création : <span className="font-bold text-[#1a1a1a]">Brouillon</span>
          </p>
        </div>
      </form>
    </main>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const inputClass =
  'w-full px-4 py-3 border border-[#d8d5ce] bg-white text-[#1a1a1a] text-base focus:outline-none focus:border-[#8b6914] transition-colors';

function Field({ label, required, hint, children }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] mb-2">
        {label}{required && <span className="text-[#8b6914]"> *</span>}
      </span>
      {children}
      {hint && <span className="block text-xs text-[#767676] mt-2">{hint}</span>}
    </label>
  );
}

function authorLabel(user) {
  const first = user?.first_name || '';
  const last = user?.last_name || '';
  const full = [first, last].filter(Boolean).join(' ');
  return full || user?.email || 'auteur';
}

function slugify(input) {
  return (input || '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// ─── State components ───────────────────────────────────────────────────────

function PageLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-32">
      <div className="w-12 h-12 border-4 border-[#C4965A]/20 border-t-[#C4965A] rounded-full animate-spin mb-4" />
      <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#767676] opacity-60">
        Chargement...
      </p>
    </div>
  );
}

function NotAuthenticated() {
  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-20 lg:py-32 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#8b6914] mb-6">
          Espace auteur
        </p>
        <h1 className="text-3xl font-serif text-[#1a1a1a] mb-6">
          Connexion requise
        </h1>
        <p className="text-[#4a4a4a] leading-relaxed mb-10">
          Pour soumettre un article, vous devez être connecté avec un compte auteur du Projet Ceedo 2.0.
        </p>
        <Link
          to="/login"
          className="inline-block px-8 py-3 bg-[#8b6914] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#c4965a] transition-all"
        >
          Se connecter
        </Link>
      </div>
    </main>
  );
}
