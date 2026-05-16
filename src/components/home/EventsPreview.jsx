import SectionHeader from '../ui/SectionHeader'

// Public homepage preview of upcoming events.
//
// The previous version of this component shipped two hardcoded placeholder
// cards ("Prochainement", "À planifier"). For an institutional platform this
// reads as fictional programming, which is misleading. Until a public
// upcoming-events endpoint is wired (currently events are fetched per
// community, not globally), the homepage shows an honest empty state.
export default function EventsPreview() {
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

        <div className="p-12 lg:p-16 bg-white border border-dashed border-[#d8d5ce] text-center">
          <p className="text-sm font-serif italic text-[#767676] leading-relaxed max-w-xl mx-auto">
            Le calendrier des événements sera publié prochainement.
            Colloques, séminaires méthodologiques et cercles de lecture seront
            annoncés dans cet espace dès l’ouverture officielle.
          </p>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-[#767676] mb-10 max-w-lg mx-auto">
            Soyez informé en priorité de nos futurs appels à contribution et sessions académiques en nous contactant directement.
          </p>
          <a
            href="/contact"
            className="inline-block px-10 py-4 bg-[#1a1a1a] text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#8b6914] transition-all"
          >
            Nous contacter
          </a>
        </div>
      </div>
    </section>
  )
}
