import { Link } from 'react-router-dom'
import SectionHeader from '../ui/SectionHeader'

export default function OrientationSection() {
  const paths = [
    {
      title: 'Découvrir',
      desc: 'Découvrez la vision du projet et accédez à nos publications de référence pour initier votre parcours.',
      cta: 'Commencer',
      href: '/projet'
    },
    {
      title: 'Explorer',
      desc: 'Accédez à la bibliothèque, aux sources primaires et aux dossiers thématiques pour vos travaux.',
      cta: 'Accéder',
      href: '/bibliotheque'
    },
    {
      title: 'Contribuer',
      desc: 'Proposez vos articles, rejoignez l’Académie ou participez activement à la vie du projet.',
      cta: 'Participer',
      href: '/contact'
    }
  ]

  return (
    <section className="py-20 bg-[#F5F3EE] border-y border-[#d8d5ce]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <SectionHeader
            eyebrow="Orientation"
            title="Par où commencer ?"
            subtitle="Accédez à l’écosystème Ceedo selon votre objectif."
            align="center"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {paths.map((path) => (
            <div key={path.title} className="bg-white p-10 border border-[#d8d5ce] flex flex-col h-full hover:border-[#8b6914] hover:translate-y-[-4px] transition-all duration-300 ease-out">
              <h3 className="text-xl font-serif text-[#1a1a1a] mb-4">{path.title}</h3>
              <p className="text-sm text-[#767676] leading-relaxed mb-8 flex-1">
                {path.desc}
              </p>
              <Link
                to={path.href}
                className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a] hover:text-[#8b6914] transition-colors"
              >
                {path.cta} <span>→</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>

  )
}
