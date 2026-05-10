import SectionHeader from '../ui/SectionHeader'

export default function InstitutionalIntro() {
  const points = [
    {
      title: 'Think-Tank & Recherche',
      text: 'Un laboratoire d\'idées produisant des analyses académiques et des relectures critiques des sources classiques africaines.',
    },
    {
      title: 'Base de Connaissances',
      text: 'Une bibliothèque numérique structurada offrant un accès pérenne aux textes fondateurs et aux ressources documentaires.',
    },
    {
      title: 'Académie & Transmission',
      text: 'Un espace de formation proposant des séminaires et des parcours d\'apprentissage rigoureux sur les fondamentaux de la pensée kamite.',
    },
    {
      title: 'Dynamique Collective',
      text: 'Un réseau de rencontres, colloques et événements favorisant le dialogue entre chercheurs, experts et curieux.',
    }
  ]

  return (
    <section className="py-28 bg-[#FAF9F6]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div>
            <SectionHeader
              eyebrow="Institution"
              title="Une infrastructure au service d'une pensée souveraine."
              subtitle={
                <>
                  Ceedo 2.0 structure un écosystème intellectuel complet : <br className="hidden md:block" /> 
                  production, validation, transmission et diffusion du savoir.
                </>
              }
            />
            
            <div className="mt-12 p-8 bg-white border border-[#d8d5ce] shadow-sm italic text-[#4a4a4a]/80 leading-relaxed font-serif">
              "L'exigence n'est pas une option, c'est la condition sine qua non d'une transmission authentique de nos héritages."
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            {points.map((point) => (
              <div key={point.title} className="p-6 border-b border-[#d8d5ce] bg-white/50 hover:translate-y-[-2px] transition-all duration-300">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] mb-4">
                  {point.title}
                </h3>
                <p className="text-sm text-[#4a4a4a] leading-relaxed">
                  {point.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

  )
}
