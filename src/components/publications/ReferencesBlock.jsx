export default function ReferencesBlock({ references }) {
  if (!references || (Array.isArray(references) && references.length === 0)) return null;

  return (
    <section className="pt-12 border-t border-border-light">
      <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-10 text-ink-muted flex items-center gap-4">
        <span className="w-10 h-[1px] bg-gold-pale"></span>
        Références Bibliographiques
      </h3>
      <ul className="space-y-4">
        {references.map((ref, index) => (
          <li key={ref.id || index} className="flex gap-6 group hover:translate-x-1 transition-transform duration-300">
            <span className="text-[10px] font-bold text-gold/60 mt-1 shrink-0 w-6">
              {String(index + 1).padStart(2, '0')}.
            </span>
            <div className="text-[13px] leading-relaxed text-ink-muted font-serif italic group-hover:text-ink transition-colors">
              {ref.citation}
              {ref.url && (
                <a 
                  href={ref.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-3 not-italic text-[10px] uppercase font-bold tracking-widest text-gold hover:text-ink underline decoration-gold/20 underline-offset-4"
                >
                  Document Source
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

