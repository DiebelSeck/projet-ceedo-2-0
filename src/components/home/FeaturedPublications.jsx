import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import PublicationCard from '../ui/PublicationCard'
import SectionHeader from '../ui/SectionHeader'

export default function FeaturedPublications() {
  const [publications, setPublications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLatest() {
      try {
        setLoading(true)
        const data = await api.getArticles({ limit: 4 })
        setPublications(data || [])
      } catch (err) {
        console.error('Error fetching featured publications:', err)
      } finally {
        setLoading(false)
      }
    }
    loadLatest()
  }, [])

  return (
    <section className="py-28 bg-white border-t border-[#d8d5ce]">
      <div className="max-w-6xl mx-auto px-6">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-12 mb-20">
          <div className="flex-1">
            <SectionHeader
              eyebrow="Intelligence collective"
              title="Dernières Contributions"
              subtitle="Chaque contribution constitue une étape dans la structuration d’un savoir rigoureux et cumulatif."
            />
          </div>
          <Link
            to="/articles"
            className="px-6 py-3 border border-[#1a1a1a] text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all whitespace-nowrap"
          >
            Toutes les contributions →
          </Link>
        </div>


        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-[#f2f0eb] rounded-sm"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
            {publications.map((pub) => (
              <PublicationCard key={pub.id} publication={pub} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
