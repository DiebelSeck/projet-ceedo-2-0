import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <p
        className="text-8xl font-semibold text-[#e8e6e1] mb-6"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        404
      </p>
      <h1 className="text-2xl font-semibold text-[#1a1a1a] mb-4">Page introuvable</h1>
      <p className="text-base text-[#4a4a4a] leading-relaxed mb-8">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold uppercase tracking-widest bg-[#1a1a1a] text-white hover:bg-[#8b6914] transition-colors"
      >
        Retour à l'accueil
      </Link>
    </div>
  )
}
