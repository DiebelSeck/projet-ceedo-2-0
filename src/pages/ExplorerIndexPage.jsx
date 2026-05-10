import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import SectionHeader from '../components/ui/SectionHeader'

export default function ExplorerIndexPage() {
  const [tagTypes, setTagTypes] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const data = await api.getTagTypesWithTags()
        setTagTypes(data)
      } catch (err) {
        console.error('Error loading semantic tags:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Order of semantic axes as requested
  const axisOrder = ['niveau', 'type-de-contenu', 'periode', 'discipline', 'approche']
  
  // Sort types based on the requested order, then others
  const sortedTypeKeys = Object.keys(tagTypes).sort((a, b) => {
    const indexA = axisOrder.indexOf(a)
    const indexB = axisOrder.indexOf(b)
    if (indexA === -1 && indexB === -1) return a.localeCompare(b)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  return (
    <main className="py-24 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl mb-20">
          <SectionHeader
            eyebrow="Système de Connaissances"
            title="Exploration Sémantique"
            subtitle="Parcourez le corpus Ceedo à travers ses axes fondamentaux. Chaque étiquette est une porte d'entrée vers une thématique, une période ou une discipline spécifique."
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-[#f2f0eb] rounded-sm"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {sortedTypeKeys.map(typeSlug => {
              const type = tagTypes[typeSlug]
              return (
                <div key={typeSlug} className="space-y-8">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#8b6914] border-b border-[#d8d5ce] pb-3">
                    {type.name}
                  </h3>
                  <div className="flex flex-col gap-4">
                    {type.tags.map(tag => (
                      <Link
                        key={tag.id}
                        to={`/explorer/${typeSlug}/${tag.slug}`}
                        className="group flex items-start justify-between text-sm py-2 border-b border-[#f2f0eb] hover:border-[#8b6914] transition-all"
                      >
                        <span className="text-[#1a1a1a] group-hover:text-[#8b6914] transition-colors">
                          {tag.name}
                        </span>
                        <span className="text-[10px] text-[#767676] group-hover:text-[#8b6914] opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0">
                          Explorer →
                        </span>
                      </Link>
                    ))}
                    {type.tags.length === 0 && (
                      <span className="text-xs italic text-[#767676]">Aucune entrée disponible</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
