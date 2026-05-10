import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative bg-white pt-24 pb-20 lg:pt-32 lg:pb-32 overflow-hidden border-b border-[#d8d5ce]">
      {/* Subtle organic background element */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03] pointer-events-none">
        <svg viewBox="0 0 400 400" className="w-full h-full text-[#8b6914]">
          <path d="M0,200 Q100,100 200,200 T400,200" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="10 10" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f5edd6] border border-[#d8d5ce] rounded-full mb-8">
            <span className="w-2 h-2 bg-[#8b6914] rounded-full"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b6914]">Infrastructure Intellectuelle & Académique</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#1a1a1a] leading-[1.15] mb-8">
            Structurer la production <br />
            du <span className="text-[#8b6914]">savoir africain</span>.
          </h1>
          
          <p className="text-lg md:text-xl text-[#4a4a4a] leading-relaxed font-serif italic mb-10 max-w-2xl">
            Une infrastructure intellectuelle dédiée à la production, à la validation et à la transmission du savoir africain.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link
              to="/publications"
              className="px-10 py-4 bg-[#1a1a1a] text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#8b6914] hover:scale-[1.02] transition-all duration-200 shadow-lg"
            >
              Consulter les publications
            </Link>
            <Link
              to="/projet"
              className="px-10 py-4 border border-[#d8d5ce] text-[#1a1a1a] text-[11px] font-bold uppercase tracking-[0.2em] hover:border-[#1a1a1a] hover:scale-[1.02] transition-all duration-200 bg-white"
            >
              Comprendre le projet
            </Link>
          </div>
        </div>
      </div>
    </section>

  )
}
