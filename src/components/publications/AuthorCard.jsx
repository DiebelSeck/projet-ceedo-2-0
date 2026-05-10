import { Link } from 'react-router-dom';

export default function AuthorCard({ author, mini = false }) {
  if (!author) return null;

  const initials = author.firstName && author.lastName 
    ? `${author.firstName.charAt(0)}${author.lastName.charAt(0)}`
    : (author.fullName?.charAt(0) || '?');

  if (mini) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-parchment-dark overflow-hidden flex items-center justify-center border border-border-light">
          {author.photo ? (
            <img src={author.photo} alt={author.fullName} className="w-full h-full object-cover" />
          ) : (
            <div className="text-gold text-xs font-bold uppercase">
              {initials}
            </div>
          )}
        </div>
        <div>
          <div className="text-sm font-medium text-ink">{author.fullName}</div>
          <div className="text-[9px] uppercase tracking-wider text-ink-muted">Contributeur</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-16 h-16 rounded-full bg-parchment-dark overflow-hidden border border-border flex items-center justify-center">
        {author.photo ? (
          <img src={author.photo} alt={author.fullName} className="w-full h-full object-cover" />
        ) : (
          <div className="text-gold text-2xl font-serif">
            {initials}
          </div>
        )}
      </div>
      <div>
        <div className="text-base font-serif text-ink mb-1">
          {author.fullName}
        </div>
        <div className="text-[10px] uppercase font-bold tracking-widest text-[#8b6914] mb-2">Auteur</div>
        
        {author.bio && (
          <p className="mt-3 text-xs text-ink-muted leading-relaxed line-clamp-3">
            {author.bio}
          </p>
        )}
        
        {author.orcid && (
          <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] text-ink-muted">
            <span className="w-3 h-3 bg-[#a6ce39] rounded-full flex items-center justify-center text-[8px] text-white">ID</span>
            ORCID: {author.orcid}
          </div>
        )}
      </div>
    </div>
  );
}

