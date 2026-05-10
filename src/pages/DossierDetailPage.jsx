import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import SectionHeader from '../components/ui/SectionHeader';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://admin.projetceedo20.org';

export default function DossierDetailPage() {
  const { slug } = useParams();
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getDossierBySlug(slug);
        if (!data) setError('Dossier introuvable');
        else setDossier(data);
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
      <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#767676]">Initialisation du dossier...</p>
    </div>
  );

  if (error || !dossier) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-serif text-[#1a1a1a] mb-6">{error || "Dossier introuvable"}</h1>
      <Link to="/dossiers" className="px-6 py-3 bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-widest">
        Retour aux dossiers
      </Link>
    </div>
  );

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Header */}
      <div className="relative h-[60vh] flex items-center justify-center bg-black overflow-hidden">
        {dossier.cover_image && (
          <img 
            src={`${DIRECTUS_URL}/assets/${dossier.cover_image}`} 
            alt={dossier.title}
            className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale"
          />
        )}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <SectionHeader
            eyebrow="Dossier Thématique"
            title={dossier.title}
            subtitle={dossier.description}
            dark={true}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Main Content: Related Articles & Publications */}
          <div className="lg:col-span-8 space-y-24">
            
            {/* Articles Section */}
            {dossier.articles && dossier.articles.length > 0 && (
              <section>
                <h2 className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#8b6914] mb-12 border-b border-[#faf9f6] pb-4 flex items-center justify-between">
                  Articles de Fond
                  <span className="text-[#767676]">{dossier.articles.length}</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {dossier.articles.map(article => (
                    <ResourceCard key={article.id} item={article} type="article" />
                  ))}
                </div>
              </section>
            )}

            {/* Publications Section */}
            {dossier.publications && dossier.publications.length > 0 && (
              <section>
                <h2 className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#8b6914] mb-12 border-b border-[#faf9f6] pb-4 flex items-center justify-between">
                  Études Académiques
                  <span className="text-[#767676]">{dossier.publications.length}</span>
                </h2>
                <div className="space-y-8">
                  {dossier.publications.map(pub => (
                    <ResourceCard key={pub.id} item={pub} type="publication" horizontal />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-12">
              <div className="bg-[#faf9f6] p-8 border border-[#d8d5ce]">
                <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] mb-6">À propos de ce dossier</h3>
                <p className="text-sm text-[#4a4a4a] leading-relaxed font-serif italic">
                  Ce corpus rassemble les réflexions critiques et les recherches documentaires nécessaires à la compréhension globale de cet axe de recherche du système Ceedo.
                </p>
                <div className="mt-8 pt-8 border-t border-[#d8d5ce]">
                  <span className="block text-[8px] uppercase font-bold text-[#767676] mb-2">Total Ressources</span>
                  <span className="text-2xl font-serif text-[#1a1a1a]">
                    {(dossier.articles?.length || 0) + (dossier.publications?.length || 0)}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ResourceCard({ item, type, horizontal = false }) {
  const coverUrl = item.cover_image || item.featured_image ? `${DIRECTUS_URL}/assets/${item.cover_image || item.featured_image}` : null;
  const link = type === 'article' ? `/articles/${item.slug}` : `/publications/${item.slug}`; 
  // Wait, if articles move to /articles, I should update this.

  if (horizontal) {
    return (
      <Link to={link} className="group flex flex-col sm:flex-row border border-[#d8d5ce] hover:border-[#8b6914] transition-all bg-white overflow-hidden">
        {coverUrl && (
          <div className="sm:w-32 lg:w-48 shrink-0 aspect-[4/3] sm:aspect-auto">
            <img src={coverUrl} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
          </div>
        )}
        <div className="p-6">
          <span className="text-[8px] uppercase font-bold tracking-widest text-[#8b6914] mb-2 block">{type}</span>
          <h4 className="text-lg font-serif font-bold text-[#1a1a1a] group-hover:text-[#8b6914] transition-colors leading-tight mb-2">{item.title}</h4>
          <p className="text-xs text-[#767676] line-clamp-2">{item.abstract || item.excerpt}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link to={link} className="group flex flex-col border border-[#d8d5ce] hover:border-[#8b6914] transition-all bg-white overflow-hidden">
      {coverUrl && (
        <div className="aspect-video overflow-hidden">
          <img src={coverUrl} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
        </div>
      )}
      <div className="p-8 flex-grow">
        <span className="text-[8px] uppercase font-bold tracking-widest text-[#8b6914] mb-3 block">{type}</span>
        <h4 className="text-xl font-serif font-bold text-[#1a1a1a] group-hover:text-[#8b6914] transition-colors leading-tight mb-4">{item.title}</h4>
        <p className="text-sm text-[#4a4a4a] leading-relaxed line-clamp-3 italic font-serif">{item.abstract || item.excerpt}</p>
      </div>
    </Link>
  );
}
