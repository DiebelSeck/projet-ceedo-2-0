import { Link } from 'react-router-dom'

// Each link must resolve to a distinct, public, content-bearing destination.
// Submission / "my articles" flows are auth-gated and live in the in-app
// Espace Auteur dropdown — they are deliberately not advertised in the public
// footer to avoid pushing visitors to a login wall without context.
const FOOTER_COLUMNS = [
  {
    heading: 'Le Projet',
    links: [
      { label: 'Présentation', href: '/projet' },
      { label: 'Méthodologie', href: '/projet/methodologie' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Ressources',
    links: [
      { label: 'Publications', href: '/publications' },
      { label: 'Bibliothèque', href: '/library' },
      { label: 'Dossiers', href: '/dossiers' },
      { label: 'Académie', href: '/academie' },
      { label: 'Événements', href: '/evenements' },
    ],
  },
  {
    heading: 'Engagement',
    links: [
      { label: 'Communauté', href: '/communaute' },
      { label: 'Nous rejoindre', href: '/contact' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white border-t border-[#8b6914] mt-auto overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Project Identity */}
          <div className="lg:col-span-1">
            <Link
              to="/"
              className="font-serif text-2xl font-bold tracking-tight text-white mb-6 block"
            >
              Ceedo <span className="text-[#8b6914]">2.0</span>
            </Link>
            <p className="text-sm text-[#767676] leading-relaxed mb-8">
              Infrastructure intellectuelle dédiée à la recherche, à la documentation et à la transmission des savoirs classiques et contemporains africains.
            </p>
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#8b6914]">
              Rigueur · Transmission · Souveraineté
            </div>
          </div>

          {/* Links */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-white mb-8 border-b border-[#2e2e2e] pb-4">
                {col.heading}
              </h3>
              <ul className="space-y-4">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-[#767676] hover:text-[#8b6914] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#2e2e2e] flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] text-[#4a4a4a] uppercase tracking-widest font-medium">
            © {new Date().getFullYear()} PROJET CEEDO — TOUS DROITS RÉSERVÉS
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-2">
            <Link to="/mentions-legales" className="text-[10px] text-[#4a4a4a] hover:text-[#8b6914] uppercase tracking-widest transition-colors font-medium">
              Mentions Légales
            </Link>
            <Link to="/confidentialite" className="text-[10px] text-[#4a4a4a] hover:text-[#8b6914] uppercase tracking-widest transition-colors font-medium">
              Confidentialité
            </Link>
            <Link to="/cookies" className="text-[10px] text-[#4a4a4a] hover:text-[#8b6914] uppercase tracking-widest transition-colors font-medium">
              Cookies
            </Link>
            <Link to="/accessibilite" className="text-[10px] text-[#4a4a4a] hover:text-[#8b6914] uppercase tracking-widest transition-colors font-medium">
              Accessibilité
            </Link>
            <Link to="/conditions-utilisation" className="text-[10px] text-[#4a4a4a] hover:text-[#8b6914] uppercase tracking-widest transition-colors font-medium">
              CGU
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
