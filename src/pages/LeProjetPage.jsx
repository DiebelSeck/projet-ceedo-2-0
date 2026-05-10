import SectionHeader from '../components/ui/SectionHeader'

export default function LeProjetPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20 lg:py-32">
      <SectionHeader
        eyebrow="Institution"
        title="La Genèse du Projet Ceedo 2.0"
        subtitle="Une plateforme pionnière dédiée à la structuration et à la diffusion de l'excellence intellectuelle africaine."
      />

      <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8">
          <div className="prose prose-serif prose-lg max-w-none text-[#4a4a4a] leading-relaxed space-y-8">
            <p>
              Le Projet Ceedo 2.0 ne naît pas du néant. Il est l'aboutissement d'une réflexion de plusieurs décennies sur la nécessité pour l'Afrique de disposer de ses propres infrastructures de production et de validation du savoir.
            </p>
            <p>
              Dans un monde saturé d'informations fragmentées, nous avons choisi la voie de la rigueur et de la profondeur. Notre mission est triple : documenter les sources classiques avec une exigence académique irréprochable, former une nouvelle génération de penseurs outillés, et offrir un espace de dialogue aux esprits engagés.
            </p>
            
            <h3 className="text-2xl font-serif text-[#1a1a1a] pt-8">Nos Principes Directeurs</h3>
            <ul className="list-disc pl-5 space-y-4">
              <li><strong>Souveraineté Épistémologique :</strong> Repenser les cadres d'analyse à partir des réalités et des structures de pensée africaines.</li>
              <li><strong>Rigueur Méthodologique :</strong> Primauté aux sources primaires, à la philologie et à l'archéologie.</li>
              <li><strong>Libre Accès :</strong> Le savoir doit être un bien commun, accessible à tous ceux qui s'engagent dans une démarche sérieuse.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-[#faf9f6] p-8 border border-[#d8d5ce]">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] mb-6 pb-4 border-b border-[#d8d5ce]">
              En bref
            </h4>
            <div className="space-y-6">
              <div>
                <span className="block text-[10px] text-[#767676] uppercase font-bold mb-1">Type</span>
                <span className="text-sm font-medium">Think-Tank & Académie</span>
              </div>
              <div>
                <span className="block text-[10px] text-[#767676] uppercase font-bold mb-1">Focus</span>
                <span className="text-sm font-medium">Épistémologie, Histoire, Sciences Humaines</span>
              </div>
              <div>
                <span className="block text-[10px] text-[#767676] uppercase font-bold mb-1">Statut</span>
                <span className="text-sm font-medium italic opacity-70">En déploiement (Ceedo 2.0)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
