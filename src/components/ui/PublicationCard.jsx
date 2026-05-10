import { Link } from 'react-router-dom'

const TYPE_LABELS = {
  article: 'Article',
  dossier: 'Dossier',
  recension: 'Recension',
  traduction: 'Traduction',
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function PublicationCard({ publication, variant = 'default' }) {
  if (!publication) return null;

  const { 
    slug, 
    id,
    title, 
    excerpt, 
    author, 
    category,
    dateCreated,
    readingTime,
    tags = []
  } = publication;

  const displaySlug = slug || id;
  const displayTitle = title || 'Sans titre';
  const displayExcerpt = excerpt || '';
  const displayDate = dateCreated;
  const displayReadingTime = readingTime || 5;
  const displayAuthorName = author?.fullName || 'Rédaction Ceedo';
  const displayCategory = category?.name || 'Général';


  // Identify the content type from semantic tags
  const typeTag = tags?.find(t => t.type?.slug === 'type-de-contenu') || tags?.[0];
  const displayType = typeTag?.name || 'Publication';

  if (variant === 'featured') {
    return (
      <article className="group relative bg-white border border-border-light/40 hover:border-gold/30 transition-all duration-500 flex flex-col h-full">
        {/* Hover Accent */}
        <div className="absolute left-0 top-0 w-1 h-full bg-gold scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top"></div>
        
        <Link to={`/articles/${displaySlug}`} className="flex flex-col h-full p-8 md:p-12">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold">
              {displayType}
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-ink-muted/50 font-bold">
              {formatDate(displayDate)}
            </span>
          </div>

          <div className="flex-grow">
            <h3 className="text-3xl md:text-4xl font-serif text-ink mb-6 leading-[1.1] group-hover:text-gold transition-colors duration-300">
              {displayTitle}
            </h3>
            <p className="text-lg text-ink-light leading-relaxed mb-10 font-serif italic line-clamp-3">
              {displayExcerpt}
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-border-light/40 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-parchment flex items-center justify-center text-gold font-serif italic text-lg border border-gold/10">
                {author?.firstName?.[0] || 'A'}
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-ink-muted font-bold opacity-60">Expertise</div>
                <div className="text-md font-serif text-ink leading-tight">{displayAuthorName}</div>
              </div>
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-ink/70">
              {displayReadingTime} min
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group relative py-8 border-b border-border-light/40 last:border-0 hover:translate-x-2 transition-transform duration-500">
      <Link to={`/articles/${displaySlug}`} className="flex flex-col md:flex-row md:items-start gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-gold">
              {displayType}
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-ink-muted/40 font-bold">
              {displayCategory}
            </span>
          </div>

          <h3 className="text-xl md:text-2xl font-serif text-ink mb-3 leading-snug group-hover:text-gold transition-colors duration-300">
            {displayTitle}
          </h3>
          <p className="text-base text-ink-light leading-relaxed line-clamp-2 font-serif italic opacity-80 group-hover:opacity-100 transition-opacity">
            {displayExcerpt}
          </p>
        </div>

        <div className="flex items-center md:items-end gap-6 shrink-0">
          <div className="flex flex-col items-start md:items-end">
            <div className="text-[8px] uppercase tracking-[0.2em] text-ink-muted font-bold opacity-60 mb-1">Contributeur</div>
            <div className="text-sm font-serif text-ink">{displayAuthorName}</div>
          </div>
          <div className="text-[9px] uppercase tracking-[0.2em] text-ink-muted/50 font-bold whitespace-nowrap">
            {formatDate(displayDate)}
          </div>
        </div>
      </Link>
    </article>
  );
}


