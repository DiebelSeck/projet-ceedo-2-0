import SectionHeader from '../components/ui/SectionHeader'

export default function AcademiePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20 lg:py-32">
      <SectionHeader
        eyebrow="Transmission"
        title="L'Académie Ceedo"
        subtitle="Un espace de formation exigeant pour acquérir les cadres conceptuels et les outils méthodologiques de la recherche Kamite."
      />

      <div className="mt-20 space-y-8">
        {[
          { 
            title: 'Parcours Initiation', 
            details: '6 semaines · Fondamentaux de l\'égyptologie et de l\'histoire africaine.',
            status: 'Ouvert aux inscriptions'
          },
          { 
            title: 'Séminaire Méthodologique', 
            details: '3 mois · Analyse de sources et philologie comparée.',
            status: 'Prochaine session : Octobre 2026'
          },
          { 
            title: 'Études Doctorales (Accompagnement)', 
            details: 'Sur dossier · Soutien méthodologique et épistémologique.',
            status: 'Admission sur entretien'
          }
        ].map(prog => (
          <div key={prog.title} className="flex flex-col md:flex-row md:items-center justify-between p-8 border border-[#d8d5ce] bg-white group hover:border-[#8b6914] transition-all">
            <div>
              <h3 className="text-xl font-serif text-[#1a1a1a] mb-2">{prog.title}</h3>
              <p className="text-sm text-[#767676]">{prog.details}</p>
            </div>
            <div className="mt-6 md:mt-0 flex items-center gap-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8b6914]">{prog.status}</span>
              <a href="/contact" className="px-6 py-2 bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#8b6914] transition-all">
                Candidater
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="p-8 bg-[#faf9f6] border border-[#d8d5ce]">
          <h4 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] mb-4">Pédagogie</h4>
          <p className="text-sm text-[#4a4a4a] leading-relaxed font-serif italic">
            "Notre enseignement ne se veut pas seulement cumulatif ; il vise à transformer le regard et à forger une discipline de l'esprit capable de naviguer dans la complexité des sources anciennes."
          </p>
        </div>
        <div className="p-8 bg-[#faf9f6] border border-[#d8d5ce]">
          <h4 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] mb-4">Certification</h4>
          <p className="text-sm text-[#4a4a4a] leading-relaxed">
            Les parcours de l'Académie Ceedo font l'objet d'une validation par notre conseil scientifique et donnent lieu à une attestation de compétences académiques.
          </p>
        </div>
      </div>
    </div>
  )
}
