import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import PublicationCard from '../components/ui/PublicationCard'
import SectionHeader from '../components/ui/SectionHeader'

export default function TagExplorationPage() {
  const { typeSlug, tagSlug } = useParams()
  const [articles, setArticles] = useState([])
  const [siblings, setSiblings] = useState([])
  const [tag, setTag] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [articlesData, tagData, siblingsData] = await Promise.all([
          api.getArticlesBySemanticTag(typeSlug, tagSlug),
          api.getTagBySlug(typeSlug, tagSlug),
          api.getSiblingTags(typeSlug, tagSlug)
        ])
        
        setArticles(articlesData || [])
        setTag(tagData)
        setSiblings(siblingsData || [])
      } catch (err) {
        console.error('Error loading exploration data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
    window.scrollTo(0, 0)
  }, [typeSlug, tagSlug])

  const displayName = tag?.name || tagSlug.replace(/-/g, ' ')
  const typeName = tag?.type?.name || 'Exploration'

  return (
    <main className="bg-white min-h-screen">
      {/* Semantic Entry Header */}
      <div className="bg-parchment-pale py-20 border-b border-border-light/30">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.3em] text-ink-muted mb-12">
            <Link to="/explorer" className="hover:text-gold transition-colors">Système</Link>
            <span className="text-border-light">/</span>
            <span className="text-gold opacity-60">{typeName}</span>
            <span className="text-border-light">/</span>
            <span className="text-ink">{displayName}</span>
          </nav>

          <header className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-serif text-ink mb-8 leading-none tracking-tight">
              {displayName}
            </h1>
            <p className="text-xl md:text-2xl font-serif text-ink-light italic leading-relaxed border-l-2 border-gold/30 pl-8">
              {tag?.intro || `Exploration des archives et contributions indexées sous l'entrée sémantique "${displayName}".`}
            </p>
          </header>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Results Column */}
          <div className="lg:col-span-8">
            {loading ? (
              <div className="space-y-12 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-64 bg-parchment/40"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-12">
                {articles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-12">
                    {articles.map((article) => (
                      <PublicationCard key={article.id} publication={article} variant="default" />
                    ))}
                  </div>
                ) : (
                  <div className="py-32 text-center border border-dashed border-border-light rounded-sm">
                    <p className="text-xl font-serif text-ink-muted italic">
                      Aucune contribution n'est indexée sous ce critère pour le moment.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Contextual Sidebar */}
          <aside className="lg:col-span-4 space-y-12">
            {siblings.length > 0 && (
              <section className="bg-parchment/10 p-8 border border-border-light/40">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-10 border-b border-gold/20 pb-4">
                  Dans le même axe
                </h3>
                <div className="flex flex-col gap-6">
                  {siblings.map(sib => (
                    <Link
                      key={sib.id}
                      to={`/explorer/${typeSlug}/${sib.slug}`}
                      className="group flex items-start gap-4"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gold/30 mt-1.5 group-hover:bg-gold transition-colors"></span>
                      <span className="text-[14px] font-serif text-ink-muted group-hover:text-ink transition-colors leading-snug">
                        {sib.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="p-10 bg-ink text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-6">Orientation</h4>
              <p className="text-sm font-serif text-white/70 leading-relaxed mb-8 italic">
                Ce système d'exploration permet de naviguer de manière transversale à travers les concepts théoriques et les périodes historiques traitées par le Projet Ceedo.
              </p>
              <Link to="/explorer" className="text-[10px] uppercase font-bold tracking-[0.3em] text-gold hover:text-white transition-colors flex items-center gap-3">
                Consulter tous les axes 
                <span>→</span>
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </main>
  )
}


