import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { calculateReadingTime } from '../lib/readingTime';
import EditorialActions from '../components/editorial/EditorialActions';
import EditorialTimeline from '../components/editorial/EditorialTimeline';
import ArticleCommentsBox from '../components/editorial/ArticleCommentsBox';
import StatusBadge from '../components/ui/StatusBadge';
import EditorialNotesBox from '../components/editorial/EditorialNotesBox';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://admin.projetceedo20.org';

export default function ArticlePreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadArticle();
  }, [id]);

  async function loadArticle() {
    setLoading(true);
    try {
      const data = await api.getArticleById(id);
      setArticle(data);
      document.title = `Aperçu : ${data.title} — Projet Ceedo 2.0`;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center py-32">
        <div className="w-12 h-12 border-4 border-[#C4965A]/20 border-t-[#C4965A] rounded-full animate-spin mb-4" />
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#767676] opacity-60">Préparation de l'aperçu...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <p className="text-[10px] uppercase font-bold tracking-widest text-[#8b6914] mb-4">Erreur</p>
        <h1 className="text-2xl font-serif text-[#1a1a1a] mb-6">{error || "Article introuvable"}</h1>
        <Link to="/editor" className="px-6 py-3 bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-widest">
          Retour au panel
        </Link>
      </div>
    );
  }

  const readingTime = calculateReadingTime(article.content);
  const featuredImageUrl = article.featured_image
    ? `${DIRECTUS_URL}/assets/${article.featured_image}`
    : null;

  return (
    <main className="bg-white min-h-screen flex flex-col">
      {/* Top Bar Navigation */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-[#d8d5ce] py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link to="/editor" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#767676] hover:text-[#1a1a1a] transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Panel Éditorial
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#767676]">Aperçu Éditorial</span>
            <StatusBadge status={article.status} />
          </div>
        </div>
      </div>

      <div className="flex-grow pb-32">
        <article className="max-w-4xl mx-auto px-6 pt-12 lg:pt-20">
          <EditorialNotesBox notes={article.editor_notes} />

          <header className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8b6914]">
                {article.category?.name || 'Sans catégorie'}
              </span>
              <span className="w-1 h-1 bg-[#d8d5ce] rounded-full" />
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#767676]">
                {readingTime} min de lecture
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-[#1a1a1a] leading-tight mb-8">
              {article.title}
            </h1>

            <div className="flex items-center gap-4 py-6 border-y border-[#faf9f6]">
              <div className="w-10 h-10 bg-[#faf9f6] rounded-full flex items-center justify-center text-[10px] font-bold text-[#8b6914] uppercase">
                {article.Author?.first_name?.[0]}{article.Author?.last_name?.[0]}
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a]">
                  {article.Author ? `${article.Author.first_name} ${article.Author.last_name}` : 'Auteur inconnu'}
                </span>
                <span className="block text-[10px] text-[#767676] mt-1 uppercase tracking-widest">
                  Chercheur Associé
                </span>
              </div>
            </div>
          </header>

          {featuredImageUrl && (
            <figure className="mb-12">
              <img
                src={featuredImageUrl}
                alt={article.title}
                className="w-full h-auto object-cover grayscale-[0.5] hover:grayscale-0 transition-all duration-700"
              />
            </figure>
          )}

          <div className="prose prose-serif prose-lg max-w-none text-[#4a4a4a] leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>

          <div className="mt-20 pt-20 border-t border-[#faf9f6] grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <ArticleCommentsBox articleId={article.id} />
            </div>
            <div className="lg:col-span-1">
              <EditorialTimeline article={article} />
            </div>
          </div>
        </article>
      </div>

      <EditorialActions 
        article={article} 
        onActionComplete={() => {
          window.scrollTo(0, 0);
          loadArticle();
        }} 
      />
    </main>
  );
}
