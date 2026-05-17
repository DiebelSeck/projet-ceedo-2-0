import { Link } from 'react-router-dom';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://admin.projetceedo20.org';

export default function ArticleHeader({ article }) {
  const {
    title,
    excerpt,
    category,
    author,
    readingTime,
    dateCreated
  } = article;

  const imageId = article.featuredImage || article.featured_image;
  const heroImageUrl = imageId
    ? `${DIRECTUS_URL}/assets/${imageId}?width=1600&fit=cover`
    : null;

  const formatDate = (iso) => {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <header className="border-b border-border-light pb-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.2em] text-ink-muted mb-12">
        <Link to="/" className="hover:text-gold transition-colors">Accueil</Link>
        <span className="text-border-light">/</span>
        <Link to="/articles" className="hover:text-gold transition-colors">Articles</Link>
        <span className="text-border-light">/</span>
        <span className="text-ink truncate max-w-[200px]">{category?.name || 'Article'}</span>
      </nav>

      {/* Category / Type Tag */}
      <div className="mb-6">
        <span className="inline-block px-3 py-1 bg-gold-pale text-gold text-[10px] uppercase font-bold tracking-[0.2em] rounded-sm">
          {category?.name || 'Recherche'}
        </span>
      </div>

      {/* Main Titles */}
      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-ink mb-10 leading-[1.05] tracking-tight">
          {title}
        </h1>
        
        {excerpt && (
          <p className="text-xl md:text-2xl font-serif text-ink-light italic mb-8 leading-relaxed opacity-90 border-l-2 border-gold/30 pl-8">
            {excerpt}
          </p>
        )}
      </div>

      {/* Featured / Hero Image */}
      {heroImageUrl && (
        <figure className="mb-10 -mx-6 md:mx-0 overflow-hidden border-y md:border border-border-light/40">
          <img
            src={heroImageUrl}
            alt={title || ''}
            className="w-full h-auto max-h-[560px] object-cover"
          />
        </figure>
      )}

      {/* Metadata Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 bg-parchment/10 px-8 py-5 border-y border-border-light/40">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-gold-pale flex items-center justify-center text-gold font-serif italic text-xl border border-gold/10 shadow-sm">
            {author?.firstName?.[0] || 'A'}
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-[0.3em] text-ink-muted font-bold mb-1">Expertise</div>
            <div className="text-lg font-serif text-ink leading-none">{author?.fullName || 'Rédaction Ceedo'}</div>

          </div>
        </div>

        <div className="flex items-center gap-12 text-[9px] uppercase tracking-[0.3em] text-ink-muted font-bold">
          <div className="group">
            <span className="block text-gold/60 mb-2 group-hover:text-gold transition-colors">Date de parution</span>
            <span className="text-ink">{formatDate(dateCreated)}</span>
          </div>
          <div className="group">
            <span className="block text-gold/60 mb-2 group-hover:text-gold transition-colors">Temps de lecture</span>
            <span className="text-ink">{readingTime || 5} min</span>
          </div>
        </div>
      </div>


    </header>
  );
}


