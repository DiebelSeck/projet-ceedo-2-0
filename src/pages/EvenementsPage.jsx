import SectionHeader from '../components/ui/SectionHeader'

export default function EvenementsPage() {
  const years = ['2026']

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 lg:py-32">
      <SectionHeader
        eyebrow="Agenda"
        title="Événements & Rencontres"
        subtitle="Colloques, conférences, séminaires méthodologiques et cercles de réflexion : la vie intellectuelle du Projet Ceedo en mouvement."
      />

      <div className="mt-24 space-y-16">
        {years.map(year => (
          <div key={year}>
            <div className="flex items-center gap-6 mb-12">
              <h3 className="text-4xl font-serif text-[#d8d5ce]">{year}</h3>
              <div className="h-px flex-1 bg-[#e8e6e1]"></div>
            </div>

            <div className="space-y-6">
              {[
                { 
                  date: '12 Octobre', 
                  title: 'Colloque Annuel : Épistémologies et Souverainetés', 
                  loc: 'Paris & Visioconférence',
                  type: 'Colloque'
                },
                { 
                  date: '24 Novembre', 
                  title: 'Séminaire sur la Philologie des Textes Classiques', 
                  loc: 'En ligne (Réservé aux membres)',
                  type: 'Séminaire'
                }
              ].map(event => (
                <div key={event.title} className="flex flex-col md:flex-row gap-6 md:gap-12 p-8 border border-[#d8d5ce] bg-white group hover:border-[#8b6914] transition-all">
                  <div className="md:w-24 shrink-0">
                    <span className="block text-xl font-serif text-[#1a1a1a]">{event.date}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#8b6914]">{event.type}</span>
                      <span className="text-[#d8d5ce]">·</span>
                      <span className="text-[10px] uppercase text-[#767676]">{event.loc}</span>
                    </div>
                    <h4 className="text-xl font-serif text-[#1a1a1a] mb-4 group-hover:text-[#8b6914] transition-colors">{event.title}</h4>
                  </div>
                  <div className="md:w-32 flex items-center">
                    <a href="/contact" className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] border-b border-[#1a1a1a] pb-1 hover:text-[#8b6914] hover:border-[#8b6914] transition-all">
                      S'inscrire
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-24 p-12 border border-dashed border-[#d8d5ce] text-center">
        <p className="text-sm text-[#767676] italic">
          Les archives des événements passés seront prochainement disponibles pour les membres de l'Académie.
        </p>
      </div>
    </div>
  )
}
