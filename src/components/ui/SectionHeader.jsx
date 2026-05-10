export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  theme = 'light',
}) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto',
  }[align]

  const titleColor = theme === 'dark' ? 'text-white' : 'text-[#1a1a1a]'
  const subtitleColor = theme === 'dark' ? 'text-[#9ca3af]' : 'text-[#4a4a4a]'
  const eyebrowColor = theme === 'dark' ? 'text-[#c49a2a]' : 'text-[#8b6914]'

  return (
    <div className={`max-w-2xl ${alignClass}`}>
      {eyebrow && (
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-opacity-60 ${eyebrowColor}`}>
          {eyebrow}
        </p>
      )}
      <h2
        className={`text-3xl lg:text-4xl font-semibold leading-tight tracking-wide mb-6 ${titleColor}`}
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`text-base leading-relaxed ${subtitleColor} max-w-3xl`}>
          {subtitle}
        </p>
      )}

    </div>
  )
}
