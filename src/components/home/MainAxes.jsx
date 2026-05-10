import { Link } from 'react-router-dom'

export default function MainAxes() {
  const axes = [
    {
      title: 'Recherche & Publications',
      subtitle: 'Produire et structurer la pensée',
      desc: 'Analyses de haut niveau et relectures critiques pour bâtir un corpus de référence.',
      href: '/publications',
      icon: '⊕'
    },
    {
      title: 'Bibliothèque & Ressources',
      subtitle: 'Centraliser les sources fondamentales',
      desc: 'L’accès pérenne aux textes classiques y aux archives documentaires.',
      href: '/bibliotheque',
      icon: '⊗'
    },
    {
      title: 'Académie & Transmission',
      subtitle: 'Former des cadres intellectuels',
      desc: 'Des parcours rigoureux pour maîtriser les outils de la recherche souveraine.',
      href: '/academie',
      icon: '⊕'
    },
    {
      title: 'Dynamique collective',
      subtitle: 'Activer une communauté de pensée',
      desc: 'Stimuler le dialogue intellectuel par des rencontres y des colloques réguliers.',
      href: '/evenements',
      icon: '⊗'
    }
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {axes.map((axis) => (
            <Link 
              key={axis.title} 
              to={axis.href}
              className="group bg-white p-2 hover:translate-y-[-4px] transition-all duration-300 ease-out flex flex-col"
            >
              <div className="text-3xl text-[#8b6914] mb-8 transition-transform group-hover:scale-110">
                {axis.icon}
              </div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b6914] mb-3">
                {axis.title}
              </h3>
              <h4 className="text-base font-bold text-[#1a1a1a] mb-6 leading-tight">
                {axis.subtitle}
              </h4>
              <p className="text-sm text-[#767676] leading-relaxed mb-10 flex-1">
                {axis.desc}
              </p>
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] group-hover:text-[#8b6914] flex items-center gap-2 border-t border-[#d8d5ce] pt-6 transition-colors">
                Explorer l'axe <span className="text-lg">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>


  )
}
