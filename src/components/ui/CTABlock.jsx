import { Link } from 'react-router-dom'

export default function CTABlock({
  eyebrow,
  title,
  subtitle,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  theme = 'dark',
}) {
  const isDark = theme === 'dark'

  return (
    <section
      className={`py-24 px-6 ${isDark ? 'bg-[#1a1a1a] text-white' : 'bg-[#faf9f6] text-[#1a1a1a]'}`}
    >
      <div className="max-w-3xl mx-auto text-center">
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c49a2a] mb-6 text-opacity-60">
            {eyebrow}
          </p>
        )}
        <h2
          className={`text-3xl lg:text-4xl font-semibold leading-tight tracking-wide mb-8 ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className={`text-base leading-relaxed mb-12 max-w-xl mx-auto ${isDark ? 'text-[#9ca3af]' : 'text-[#4a4a4a]'}`}>
            {subtitle}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {primaryHref && (
            <Link
              to={primaryHref}
              className={`inline-flex items-center justify-center px-10 py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                isDark
                  ? 'bg-[#8b6914] text-white hover:bg-[#c49a2a]'
                  : 'bg-[#1a1a1a] text-white hover:bg-[#8b6914]'
              }`}
            >
              {primaryLabel}
            </Link>
          )}
          {secondaryHref && (
            <Link
              to={secondaryHref}
              className={`inline-flex items-center justify-center px-10 py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 border hover:scale-[1.02] ${
                isDark
                  ? 'border-[#4a4a4a] text-[#9ca3af] hover:border-[#767676] hover:text-white'
                  : 'border-[#d8d5ce] text-[#4a4a4a] hover:border-[#1a1a1a] hover:text-[#1a1a1a]'
              }`}
            >
              {secondaryLabel}
            </Link>
          )}
        </div>

      </div>
    </section>
  )
}
