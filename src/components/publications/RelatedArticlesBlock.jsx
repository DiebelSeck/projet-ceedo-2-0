import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import PublicationCard from '../ui/PublicationCard'

export default function RelatedArticlesBlock({ article }) {
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRelated() {
      if (!article) return
      try {
        setLoading(true)
        const data = await api.getRelatedArticlesBySemanticAxis(article, 3)
        setRelated(data)
      } catch (err) {
        console.error('Error loading related articles:', err)
      } finally {
        setLoading(false)
      }
    }
    loadRelated()
  }, [article])

  if (!loading && related.length === 0) return null

  return (
    <section className="mt-20 pt-16 border-t border-[#d8d5ce]">
      <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8b6914] mb-12">
        À approfondir — Dans le même axe
      </h3>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-[#f2f0eb] rounded-sm"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
          {related.map(pub => (
            <PublicationCard key={pub.id} publication={pub} />
          ))}
        </div>
      )}
    </section>
  )
}
