import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import PublicationCard from '../components/ui/PublicationCard';
import SectionHeader from '../components/ui/SectionHeader';

export default function AuthorDetailPage() {
  const { slug } = useParams();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAuthor() {
      try {
        setLoading(true);
        const data = await api.getAuthorBySlug(slug);
        if (!data) {
          setError('Auteur non trouvé');
        } else {
          setAuthor(data);
        }
      } catch (err) {
        setError('Erreur lors du chargement de l\'auteur');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadAuthor();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <div className="py-32 text-center text-ink-muted uppercase tracking-widest">Chargement de l'auteur...</div>;
  if (error || !author) return <div className="py-32 text-center text-ink-muted">{error || 'Auteur introuvable'}</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20 items-start">
        <div className="md:col-span-1">
          <div className="aspect-square bg-parchment-dark rounded-sm border border-border overflow-hidden mb-6">
            {author.photo ? (
              <img src={author.photo} alt={author.full_name} className="w-full h-full object-cover grayscale" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-gold/20 font-serif">
                {author.full_name?.charAt(0)}
              </div>
            )}
          </div>
          {author.orcid && (
            <div className="flex items-center gap-2 p-4 bg-parchment rounded-sm border border-border-light">
              <span className="w-5 h-5 bg-[#a6ce39] rounded-full flex items-center justify-center text-[10px] text-white font-bold">ID</span>
              <div className="text-xs">
                <div className="text-ink-muted uppercase tracking-tighter text-[9px]">Orcid Record</div>
                <a href={`https://orcid.org/${author.orcid}`} target="_blank" rel="noreferrer" className="text-ink hover:text-gold transition-colors font-mono">
                  {author.orcid}
                </a>
              </div>
            </div>
          )}
        </div>
        
        <div className="md:col-span-2">
          <h1 className="text-4xl font-serif text-ink mb-2">{author.full_name}</h1>
          <div className="text-lg text-gold font-medium mb-1">{author.title}</div>
          <div className="text-base text-ink-light italic mb-8">{author.affiliation}</div>
          
          <div className="prose prose-serif prose-ink-light max-w-none mb-10">
            <p className="whitespace-pre-line">{author.bio}</p>
          </div>
          
          {author.expertise && (
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold mb-4 text-ink-muted">Domaines d'expertise</h3>
              <div className="flex flex-wrap gap-2">
                {author.expertise.split(',').map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white border border-border-light text-[11px] text-ink-muted rounded-full">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-16 border-t border-border">
        <SectionHeader 
          title={`Publications de ${author.full_name}`}
          subtitle="Articles, contributions et dossiers coordonnés par cet auteur."
        />
        
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
          {author.articles && author.articles.length > 0 ? (
            author.articles.map(article => (
              <PublicationCard 
                key={article.id} 
                publication={{...article, author: { name: author.full_name, affiliation: author.affiliation }}} 
              />
            ))
          ) : (
            <div className="col-span-2 py-12 text-center bg-parchment/30 border border-dashed border-border text-ink-muted italic">
              Aucune publication répertoriée pour le moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
