import { Link } from 'react-router-dom'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function EventCard({ event }) {
  const { id, type, title, date, location, online, description } = event

  return (
    <article className="group border border-[#d8d5ce] hover:border-[#8b6914] transition-colors bg-white p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#8b6914]">
          {type}
        </span>
        {online && (
          <span className="text-xs text-[#767676] border border-[#e8e6e1] px-2 py-0.5 rounded">
            En ligne
          </span>
        )}
      </div>
      <Link to={`/evenements/${id}`}>
        <h3
          className="text-lg font-semibold text-[#1a1a1a] leading-snug mb-3 group-hover:text-[#8b6914] transition-colors"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {title}
        </h3>
      </Link>
      <p className="text-sm text-[#4a4a4a] leading-relaxed mb-5 line-clamp-2">{description}</p>
      <div className="flex items-center gap-4 text-xs text-[#767676] pt-4 border-t border-[#e8e6e1]">
        <span>{formatDate(date)}</span>
        <span>·</span>
        <span>{location}</span>
      </div>
    </article>
  )
}
