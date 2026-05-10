import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMyArticles } from '../hooks/useMyArticles';
import { api } from '../lib/api';
import { calculateReadingTime } from '../lib/readingTime';
import SectionHeader from '../components/ui/SectionHeader';
import AuthorNav from '../components/editorial/AuthorNav';
import StatusBadge from '../components/ui/StatusBadge';
import EditorialNotesBox from '../components/editorial/EditorialNotesBox';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://admin.projetceedo20.org';

const STATUS_LABEL = {
  draft:     'Brouillon',
  review:    'En révision',
  published: 'Publié',
  archived:  'Archivé',
};

const STATUS_CLASS = {
  draft:     'border-[#8b6914] text-[#8b6914]',
  review:    'border-[#1a1a1a] text-[#1a1a1a]',
  published: 'border-[#1a1a1a] bg-[#1a1a1a] text-white',
  archived:  'border-[#767676] text-[#767676]',
};

export default function MyArticlesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { articles, loading, error, refresh } = useMyArticles();
  const [pendingId, setPendingId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || 'Tous';

  useEffect(() => {
    document.title = 'Mes articles — Projet Ceedo 2.0';
    return () => { document.title = 'Projet Ceedo 2.0'; };
  }, []);

  const handleSubmitForReview = async (id) => {
    if (!window.confirm('Soumettre cet article à la révision éditoriale ?')) return;
    setPendingId(id);
    setActionError(null);
    setSuccessMsg(null);
    try {
      await api.submitArticleForReview(id);
      setSuccessMsg('Article soumis pour révision.');
      refresh();
    } catch (err) {
      setActionError(err.message || 'Une erreur est survenue.');
    } finally {
      setPendingId(null);
    }
  };

  if (authLoading) return <PageLoading />;
  if (!isAuthenticated) return <NotAuthenticated />;

  // ─── Filtering & Sorting ─────────────────────────────────────────────────
  const statusOrder = { draft: 1, review: 2, published: 3, archived: 4 };

  const filteredArticles = articles
    .filter((a) => statusFilter === 'Tous' || a.status === statusFilter)
    .sort((a, b) => {
      const orderA = statusOrder[a.status] || 99;
      const orderB = statusOrder[b.status] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.date_updated || b.date_created) - new Date(a.date_updated || a.date_created);
    });

  const filterOptions = [
    { label: 'Tous', value: 'Tous' },
    { label: 'Brouillons', value: 'draft' },
    { label: 'En révision', value: 'review' },
    { label: 'Publiés', value: 'published' },
    { label: 'Archivés', value: 'archived' },
  ];

  return (
    <main className="bg-white min-h-screen">
      <AuthorNav />
      {/* Hero */}
      <section className="border-b border-[#d8d5ce]/30 pt-16 pb-10 lg:pt-24 lg:pb-14">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <SectionHeader
            eyebrow="Espace auteur"
            title="Mes articles"
            subtitle="Vos brouillons, soumissions et publications."
          />
          <Link
            to="/submit-article"
            className="shrink-0 inline-block px-8 py-3 bg-[#8b6914] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#c4965a] transition-all"
          >
            Nouveau brouillon
          </Link>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16">
        {/* Notices */}
        {successMsg && (
          <p className="mb-8 text-sm text-[#1a1a1a] border-l-2 border-[#8b6914] pl-4 py-2 bg-[#faf9f6]">
            {successMsg}
          </p>
        )}
        {(actionError || error) && (
          <p className="mb-8 text-sm text-[#8b6914] border-l-2 border-[#8b6914] pl-4 py-2 bg-[#faf9f6]">
            {actionError || error?.message || 'Une erreur est survenue.'}
          </p>
        )}

        {/* Body */}
        {loading ? (
          <div className="py-20 flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-[#C4965A]/20 border-t-[#C4965A] rounded-full animate-spin mb-4" />
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#767676] opacity-60">
              Chargement...
            </p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm italic text-[#767676]">Aucun article trouvé pour ce filtre.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#d8d5ce]">
            {filteredArticles.map((article) => (
              <ArticleRow
                key={article.id}
                article={article}
                onSubmitForReview={handleSubmitForReview}
                isPending={pendingId === article.id}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ArticleRow({ article, onSubmitForReview, isPending }) {
  const status = article.status || 'draft';

  const updated = article.date_updated || article.date_created;
  const updatedLabel = updated
    ? new Date(updated).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;

  const communityTitle = article.community?.title || article.community?.slug || null;
  const categoryName = article.category?.name || null;
  const readingTime = calculateReadingTime(article.content);
  const featuredImage = article.featured_image;

  const canEdit = status === 'draft' || status === 'review';
  const canSubmit = status === 'draft';

  return (
    <div className="py-10 first:pt-0 last:pb-0">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Status + Meta */}
        <div className="md:w-40 shrink-0 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {readingTime > 0 && (
              <span className="text-[10px] font-bold text-[#767676] uppercase tracking-widest">
                {readingTime} min de lecture
              </span>
            )}
          </div>
          {updatedLabel && (
            <p className="text-[10px] uppercase tracking-widest text-[#767676]">
              Mis à jour le<br />
              <span className="text-[#1a1a1a] font-serif tracking-normal normal-case">
                {updatedLabel}
              </span>
            </p>
          )}
        </div>

        {/* Thumbnail */}
        {featuredImage && (
          <div className="hidden sm:block md:w-32 lg:w-40 shrink-0">
            <img
              src={`${DIRECTUS_URL}/assets/${featuredImage}?width=200&height=120&fit=cover`}
              alt=""
              className="w-full aspect-[5/3] object-cover grayscale hover:grayscale-0 transition-all duration-500 border border-[#d8d5ce]"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
            {communityTitle && (
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8b6914]">
                {communityTitle}
              </span>
            )}
            {communityTitle && categoryName && (
              <span className="text-[#d8d5ce] text-[10px]">·</span>
            )}
            {categoryName && (
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#767676]">
                {categoryName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mb-3">
            <StatusBadge status={article.status} />
            {article.revision_count > 0 && (
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8b6914] flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Révision #{article.revision_count}
              </span>
            )}
          </div>
          <h3 className="text-xl lg:text-2xl font-serif text-[#1a1a1a] mb-3 leading-snug">
            {article.title || 'Sans titre'}
          </h3>
          {article.excerpt && (
            <p className="text-sm text-[#4a4a4a] leading-relaxed line-clamp-2 italic font-serif">
              {article.excerpt || "Aucun chapeau défini pour cet article."}
            </p>
          )}
          {article.editor_notes && (
            <div className="mt-4">
              <EditorialNotesBox notes={article.editor_notes} />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="md:w-48 shrink-0 flex flex-col gap-4 items-start pt-2">
          {canEdit && (
            <Link
              to={`/submit-article?id=${article.id}`}
              className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] border-b border-[#1a1a1a] pb-1 hover:text-[#8b6914] hover:border-[#8b6914] transition-all"
            >
              Modifier
            </Link>
          )}

          {canSubmit && (
            <button
              type="button"
              onClick={() => onSubmitForReview(article.id)}
              disabled={isPending}
              className="text-[10px] uppercase font-bold tracking-widest text-[#8b6914] border-b border-[#8b6914] pb-1 hover:text-[#c4965a] hover:border-[#c4965a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Envoi…' : 'Soumettre pour révision'}
            </button>
          )}

          {status === 'review' && (
            <span className="text-[10px] italic text-[#767676] leading-relaxed max-w-[140px]">
              En attente de révision éditoriale.
            </span>
          )}

          {status === 'published' && (
            <>
              <span className="text-[10px] italic text-[#767676] leading-relaxed max-w-[140px]">
                Article publié — modification réservée à l’administration.
              </span>
              {article.slug && (
                <Link
                  to={`/publications/${article.slug}`}
                  className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] border-b border-[#1a1a1a] pb-1 hover:text-[#8b6914] hover:border-[#8b6914] transition-all"
                >
                  Voir en ligne
                </Link>
              )}
            </>
          )}

          {status === 'archived' && (
            <span className="text-[10px] italic text-[#767676] leading-relaxed max-w-[140px]">
              Article archivé.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-[#d8d5ce] bg-[#faf9f6] p-10 lg:p-14 text-center">
      <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#8b6914] mb-6">
        Aucun article
      </p>
      <h3 className="text-2xl font-serif text-[#1a1a1a] mb-4">
        Vous n'avez pas encore soumis d'article
      </h3>
      <p className="text-sm text-[#4a4a4a] leading-relaxed max-w-md mx-auto mb-8">
        Rédigez votre premier brouillon. Il restera privé jusqu'à votre demande de révision.
      </p>
      <Link
        to="/submit-article"
        className="inline-block px-8 py-3 bg-[#8b6914] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#c4965a] transition-all"
      >
        Commencer un brouillon
      </Link>
    </div>
  );
}

// ─── Auth state components ──────────────────────────────────────────────────

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
          Pour consulter vos articles, vous devez être connecté avec un compte auteur.
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
