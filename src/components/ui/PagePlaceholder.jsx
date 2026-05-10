import { Link } from 'react-router-dom'

export default function PagePlaceholder({ title, description, section }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <div className="border-l-2 border-[#8b6914] pl-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#8b6914] mb-3">
          {section}
        </p>
        <h1
          className="text-4xl lg:text-5xl font-semibold text-[#1a1a1a] leading-tight mb-6"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {title}
        </h1>
        <p className="text-lg text-[#4a4a4a] leading-relaxed mb-10 max-w-2xl">
          {description}
        </p>
        <div className="bg-[#faf9f6] border border-[#e8e6e1] rounded p-6 max-w-lg">
          <p className="text-sm text-[#767676]">
            <span className="font-medium text-[#1a1a1a]">Section en construction.</span>{' '}
            Le contenu de cette section sera disponible prochainement. Rejoignez la plateforme pour être informé(e) des nouvelles publications.
          </p>
          <Link
            to="/contact"
            className="inline-block mt-4 text-xs font-semibold uppercase tracking-widest text-[#8b6914] border-b border-[#8b6914] hover:text-[#1a1a1a] hover:border-[#1a1a1a] transition-colors"
          >
            Rejoindre la plateforme →
          </Link>
        </div>
      </div>
    </div>
  )
}
