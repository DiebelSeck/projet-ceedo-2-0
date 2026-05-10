import SectionHeader from '../ui/SectionHeader'

export default function WhySection() {
  const points = [
    {
      title: 'Désarticulation',
      text: 'Les espaces de production sont dispersés, sans articulation durable entre chercheurs et disciplines.'
    },
    {
      title: 'Absence de cadre',
      text: 'L’absence de cadres méthodologiques communs empêche la consolidation d’un savoir rigoureux.'
    },
    {
      title: 'Dépendance structurelle',
      text: 'La dépendance à des structures extérieures freine l’émergence d’une pensée souveraine.'
    }
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl mb-24">
          <SectionHeader
            eyebrow="Diagnostic Structurel"
            title="Pourquoi Ceedo 2.0 ?"
            subtitle="La production intellectuelle africaine contemporaine fait face à des déséquilibres structurels qui limitent sa cohérence, sa continuité et sa portée."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {points.map((point) => (
            <div key={point.title} className="space-y-6 group hover:translate-y-[-2px] transition-all duration-300 ease-out">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1a1a1a] flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-[#8b6914] rounded-full"></span>
                {point.title}
              </h3>
              <p className="text-sm text-[#4a4a4a] leading-relaxed font-medium">
                {point.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>


  )
}
