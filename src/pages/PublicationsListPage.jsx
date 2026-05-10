import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import PublicationCard from '../components/ui/PublicationCard';
import SectionHeader from '../components/ui/SectionHeader';

export default function PublicationsListPage() {
  const [publications, setPublications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [pubsData, catsData] = await Promise.all([
          api.getArticles({ 
            limit: 12,
            category: activeCategory !== 'Tous' ? activeCategory : undefined 
          }),
          api.getCategories()
        ]);
        setPublications(pubsData || []);
        setCategories(catsData || []);
      } catch (err) {
        console.error('Error loading publications:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    window.scrollTo(0, 0);
  }, [activeCategory]);

  return (
    <div className="bg-white min-h-screen">
      {/* Editorial Header */}
      <div className="bg-parchment-pale py-20 md:py-32 border-b border-border-light/30">
        <div className="max-w-7xl mx-auto px-6">
          <header className="max-w-3xl">
            <SectionHeader
              eyebrow="Le Corpus"
              title="Archives & Publications"
              subtitle="Articles, dossiers thématiques, recensions critiques et traductions inédites. Une infrastructure de production du savoir panafricain soumise à la révision par les pairs."
            />
          </header>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        {/* Academic Taxonomy Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 border-b border-border-light pb-8">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <button
              onClick={() => setActiveCategory('Tous')}
              className={`text-[10px] uppercase font-bold tracking-[0.3em] transition-all relative pb-2 ${
                activeCategory === 'Tous'
                  ? 'text-gold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-gold'
                  : 'text-ink-muted hover:text-ink after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[1px] after:bg-border-light after:transition-all'
              }`}
            >
              Tous les écrits
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`text-[10px] uppercase font-bold tracking-[0.3em] transition-all relative pb-2 ${
                  activeCategory === cat.slug
                    ? 'text-gold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-gold'
                    : 'text-ink-muted hover:text-ink after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[1px] after:bg-border-light after:transition-all'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="text-[9px] uppercase tracking-[0.2em] text-ink-muted font-bold italic opacity-60">
            {publications.length} Contribution(s) indexée(s)
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-[400px] bg-parchment/50 border border-border-light/20"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {publications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-16 gap-x-12">
                {publications.map((pub) => (
                  <PublicationCard key={pub.id} publication={pub} variant="featured" />
                ))}
              </div>
            ) : (
              <div className="py-32 text-center">
                 <h3 className="text-2xl font-serif text-ink-muted italic">Aucun document ne correspond à cette classification.</h3>
              </div>
            )}

            {/* Academic Pagination */}
            {publications.length >= 12 && (
              <div className="mt-24 pt-12 border-t border-border-light flex justify-center">
                <button className="group flex flex-col items-center gap-4 text-ink hover:text-gold transition-colors">
                  <span className="text-[10px] uppercase font-bold tracking-[0.5em]">Consulter la suite des archives</span>
                  <span className="text-2xl group-hover:translate-y-2 transition-transform duration-500">↓</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

