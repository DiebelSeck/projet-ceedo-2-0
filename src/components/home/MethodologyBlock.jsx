import SectionHeader from '../ui/SectionHeader'

export default function MethodologyBlock() {
  const steps = [
    {
      title: 'Rigueur Scientifique',
      desc: 'Chaque contribution est soumise à une relecture par les pairs, garantissant l\'exactitude des faits y de l\'argumentation.'
    },
    {
      title: 'Sources Primaires',
      desc: 'Retour aux sources textuelles y archéologiques directes pour éviter les biais des interprétations secondaires.'
    },
    {
      title: 'Transparence',
      desc: 'Les outils d\'analyse y cadres conceptuels sont explicités pour permettre une vérification y un débat académique sain.'
    }
  ]

  return (
    <section className="py-28 bg-[#1a1a1a] text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl mx-auto mb-20">
          <SectionHeader
            eyebrow="Épistémologie & Vision"
            title="Un cadre méthodologique non négociable."
            subtitle="Aucune production n’est publiée sans validation méthodologique rigoureuse."
            align="center"
            theme="dark"
          />
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {steps.map((step, index) => (
            <div key={step.title} className="relative group p-8 border border-[#2e2e2e] hover:border-[#8b6914] hover:translate-y-[-4px] transition-all duration-300 ease-out bg-[#222]/50">
              <span className="absolute -top-6 left-6 text-4xl font-serif text-[#8b6914] opacity-30 group-hover:opacity-60 transition-opacity">
                0{index + 1}
              </span>
              <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-5 pt-4">
                {step.title}
              </h3>
              <p className="text-sm text-[#767676] leading-relaxed group-hover:text-[#9ca3af] transition-colors">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
