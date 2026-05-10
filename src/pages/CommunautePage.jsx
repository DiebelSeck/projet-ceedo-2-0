import { Link } from 'react-router-dom'
import SectionHeader from '../components/ui/SectionHeader'
import { useCommunitySpaces } from '../hooks/useCommunitySpaces'

export default function CommunautePage() {
  const { spaces, loading, error } = useCommunitySpaces()

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 lg:py-32">
      <SectionHeader
        eyebrow="Réseau"
        title="La Communauté Ceedo"
        subtitle="Un espace d'échange et de collaboration réunissant chercheurs, étudiants et passionnés engagés dans la rigueur intellectuelle."
      />

      <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h3 className="text-2xl font-serif text-[#1a1a1a] mb-8">Un dialogue structuré</h3>
          <p className="text-base text-[#4a4a4a] leading-relaxed mb-8">
            Rejoindre la communauté Ceedo, c'est intégrer un environnement où la libre circulation des idées est guidée par le respect de la méthode et l'exigence de la preuve. 
          </p>
          <div className="space-y-6">
            {[
              { title: 'Groupes de recherche', desc: 'Groupes de travail thématiques sur des sujets précis (philologie, archéologie, droit ancien).' },
              { title: 'Cercles de lecture', href: '#', desc: 'Rencontres bimensuelles pour analyser un ouvrage de référence collectivement.' },
              { title: 'Forum de discussion (Privé)', desc: 'Espace sécurisé pour les échanges quotidiens et les relectures croisées.' }
            ].map(item => (
              <div key={item.title} className="p-6 border-l-2 border-[#8b6914] bg-[#faf9f6]">
                <h4 className="text-sm font-bold text-[#1a1a1a] mb-2">{item.title}</h4>
                <p className="text-sm text-[#767676]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-12 text-white flex flex-col justify-center">
          <h3 className="text-3xl font-serif mb-8">Devenez membre contributeur</h3>
          <p className="text-[#9ca3af] leading-relaxed mb-10">
            Le Projet Ceedo grandit grâce à l'implication de ses membres. Que ce soit pour la rédaction d'articles, la numérisation de ressources ou l'organisation d'événements, votre expertise est précieuse.
          </p>
          <ul className="space-y-4 mb-10 text-sm italic text-[#8b6914]">
            <li>• Participez aux décisions d'orientation</li>
            <li>• Accédez aux ressources privées</li>
            <li>• Collaborez avec des chercheurs internationaux</li>
          </ul>
          <a href="/contact" className="inline-block px-8 py-4 bg-[#8b6914] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#c4965a] transition-all text-center">
            Demander mon adhésion
          </a>
        </div>
      </div>

      {/* ─── Espaces communautaires (dynamic, Directus-driven) ─────────────── */}
      <section className="mt-24 lg:mt-32 pt-16 border-t border-[#d8d5ce]/60">
        <h2 className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] mb-10 pb-4 border-b border-[#d8d5ce]">
          Espaces communautaires
        </h2>

        {loading && (
          <div className="flex items-center gap-3 py-8">
            <div className="w-5 h-5 border-2 border-[#C4965A]/20 border-t-[#C4965A] rounded-full animate-spin" />
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#767676] opacity-60">
              Chargement...
            </span>
          </div>
        )}

        {!loading && error && (
          <p className="text-sm italic text-[#8b6914]">
            Une erreur s'est produite lors du chargement des espaces. Veuillez réessayer ultérieurement.
          </p>
        )}

        {!loading && !error && spaces.length === 0 && (
          <p className="text-sm italic text-[#767676]">Aucun espace disponible</p>
        )}

        {!loading && !error && spaces.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {spaces.map((space) => (
              <Link
                key={space.id}
                to={`/communaute/${space.slug}`}
                className="group block p-8 border border-[#d8d5ce] bg-white hover:border-[#8b6914] transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="text-xl font-serif text-[#1a1a1a] group-hover:text-[#8b6914] transition-colors">
                    {space.title}
                  </h3>
                  {space.accessType === 'members' && (
                    <span className="shrink-0 inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-[#8b6914] text-[#8b6914]">
                      Membres
                    </span>
                  )}
                </div>
                {space.description && (
                  <p className="text-sm text-[#4a4a4a] leading-relaxed line-clamp-3 mb-6">
                    {space.description}
                  </p>
                )}
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] border-b border-[#1a1a1a] pb-1 group-hover:text-[#8b6914] group-hover:border-[#8b6914] transition-all">
                  Découvrir
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
