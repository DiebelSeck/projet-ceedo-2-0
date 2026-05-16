import { Link } from 'react-router-dom'
import SectionHeader from '../components/ui/SectionHeader'

// Public events index.
//
// Until a public listing endpoint exists (events live in a Directus
// `events` collection but the available helper filters by community slug
// only — there is no global "upcoming events" fetcher), this page shows
// an institutional empty state instead of the previously hardcoded
// placeholder cards.
export default function EvenementsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20 lg:py-32">
      <SectionHeader
        eyebrow="Agenda"
        title="Événements & Rencontres"
        subtitle="Colloques, conférences, séminaires méthodologiques et cercles de réflexion : la vie intellectuelle du Projet Ceedo en mouvement."
      />

      <div className="mt-20 p-12 lg:p-16 bg-white border border-dashed border-[#d8d5ce] text-center">
        <p className="text-sm font-serif italic text-[#767676] leading-relaxed max-w-xl mx-auto mb-8">
          Le calendrier des événements sera publié prochainement.
          Les colloques, séminaires méthodologiques et rencontres académiques
          du Projet Ceedo seront annoncés dans cet espace dès l’ouverture officielle.
        </p>
        <Link
          to="/contact"
          className="inline-block px-8 py-3 border border-[#1a1a1a] text-[#1a1a1a] text-[10px] font-bold uppercase tracking-widest hover:bg-[#1a1a1a] hover:text-white transition-all"
        >
          Être tenu informé
        </Link>
      </div>

      <div className="mt-16 text-center">
        <p className="text-sm text-[#767676] italic">
          Les archives des événements passés seront accessibles aux membres de l’Académie dès leur mise en ligne.
        </p>
      </div>
    </div>
  )
}
