import SectionHeader from '../ui/SectionHeader'

export default function EventsPreview() {
  const upcomingEvents = [
    {
      date: 'Prochainement',
      title: 'Colloque : Fondements de la pensée épistémologique africaine',
      type: 'Conférence',
      status: 'En préparation'
    },
    {
      date: 'À planifier',
      title: 'Séminaire Méthodologique : Analyse des textes classiques',
      type: 'Atelier',
      status: 'Session académique'
    }
  ]

  return (
    <section className="py-20 bg-[#FAF9F6] border-y border-[#d8d5ce]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-20">
          <SectionHeader
            eyebrow="Événements"
            title="Dynamique Collective"
            subtitle="Des espaces d’échange réservés à une participation engagée."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {upcomingEvents.map((event, idx) => (
            <div key={event.title} className="p-10 bg-white border border-[#d8d5ce] group hover:border-[#8b6914] hover:translate-y-[-4px] transition-all duration-300 ease-out relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 py-1 px-3 bg-[#f5edd6] text-[#8b6914] text-[9px] font-bold uppercase tracking-wider">
                {event.status}
              </div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] text-[#8b6914] font-bold uppercase tracking-widest">
                  {event.type}
                </span>
                <span className="text-[#d8d5ce]">|</span>
                <span className="text-[10px] text-[#767676] font-bold uppercase tracking-widest">
                  {event.date}
                </span>
              </div>
              <h3 className="text-2xl font-serif text-[#1a1a1a] mb-8 group-hover:text-[#8b6914] transition-colors leading-tight flex-1">
                {event.title}
              </h3>
              <div className="flex items-center justify-between border-t border-[#f2f0eb] pt-6">
                <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#767676]">
                  {idx === 0 ? 'Accès sur sélection' : 'Participation sur dossier'}
                </div>
                <div className="w-1 h-1 bg-[#d8d5ce] rounded-full"></div>
              </div>
            </div>
          ))}
        </div>


        
        <div className="mt-20 text-center">
          <p className="text-sm text-[#767676] mb-10 max-w-lg mx-auto">
            Accédez à la vie collective du projet y soyez informé de nos futurs appels à contribution y sessions académiques.
          </p>
          <a
            href="/contact"
            className="inline-block px-10 py-4 bg-[#1a1a1a] text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#8b6914] transition-all"
          >
            S'inscrire à la lettre d'information
          </a>
        </div>
      </div>
    </section>
  )
}
