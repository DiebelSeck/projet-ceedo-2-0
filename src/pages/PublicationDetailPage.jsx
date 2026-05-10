import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import ArticleHeader from '../components/publications/ArticleHeader';
import ArticleBody from '../components/publications/ArticleBody';
import ArticleSidebar from '../components/publications/ArticleSidebar';
import ArticleFooter from '../components/publications/ArticleFooter';


export default function PublicationDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    async function loadArticle() {
      try {
        setLoading(true);
        const data = await api.getArticleBySlug(slug);
        if (!data) {
          setError('Article non trouvé');
        } else {
          // Robust slugify helper
          const slugify = (text) => {
            const txt = document.createElement("textarea");
            txt.innerHTML = text.replace(/<[^>]*>/g, ''); // Strip HTML
            let decoded = txt.value;
            return decoded
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '') // Remove accents
              .toLowerCase()
              .replace(/[^\w\s-]/g, '') // Remove special chars
              .trim()
              .replace(/\s+/g, '-'); // Replace spaces with dashes
          };

          if (data.content) {
            const headingMatches = Array.from(data.content.matchAll(/<(h[23])\b[^>]*>(.*?)<\/h[23]>/gi));
            const extractedHeadings = headingMatches.map(match => {
              const text = match[2].replace(/<[^>]*>/g, '');
              return {
                level: match[1].toLowerCase(),
                text: text,
                id: slugify(match[2])
              };
            });
            
            // Inject IDs into content headings if not already present
            const processedContent = data.content.replace(/<(h[23])\b[^>]*>(.*?)<\/h[23]>/gi, (match, tag, text) => {
              return `<${tag} id="${slugify(text)}">${text}</${tag}>`;
            });

            setArticle({ ...data, content: processedContent });
            setHeadings(extractedHeadings);
          } else {
            setArticle(data);
          }
        }
      } catch (err) {
        setError('Une erreur est survenue lors du chargement de l\'article');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
    window.scrollTo(0, 0);
  }, [slug]);


  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-32 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-4"></div>
        <div className="text-ink-muted text-sm uppercase tracking-widest">Chargement de la publication...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-32 text-center">
        <h2 className="text-3xl font-serif text-ink mb-4">Oups</h2>
        <p className="text-ink-muted mb-8">{error || 'Cette publication n\'existe pas.'}</p>
        <button 
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-ink text-white text-xs uppercase font-bold tracking-widest hover:bg-gold transition-colors"
        >
          Retour aux publications
        </button>
      </div>
    );
  }

  return (
    <article className="bg-white">
      {/* Header section (full width) */}
      <div className="max-w-7xl mx-auto px-6 pt-12 md:pt-20">
        <ArticleHeader article={article} />
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-7xl mx-auto px-6 pt-8 md:pt-12 pb-12 md:pb-20 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <ArticleBody article={article} headings={headings} />
            <ArticleFooter article={article} />
          </div>


          {/* Sidebar Area (Desktop sticky) */}
          <div className="lg:col-span-4 relative">
            <div className="lg:sticky lg:top-24">
              <ArticleSidebar article={article} headings={headings} />
            </div>
          </div>

        </div>
      </div>
    </article>
  );
}

