import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import PublicationCard from '../components/ui/PublicationCard';
import SectionHeader from '../components/ui/SectionHeader';

export default function CorpusDetailPage() {
  const { slug } = useParams();
  const [corpus, setCorpus] = useState(null);
  const [relatedCorpus, setRelatedCorpus] = useState([]);
  const [librarySources, setLibrarySources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCorpus() {
      try {
        setLoading(true);
        const data = await api.getDossierBySlug(slug);
        if (!data) {
          setError('Corpus non trouvé');
        } else {
          setCorpus(data);
          // Fetch related knowledge components
          const [related, sources] = await Promise.all([
            api.getRelatedDossiers(data, 3),
            api.getLibraryDocumentsByCorpus(slug)
          ]);
          setRelatedCorpus(related);
          setLibrarySources(sources);
        }
      } catch (err) {
        setError('Erreur lors de l\'ouverture du corpus');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadCorpus();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center py-32">
        <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-4"></div>
        <div className="text-ink-muted text-xs uppercase tracking-[0.4em] font-bold">Ouverture du Corpus...</div>
      </div>
    );
  }

  if (error || !corpus) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center py-32 text-center px-6">
        <h2 className="text-3xl font-serif text-ink mb-4 italic">Document non indexé</h2>
        <p className="text-ink-muted mb-8">{error || 'Le corpus demandé n\'existe pas dans nos archives.'}</p>
        <Link to="/articles" className="text-[10px] uppercase font-bold tracking-widest text-gold border-b border-gold pb-1">
          Retour aux articles
        </Link>
      </div>
    );
  }

  // Extract unique semantic tags from the corpus articles
  const allTags = corpus.articles?.flatMap(a => a.tags || []) || [];
  const groupedTags = api.groupTagsByType(allTags);
  const priorities = ['Discipline', 'Période', 'Approche'];

  return (
    <main className="bg-white min-h-screen">
      {/* 1. Institutional Hero */}
      <div className="relative bg-parchment-pale py-24 md:py-40 overflow-hidden border-b border-border-light/30">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gold/5 -skew-x-12 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <SectionHeader
              eyebrow="Réseau de Savoir"
              title={corpus.title}
              subtitle={corpus.editorial_intro}
            />
          </div>
        </div>
      </div>

      {/* 2. Editorial Positioning Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-32">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            <div className="lg:col-span-8">
               <h2 className="text-[10px] uppercase tracking-[0.5em] font-bold text-gold mb-12 flex items-center gap-4">
                  <span className="w-12 h-[1px] bg-gold"></span>
                  Positionnement Épistémologique
               </h2>
               <div className="prose prose-xl prose-serif text-ink leading-[1.8] max-w-none italic whitespace-pre-line">
                  {corpus.positioning || (
                    <p>
                      Le corpus <span className="text-gold font-bold">"{corpus.title}"</span> s'inscrit dans une démarche de déconstruction et de reconstruction des savoirs au sein de l'infrastructure Ceedo.
                      Il interroge les paradigmes dominants en proposant une lecture transversale et analytique des sources indexées.
                    </p>
                  )}
               </div>
            </div>

            <div className="lg:col-span-4 border-l border-border-light pl-12">
               <div className="space-y-12">
                  <div>
                    <h3 className="text-[9px] uppercase tracking-[0.3em] font-bold text-ink-muted mb-4 opacity-60">Coordination scientifique</h3>
                    <p className="text-lg font-serif text-ink">{corpus.coordinator || 'Direction Projet Ceedo'}</p>
                  </div>
                  <div>
                    <h3 className="text-[9px] uppercase tracking-[0.3em] font-bold text-ink-muted mb-4 opacity-60">Dernière mise à jour</h3>
                    <p className="text-lg font-serif text-ink">
                      {new Date(corpus.date_published).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="pt-8 border-t border-border-light/40">
                     <div className="text-[9px] uppercase tracking-[0.3em] font-bold text-ink-muted mb-6 opacity-60">Densité du réseau</div>
                     <div className="flex items-baseline gap-2">
                       <span className="text-3xl font-serif text-gold">{corpus.articles?.length || 0}</span>
                       <span className="text-[10px] uppercase tracking-widest text-ink-muted font-bold whitespace-nowrap">Articles</span>
                     </div>
                  </div>
                  <div className="pt-8 border-t border-border-light/40">
                     <div className="text-[9px] uppercase tracking-[0.3em] font-bold text-ink-muted mb-6 opacity-60">Amplitude sémantique</div>
                     <div className="flex items-baseline gap-2">
                       <span className="text-3xl font-serif text-gold">{Object.keys(groupedTags).length}</span>
                       <span className="text-[10px] uppercase tracking-widest text-ink-muted font-bold whitespace-nowrap">Axes actifs</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* 3. Articles Section (Curated Grid) */}
      <section className="bg-parchment/10 py-32 border-y border-border-light/40">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-[10px] uppercase tracking-[0.5em] font-bold text-ink-muted mb-20 text-center">
            Cartographie des contributions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
            {corpus.articles?.map((article, index) => (
              <div key={article.id} className="relative">
                <span className="absolute -left-12 top-0 text-3xl font-serif text-gold/20 font-bold">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <PublicationCard publication={article} variant="featured" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Semantic Network & Related Corpus */}
      <div className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* Active Semantic Axes */}
          <div className="lg:col-span-8 space-y-24">
            <section>
              <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-ink-muted mb-16 border-l-4 border-gold pl-6">
                Axes conceptuels dominants
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
                {priorities.map(axis => (
                  <div key={axis} className="space-y-6 group">
                    <h4 className="text-[9px] uppercase tracking-[0.2em] font-bold text-gold group-hover:translate-x-1 transition-transform">{axis}</h4>
                    <div className="flex flex-col gap-4">
                      {groupedTags[axis]?.slice(0, 6).map(tag => (
                        <Link 
                          key={tag.id}
                          to={`/explorer/${tag.type?.slug || 'non-classe'}/${tag.slug}`}
                          className="text-sm font-serif text-ink-muted hover:text-ink transition-colors border-b border-transparent hover:border-gold-pale w-fit flex items-center gap-2 group/link"
                        >
                          <span className="w-1 h-1 rounded-full bg-gold/20 group-hover/link:bg-gold transition-colors"></span>
                          {tag.name}
                        </Link>
                      )) || <span className="text-xs text-ink-muted/50 italic">Non spécifié</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Related Corpus Section */}
            <section className="pt-24 border-t border-border-light/30">
              <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-ink-muted mb-16">
                 Prolongements thématiques
              </h3>
              
              {relatedCorpus.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {relatedCorpus.map(item => (
                    <Link 
                      key={item.id} 
                      to={`/dossiers/${item.slug}`}
                      className="group block p-8 bg-parchment/10 border border-border-light/40 hover:border-gold/30 transition-all duration-500"
                    >
                      <div className="text-[8px] uppercase tracking-widest font-bold text-gold mb-4 opacity-60">Corpus associé</div>
                      <h4 className="text-xl font-serif text-ink mb-4 group-hover:text-gold transition-colors leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-xs text-ink-muted font-serif italic line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                        {item.editorial_intro}
                      </p>
                      <div className="mt-6 text-[9px] uppercase font-bold tracking-widest text-ink group-hover:translate-x-2 transition-transform duration-500">
                        Explorer le nœud →
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-12 bg-parchment/5 border border-border-light/20 text-center">
                  <p className="text-sm font-serif text-ink-muted italic">
                    Aucune résonance sémantique directe n'est actuellement identifiée avec d'autres corpus de l'infrastructure.
                  </p>
                </div>
              )}
            </section>
            
            {/* Bibliothèque Integration: Sources & Références */}
            <section className="pt-24 border-t border-border-light/30">
               <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-ink-muted mb-16">
                  Sources & Références (Bibliothèque)
               </h3>
               
               {librarySources.length > 0 ? (
                 <div className="space-y-8">
                   {librarySources.map(source => (
                     <Link 
                       key={source.id} 
                       to={`/bibliotheque/${source.slug}`}
                       className="group block py-6 border-b border-border-light/20 last:border-0 hover:translate-x-2 transition-transform duration-500"
                     >
                        <div className="flex flex-wrap items-center gap-4 mb-3">
                          <span className="text-[8px] uppercase tracking-widest font-bold text-gold opacity-60">
                            Source {source.sourceType}
                          </span>
                          <span className="text-[8px] uppercase tracking-widest font-bold text-ink-muted/40">
                            {source.documentType}
                          </span>
                        </div>
                        <h4 className="text-xl font-serif text-ink group-hover:text-gold transition-colors leading-tight mb-2">
                          {source.title}
                        </h4>
                        <div className="text-sm font-serif italic text-ink-muted opacity-80">
                          {source.author}, {source.year || 'S.D.'}
                        </div>
                     </Link>
                   ))}
                 </div>
               ) : (
                 <div className="bg-parchment-pale/50 p-12 border border-dashed border-border-light text-center">
                    <p className="text-sm font-serif text-ink-muted italic mb-6">
                      L'inventaire des sources primaires et monographies liées à ce corpus est en cours de numérisation.
                    </p>
                    <div className="text-[9px] uppercase tracking-widest font-bold text-gold/50">
                      Infrastructure en cours de déploiement
                    </div>
                 </div>
               )}
            </section>
          </div>

          {/* Institutional Navigation */}
          <div className="lg:col-span-4 bg-ink p-12 text-white relative group overflow-hidden sticky top-24">
             <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>
             <h4 className="text-[10px] uppercase tracking-[0.4em] text-gold mb-8">Navigation Systémique</h4>
             <p className="text-sm font-serif text-white/70 italic leading-relaxed mb-10">
                L'infrastructure Ceedo vous permet de croiser les savoirs à través una navegación sémantique multi-axiale. Cada corpus es un nodo activo en nuestra red de conocimiento.
             </p>
             <Link to="/explorer" className="inline-block text-[9px] uppercase font-bold tracking-[0.3em] border-b border-gold pb-1 hover:text-gold transition-colors">
                Voir tous los ejes de investigación →
              </Link>
          </div>
      </div>
    </div>


      {/* Institutional Finale */}
      <footer className="py-20 border-t border-border-light/30 flex flex-col items-center">
         <p className="text-[10px] uppercase tracking-[0.5em] text-ink-muted/40 font-bold">
            Projet Ceedo 2.0 — Infrastructure intellectuelle
         </p>
      </footer>
    </main>
  );
}

