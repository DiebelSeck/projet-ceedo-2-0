import AuthorCard from './AuthorCard';
import DossierCard from './DossierCard';
import TableOfContents from './TableOfContents';
import { api } from '../../lib/api';
import { Link } from 'react-router-dom';

export default function ArticleSidebar({ article, headings = [] }) {
  if (!article) return null;
  const { author, dossier, tags, title } = article;
  const groupedTags = api.groupTagsByType(tags);

  return (
    <aside className="space-y-16 pr-4">
      {/* 1. Table of Contents (Dynamic) */}
      <section className="hidden lg:block border-l border-border-light pl-6">
        <TableOfContents headings={headings} />
      </section>

      {/* 2. Citation Tool */}
      <section className="bg-parchment/30 p-8 border border-border-light/50 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-gold/30"></div>
        <h3 className="text-[9px] uppercase tracking-[0.3em] font-bold text-ink-muted mb-6">
          Référence de citation
        </h3>
        <p className="text-[13px] font-serif italic text-ink leading-relaxed">
          {author?.fullName || 'Rédaction Ceedo'}. "{title}". <span className="not-italic font-bold text-gold">Projet Ceedo 2.0</span>, {new Date().getFullYear()}.
        </p>
        <button 
          onClick={(e) => {
            const text = `${author?.fullName || 'Rédaction Ceedo'}. "${title}". Projet Ceedo 2.0, ${new Date().getFullYear()}.`;

            navigator.clipboard.writeText(text);
            const btn = e.currentTarget;
            const originalText = btn.innerHTML;
            btn.innerHTML = "Copié !";
            btn.classList.add('text-ink');
            setTimeout(() => {
              btn.innerHTML = originalText;
              btn.classList.remove('text-ink');
            }, 2000);
          }}
          className="mt-6 text-[10px] uppercase font-bold tracking-widest text-gold hover:text-ink transition-all flex items-center gap-2 group-hover:translate-x-1 duration-300"
        >
          Copier la référence
        </button>
      </section>

      {/* 2b. Methodological Anchor (MAI) */}
      <section className="bg-[#1a1a1a] p-8 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gold/10 rounded-full blur-2xl -translate-y-12 translate-x-12"></div>
        <h3 className="text-[9px] uppercase tracking-[0.3em] font-bold text-gold/80 mb-4">
          Cadre Méthodologique
        </h3>
        <p className="text-[12px] font-serif italic text-white/70 leading-relaxed mb-6">
          Cette étude s'inscrit dans les protocoles de la Méthode Africaine Interne (MAI), garantissant une analyse endogène rigoureuse.
        </p>
        <Link 
          to="/projet/methodologie"
          className="text-[9px] uppercase font-bold tracking-widest text-gold border-b border-gold/30 pb-1 hover:border-gold transition-all inline-block"
        >
          Consulter la charte MAI →
        </Link>
      </section>

      {/* 3. Author Info */}
      {author && (
        <section className="pt-4">
          <h3 className="text-[9px] uppercase tracking-[0.3em] font-bold text-ink-muted mb-8 flex items-center gap-3">
            <span className="w-8 h-[1px] bg-border-light"></span>
            L'Auteur
          </h3>
          <AuthorCard author={author} />
        </section>
      )}

      {/* 4. Semantic Axes */}
      {tags && tags.length > 0 && (
        <section className="space-y-10">
          <h3 className="text-[9px] uppercase tracking-[0.3em] font-bold text-ink-muted flex items-center gap-3">
            <span className="w-8 h-[1px] bg-border-light"></span>
            Axes de recherche
          </h3>
          <div className="space-y-8">
            {Object.entries(groupedTags).map(([type, items]) => (
              <div key={type} className="group/item">
                <h4 className="text-[8px] uppercase tracking-[0.2em] font-bold text-gold/60 mb-3 group-hover/item:text-gold transition-colors">
                  {type}
                </h4>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {items.map(tag => (
                    <Link 
                      key={tag.id}
                      to={`/explorer/${tag.type?.slug || 'non-classe'}/${tag.slug}`}
                      className="text-[12px] font-serif text-ink-muted hover:text-ink transition-colors border-b border-transparent hover:border-gold-pale pb-0.5"
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

      {/* 5. Navigation Utilities */}
      <section className="pt-12 border-t border-border-light/30">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink-muted hover:text-gold transition-colors flex items-center gap-3"
        >
          <span className="text-lg">↑</span>
          Haut de page
        </button>
      </section>

      {/* 6. Dossier Info */}
      {dossier && (
        <section className="pt-8 border-t border-border-light/20">
          <h3 className="text-[9px] uppercase tracking-[0.3em] font-bold text-ink-muted mb-8">
            Dossier thématique
          </h3>
          <DossierCard dossier={dossier} mini />
        </section>
      )}
    </aside>
  );
}


