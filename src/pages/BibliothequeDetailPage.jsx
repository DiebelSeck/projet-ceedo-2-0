import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import SectionHeader from '../components/ui/SectionHeader';

export default function BibliothequeDetailPage() {
  const { slug } = useParams();
  const [doc, setDoc] = useState(null);
  const [related, setRelated] = useState([]);
  const [analyzedIn, setAnalyzedIn] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getLibraryDocumentBySlug(slug);
        if (!data) {
          setError('Document non indexé');
        } else {
          setDoc(data);
          const [relatedDocs, articles] = await Promise.all([
            api.getRelatedLibraryDocuments(data, 3),
            api.getArticlesByLibrarySource(data.tags, 3)
          ]);
          setRelated(relatedDocs);
          setAnalyzedIn(articles);
        }
      } catch (err) {
        console.error("Erreur document:", err);
        setError('Une erreur est survenue lors de l\'accès aux archives.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center py-32">
        <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-4"></div>
        <div className="text-ink-muted text-[10px] uppercase tracking-[0.4em] font-bold opacity-60">Consultation des registres...</div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center py-32 text-center px-6">
        <h2 className="text-3xl font-serif text-ink mb-4 italic">Source non localisée</h2>
        <p className="text-ink-muted mb-8">{error || 'Le document demandé n\'existe pas dans notre base de données.'}</p>
        <Link to="/library" className="text-[10px] uppercase font-bold tracking-widest text-gold border-b border-gold pb-1">
          Retour à la bibliothèque
        </Link>
      </div>
    );
  }

  const tagsByType = doc.tags.reduce((acc, tag) => {
    const typeKey = tag.type || 'Autres';
    if (!acc[typeKey]) acc[typeKey] = [];
    acc[typeKey].push(tag);
    return acc;
  }, {});

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copié dans le presse-papier');
  };

  return (
    <main className="bg-white min-h-screen pb-32">
      {/* 1. Institutional Header */}
      <header className="bg-parchment-pale pt-32 pb-20 md:pt-48 md:pb-32 border-b border-border-light/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-4xl">
            <div className="mb-12">
              <SectionHeader
                eyebrow={`Source ${doc.sourceType}`}
                title={doc.title}
              />
            </div>

            <div className="flex flex-wrap gap-x-12 gap-y-6 text-lg font-serif italic text-ink-light opacity-90 border-l-2 border-gold pl-8">
               <div>
                  <span className="block text-[9px] uppercase tracking-widest font-bold text-ink-muted not-italic opacity-50 mb-1">Auteur</span>
                  {doc.author}
               </div>
               <div>
                  <span className="block text-[9px] uppercase tracking-widest font-bold text-ink-muted not-italic opacity-50 mb-1">Année</span>
                  {doc.year || 'S.D.'}
               </div>
               <div>
                  <span className="block text-[9px] uppercase tracking-widest font-bold text-ink-muted not-italic opacity-50 mb-1">Format</span>
                  {doc.documentType}
               </div>
               <div>
                  <span className="block text-[9px] uppercase tracking-widest font-bold text-ink-muted not-italic opacity-50 mb-1">Langue</span>
                  {doc.language.toUpperCase()}
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Action Bar */}
      <div className="sticky top-[72px] z-30 bg-white/95 backdrop-blur-md border-b border-border-light/40 py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-6">
           <div className="flex items-center gap-2">
              <Link to="/library" className="text-gold hover:text-ink transition-colors">
                <span className="text-xl">←</span>
              </Link>
              <span className="text-[10px] uppercase font-bold tracking-widest text-ink-muted">Bibliothèque</span>
           </div>
           
           <div className="flex items-center gap-4">
              <a 
                href={doc.fileUrl || '#'} 
                className="px-8 py-3 bg-ink text-white text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-gold transition-colors"
                target="_blank" rel="noopener noreferrer"
              >
                Consulter le document
              </a>
              <button 
                onClick={() => copyToClipboard(doc.citation || `${doc.author} (${doc.year}). ${doc.title}. Ceedo Archive.`)}
                className="px-6 py-3 border border-border-light text-ink-muted text-[10px] uppercase font-bold tracking-[0.2em] hover:border-gold hover:text-gold transition-colors"
              >
                Citer
              </button>
           </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          <div className="lg:col-span-8 space-y-24">
            {/* 3. Abstract / Notice */}
            <section>
              <h2 className="text-[10px] uppercase tracking-[0.5em] font-bold text-gold mb-12 flex items-center gap-4">
                <span className="w-12 h-[1px] bg-gold"></span>
                Notice Documentaire
              </h2>
              <div className="prose prose-xl prose-serif text-ink leading-[1.8] max-w-none italic">
                 {doc.abstract}
              </div>
            </section>

            {/* 4. Optional Institutional Context */}
            {doc.context && (
              <section className="bg-parchment/10 p-12 border border-border-light/40 relative">
                <div className="absolute top-0 left-0 w-2 h-full bg-gold"></div>
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink-muted mb-8 opacity-60">Pourquoi cette source ?</h3>
                <p className="text-lg font-serif text-ink leading-relaxed italic opacity-80">
                  {doc.context}
                </p>
                <p className="mt-8 text-[9px] uppercase tracking-widest font-bold text-ink opacity-40">
                  — Cadre Scientifique Projet Ceedo 2.0
                </p>
              </section>
            )}

            {/* 5. Citation Block */}
            <section className="bg-ink p-12 text-white overflow-hidden relative group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
               <h3 className="text-[10px] uppercase tracking-[0.4em] text-gold mb-10">Référence bibliographique</h3>
               <div className="bg-white/5 border border-white/10 p-8 font-serif text-lg text-white/90 leading-relaxed italic mb-8 select-all">
                 {doc.citation || `${doc.author} (${doc.year}). ${doc.title}. Projet Ceedo Infrastructure.`}
               </div>
               <div className="flex flex-wrap gap-6">
                 <button 
                   onClick={() => copyToClipboard(doc.citation || `${doc.author} (${doc.year}). ${doc.title}. Projet Ceedo Infrastructure.`)}
                   className="text-[9px] uppercase font-bold tracking-[0.3em] border-b border-gold pb-1 hover:text-gold transition-colors"
                 >
                   Copier la citation
                 </button>
                 <button 
                   onClick={() => copyToClipboard(window.location.href)}
                   className="text-[9px] uppercase font-bold tracking-[0.3em] border-b border-white/30 pb-1 hover:border-white transition-colors"
                 >
                   Lien permanent
                 </button>
               </div>
            </section>

            {/* NEW: Analyzed In (Articles) */}
            {analyzedIn.length > 0 && (
              <section className="pt-24 border-t border-border-light/30">
                <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-ink-muted mb-16">
                   Analysé dans (Contributions)
                </h3>
                <div className="space-y-12">
                   {analyzedIn.map(article => (
                     <Link 
                       key={article.id} 
                       to={`/articles/${article.slug}`}
                       className="group block"
                     >
                        <div className="text-[8px] uppercase tracking-widest font-bold text-gold mb-3 opacity-60">Étude scientifique</div>
                        <h4 className="text-2xl font-serif text-ink group-hover:text-gold transition-colors leading-tight mb-4">
                          {article.title}
                        </h4>
                        <p className="text-sm text-ink-muted font-serif italic line-clamp-2 leading-relaxed opacity-70">
                          {article.excerpt}
                        </p>
                        <div className="mt-6 text-[9px] uppercase font-bold tracking-widest text-ink group-hover:translate-x-2 transition-transform duration-500">
                          Lire l'analyse →
                        </div>
                     </Link>
                   ))}
                </div>
              </section>
            )}
          </div>

          <aside className="lg:col-span-4 space-y-24 sticky top-44 h-fit">
            {/* 6. Corpus Association */}
            {doc.relatedCorpus?.length > 0 && (
              <section>
                 <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-ink-muted mb-8 border-b border-border-light pb-4">Nœuds de connaissance</h3>
                 <div className="space-y-4">
                    {doc.relatedCorpus.map(corpus => (
                      <Link 
                        key={corpus.id} 
                        to={`/dossiers/${corpus.slug}`}
                        className="group block p-6 bg-parchment/20 border border-border-light/40 hover:border-gold/30 transition-all"
                      >
                        <div className="text-[8px] uppercase tracking-widest font-bold text-gold mb-2">Corpus</div>
                        <h4 className="text-lg font-serif text-ink group-hover:text-gold transition-colors leading-tight">
                          {corpus.title}
                        </h4>
                        <div className="mt-4 text-[9px] uppercase font-bold tracking-widest text-ink/40 group-hover:translate-x-1 transition-transform">
                          Explorer le corpus →
                        </div>
                      </Link>
                    ))}
                 </div>
              </section>
            )}

            {/* Cadre Méthodologique (MAI) Anchor */}
            <section className="bg-parchment-pale/50 p-8 border border-border-light/30">
               <h3 className="text-[9px] uppercase tracking-[0.4em] font-bold text-ink-muted mb-4 opacity-60">Cadre Méthodologique</h3>
               <p className="text-xs font-serif text-ink leading-relaxed italic mb-6">
                 Cette source est traitée selon les principes de la Méthode Africaine Interne (MAI), garantissant une analyse endogène rigoureuse.
               </p>
               <Link to="/projet/methodologie" className="text-[9px] uppercase font-bold tracking-widest text-gold border-b border-gold pb-0.5 hover:text-ink hover:border-ink transition-colors">
                 Consulter la charte MAI →
               </Link>
            </section>

            {/* 7. Semantic Network */}
            <section className="space-y-12">
               <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-ink-muted mb-8 border-b border-border-light pb-4">Axes Sémantiques</h3>
               <div className="space-y-8">
                  {Object.entries(tagsByType).map(([type, tags]) => (
                    <div key={type}>
                      <h4 className="text-[9px] uppercase tracking-widest font-bold text-gold mb-4">{type}</h4>
                      <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                          <Link 
                            key={tag.id}
                            to={`/explorer/${tag.type?.toLowerCase().replace(/\s/g, '-') || 'non-classe'}/${tag.slug}`}
                            className="text-xs font-serif text-ink-muted hover:text-ink transition-colors"
                          >
                            #{tag.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
               </div>
            </section>

            {/* 8. Related Sources */}
            {related.length > 0 && (
              <section>
                 <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-ink-muted mb-8 border-b border-border-light pb-4">Proximité Bibliographique</h3>
                 <div className="space-y-6">
                    {related.map(item => (
                      <Link 
                        key={item.id} 
                        to={`/bibliotheque/${item.slug}`}
                        className="group block"
                      >
                        <div className="text-[8px] uppercase tracking-widest font-bold text-gold/60 mb-1">{item.documentType}</div>
                        <h4 className="text-base font-serif text-ink group-hover:text-gold transition-colors leading-snug">
                          {item.title}
                        </h4>
                        <div className="text-[10px] font-serif italic text-ink-muted opacity-60">
                          {item.author}, {item.year}
                        </div>
                      </Link>
                    ))}
                 </div>
              </section>
            )}
          </aside>

        </div>
      </div>

      {/* Institutional Footer */}
      <footer className="py-20 border-t border-border-light/30 flex flex-col items-center">
         <p className="text-[10px] uppercase tracking-[0.5em] text-ink-muted/40 font-bold">
            Documentary Archive — Projet Ceedo 2.0
         </p>
      </footer>
    </main>
  );
}
