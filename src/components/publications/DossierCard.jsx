import { Link } from 'react-router-dom';

export default function DossierCard({ dossier, mini = false }) {
  if (mini) {
    return (
      <div className="bg-parchment-dark p-4 border border-border-light group">
        <Link to={`/publications/corpus/${dossier.slug}`} className="block">
          <div className="text-[10px] uppercase tracking-widest font-bold text-gold mb-2">Corpus Thématique</div>
          <h4 className="text-sm font-serif text-ink group-hover:text-gold transition-colors leading-tight mb-2">
            {dossier.title}
          </h4>
          <div className="text-[10px] text-ink-muted">
            Coord. : {dossier.coordinator || 'Collectif'}
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex bg-white border border-border hover:border-gold transition-colors group h-full">
      <div className="w-1/3 shrink-0 overflow-hidden bg-parchment-dark">
        {dossier.cover ? (
          <img 
            src={dossier.cover} 
            alt={dossier.title} 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gold opacity-20">
            <span className="text-4xl">⊕</span>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold mb-3">Corpus</div>
          <Link to={`/publications/corpus/${dossier.slug}`}>
            <h3 className="text-xl font-serif text-ink group-hover:text-gold transition-colors leading-tight mb-3">
              {dossier.title}
            </h3>
          </Link>
          <p className="text-xs text-ink-muted line-clamp-3 leading-relaxed mb-4">
            {dossier.editorial_intro}
          </p>
        </div>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border-light">
          <div className="text-[10px] text-ink-muted">
            <span className="uppercase tracking-wider">Ceedo ID:</span> {dossier.ceedo_id || 'N/A'}
          </div>
          <Link 
            to={`/publications/corpus/${dossier.slug}`}
            className="text-[10px] uppercase tracking-widest font-bold text-ink hover:text-gold transition-colors"
          >
            Consulter
          </Link>
        </div>
      </div>
    </div>
  );

}
