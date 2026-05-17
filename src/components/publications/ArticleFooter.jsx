import React from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import ReferencesBlock from './ReferencesBlock';
import RelatedArticlesBlock from './RelatedArticlesBlock';

export default function ArticleFooter({ article }) {
  if (!article) return null;
  const { footnotes, references, tags, author, title, slug, dossier } = article;
  const groupedTags = api.groupTagsByType(tags);

  const currentYear = new Date().getFullYear();
  const citationText = `${author?.fullName || 'RÃ©daction Ceedo'}. "${title}". Projet Ceedo 2.0, ${currentYear}.`;
  const articleUrl = window.location.href;

  const handleCopy = (text, btnId) => {
    navigator.clipboard.writeText(text);
    const btn = document.getElementById(btnId);
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = "[ CopiÃ© ! ]";
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 2000);
    }
  };

  return (
    <footer className="mt-20 md:mt-32 space-y-16 md:space-y-24">
      {/* 1. Footnotes (Scholarly Apparatus) */}
      {footnotes && (
        <section className="pt-10 md:pt-12 border-t border-border-light">
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 md:mb-10 text-ink-muted flex items-center gap-4">
             <span className="w-10 h-[1px] bg-gold-pale"></span>
             Notes de bas de page
          </h3>
          <div 
            className="text-[13px] text-ink-muted leading-relaxed space-y-4 font-serif italic max-w-2xl"
            dangerouslySetInnerHTML={{ __html: footnotes }}
          />
        </section>
      )}

      {/* 2. References (Bibliography) */}
      <ReferencesBlock references={references} />

      {/* 3. Institutional Citation Card */}
      <section className="bg-parchment/10 border border-border-light p-8 md:p-16 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full -translate-y-32 translate-x-32"></div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 items-start">
            <div className="lg:col-span-8">
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-gold mb-8 md:mb-10">
                    RÃ©fÃ©rence de citation acadÃ©mique
                </h3>
                <p className="text-xl md:text-2xl font-serif italic text-ink leading-[1.4] mb-10 md:mb-12">
                    {citationText}
                </p>
                <div className="flex flex-wrap gap-6 md:gap-8">
                    <button 
                        id="copy-citation-footer"
                        onClick={() => handleCopy(citationText, 'copy-citation-footer')}
                        className="text-[10px] uppercase font-bold tracking-widest text-ink hover:text-gold transition-colors flex items-center gap-2"
                    >
                        [ Copier la rÃ©fÃ©rence ]
                    </button>
                    <button 
                        id="copy-link-footer"
                        onClick={() => handleCopy(articleUrl, 'copy-link-footer')}
                        className="text-[10px] uppercase font-bold tracking-widest text-ink hover:text-gold transition-colors flex items-center gap-2"
                    >
                        [ Copier le lien permanent ]
                    </button>
                </div>
            </div>

            <div className="lg:col-span-4 lg:border-l lg:border-border-light lg:pl-12 space-y-6 md:space-y-8">
                <div>
                   <h4 className="text-[9px] uppercase tracking-[0.2em] font-bold text-ink-muted mb-3 md:mb-4 opacity-60">Source de publication</h4>
                   <p className="text-xs font-bold text-ink uppercase tracking-widest">Projet Ceedo 2.0</p>
                </div>
                <div>
                   <h4 className="text-[9px] uppercase tracking-[0.2em] font-bold text-ink-muted mb-3 md:mb-4 opacity-60">Identifiant Digital</h4>
                   <p className="text-[10px] font-mono text-ink-muted break-all opacity-80">
                      ID: ceedo-pub-{slug}
                   </p>
                </div>
            </div>
        </div>
      </section>

      {/* 4. Semantic Knowledge Axes */}
      {tags && tags.length > 0 && (
        <section className="pt-12 md:pt-16 border-t border-border-light">
          <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-ink-muted mb-12 md:mb-16 px-2 border-l-4 border-gold">
             Classification du savoir et indexation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 md:gap-y-16 gap-x-12">
            {Object.entries(groupedTags).map(([type, items]) => (
              <div key={type} className="group/axe">
                <h4 className="text-[9px] uppercase tracking-[0.2em] font-bold text-gold mb-4 md:mb-6 group-hover/axe:translate-x-1 transition-transform">
                  {type}
                </h4>
                <div className="flex flex-col gap-3 md:gap-4">
                  {items.map(tag => (
                    <Link 
                      key={tag.id}
                      to={`/explorer/${tag.type?.slug || 'non-classe'}/${tag.slug}`}
                      className="text-sm font-serif text-ink-muted hover:text-ink transition-colors border-b border-transparent hover:border-gold-pale block w-fit"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Corpus context focus */}

      {dossier && (
        <section className="bg-ink p-12 md:p-20 text-white relative group overflow-hidden">
           <div className="absolute inset-0 opacity-10 mix-blend-soft-light"></div>
           <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-[100px] -translate-y-48 translate-x-48 group-hover:bg-gold/20 transition-all duration-1000"></div>
           
           <div className="relative z-10 max-w-3xl">
              <span className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold mb-8 block font-sans">ContinuitÃ© de recherche</span>
              <h2 className="text-3xl md:text-5xl font-serif mb-10 leading-tight">
                Cette contribution s'inscrit dans le cadre du corpus thÃ©matique <span className="italic">"{dossier.title}"</span>.
              </h2>
              <Link 
                to={`/publications/corpus/${dossier.slug}`}
                className="inline-flex items-center gap-6 py-5 px-10 border border-gold/30 text-[10px] uppercase font-bold tracking-[0.4em] text-gold hover:bg-gold hover:text-ink transition-all duration-500"
              >
                AccÃ©der Ã  l'intÃ©gralitÃ© du corpus
                <span className="text-lg">â†’</span>
              </Link>
           </div>
        </section>
      )}


      {/* 6. Related Articles */}
      <RelatedArticlesBlock article={article} />

      {/* 7. Institutional Finale */}
      <div className="pt-32 pb-20 border-t border-border-light flex flex-col items-center">
         <div className="text-[11px] uppercase tracking-[0.6em] text-ink/40 font-bold mb-4 text-center">
            Projet Ceedo 2.0
         </div>
         <p className="text-[9px] uppercase tracking-[0.3em] text-ink-muted/60 text-center max-w-md leading-loose">
            Centre d'Excellence pour l'Ã‰veil et le DÃ©veloppement de l'OrientÃ© â€” Une infrastructure intellectuelle dÃ©diÃ©e Ã  la production du savoir panafricain.
         </p>
      </div>
    </footer>
  );
}

