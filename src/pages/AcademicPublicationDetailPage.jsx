import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import StatusBadge from '../components/ui/StatusBadge';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://admin.projetceedo20.org';

export default function AcademicPublicationDetailPage() {
  const { slug } = useParams();
  const [pub, setPub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getPublicationBySlug(slug);
        if (!data) setError('Publication introuvable');
        else setPub(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-32">
      <div className="w-12 h-12 border-4 border-[#C4965A]/20 border-t-[#C4965A] rounded-full animate-spin mb-4" />
      <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#767676]">Chargement de l'étude...</p>
    </div>
  );

  if (error || !pub) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-serif text-[#1a1a1a] mb-6">{error || "Document introuvable"}</h1>
      <Link to="/publications" className="px-6 py-3 bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-widest">
        Retour aux publications
      </Link>
    </div>
  );

  const coverUrl = pub.cover_image ? `${DIRECTUS_URL}/assets/${pub.cover_image}` : null;
  const pdfUrl = pub.pdf_file ? `${DIRECTUS_URL}/assets/${pub.pdf_file}` : null;

  return (
    <main className="bg-white min-h-screen">
      {/* Header Section */}
      <header className="bg-[#faf9f6] border-b border-[#d8d5ce]/30 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#8b6914]">
              {pub.category?.name || 'Publication de Recherche'}
            </span>
            <span className="w-1 h-1 bg-[#d8d5ce] rounded-full" />
            <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#767676]">
              {new Date(pub.published_at || pub.date_created).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-[#1a1a1a] leading-tight mb-10">
            {pub.title}
          </h1>

          <div className="flex flex-wrap items-center gap-8 py-8 border-y border-[#d8d5ce]/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#1a1a1a] text-white flex items-center justify-center text-[10px] font-bold uppercase">
                {pub.author?.first_name?.[0]}{pub.author?.last_name?.[0]}
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a]">
                  {pub.author ? `${pub.author.first_name} ${pub.author.last_name}` : 'Ceedo Research'}
                </span>
                <span className="block text-[9px] text-[#767676] uppercase tracking-widest mt-0.5">Auteur Principal</span>
              </div>
            </div>

            {pub.doi && (
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#767676]">
                DOI : <span className="text-[#1a1a1a]">{pub.doi}</span>
              </div>
            )}

            {pdfUrl && (
              <a 
                href={pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-auto px-6 py-2.5 bg-[#8b6914] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#1a1a1a] transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Télécharger le PDF
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 py-20 lg:py-32">
        {/* Abstract */}
        <section className="mb-20">
          <h2 className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#8b6914] mb-6 border-b border-[#faf9f6] pb-2">Résumé exécutif</h2>
          <div className="text-lg font-serif italic text-[#4a4a4a] leading-relaxed bg-[#faf9f6] p-8 lg:p-12 border-l-4 border-[#8b6914]">
            {pub.abstract}
          </div>
        </section>

        {/* Cover Image */}
        {coverUrl && (
          <figure className="mb-20">
            <img src={coverUrl} alt={pub.title} className="w-full h-auto grayscale-[0.2]" />
          </figure>
        )}

        {/* Main Content */}
        <article className="prose prose-serif prose-lg max-w-none text-[#1a1a1a] leading-relaxed mb-32">
          <div dangerouslySetInnerHTML={{ __html: pub.content }} />
        </article>

        {/* Keywords */}
        {pub.keywords && pub.keywords.length > 0 && (
          <section className="mb-20 pt-12 border-t border-[#faf9f6]">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#767676] mb-4">Mots-clés</h3>
            <div className="flex flex-wrap gap-2">
              {pub.keywords.map((kw, i) => (
                <span key={i} className="px-3 py-1 bg-[#faf9f6] text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a]">
                  {kw}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* References */}
        {pub.references && (
          <section className="bg-[#faf9f6] p-10 lg:p-14">
            <h3 className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#8b6914] mb-8 border-b border-[#d8d5ce] pb-4">Références & Bibliographie</h3>
            <div className="text-sm font-serif text-[#4a4a4a] space-y-4">
              {/* Assuming references is an array or object from JSON */}
              {Array.isArray(pub.references) ? pub.references.map((ref, i) => (
                <div key={i} className="pl-4 border-l border-[#d8d5ce] py-1">
                  {typeof ref === 'string' ? ref : JSON.stringify(ref)}
                </div>
              )) : (
                <pre className="whitespace-pre-wrap">{JSON.stringify(pub.references, null, 2)}</pre>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
