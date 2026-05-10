import SectionHeader from '../components/ui/SectionHeader'

export default function ContactPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20 lg:py-32">
      <SectionHeader
        eyebrow="Contact & Collaboration"
        title="Rejoindre le Projet Ceedo 2.0"
        subtitle="Que vous souhaitiez soumettre un article, candidater à l'Académie ou proposer un partenariat institutionnel, utilisez les canaux ci-dessous."
      />

      <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-12">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-serif text-[#1a1a1a] mb-6">Secrétariat Éditorial</h3>
              <p className="text-[#4a4a4a] leading-relaxed mb-6">
                Pour toute question relative aux publications, aux soumissions de manuscrits ou à la charte éditoriale.
              </p>
              <div className="text-sm font-bold text-[#8b6914] mb-8">
                editorial@projetceedo20.org
              </div>

              <h3 className="text-xl font-serif text-[#1a1a1a] mb-6">Académie & Formation</h3>
              <p className="text-[#4a4a4a] leading-relaxed mb-6">
                Renseignements sur les inscriptions, les séminaires en cours et les programmes de certification.
              </p>
              <div className="text-sm font-bold text-[#8b6914] mb-8">
                academie@projetceedo20.org
              </div>

              <h3 className="text-xl font-serif text-[#1a1a1a] mb-6">Administration Générale</h3>
              <p className="text-[#4a4a4a] leading-relaxed mb-6">
                Partenariats institutionnels, questions administratives et demandes générales.
              </p>
              <div className="text-sm font-bold text-[#8b6914]">
                admin@projetceedo20.org
              </div>
            </div>

            <div className="bg-[#faf9f6] p-10 border border-[#d8d5ce]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] mb-8">Formulaire de demande</h3>
              <form className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-[#767676] mb-2 font-sans">
                    Objet de la demande
                  </label>
                  <select className="w-full bg-white border border-[#d8d5ce] px-4 py-3 text-sm focus:border-[#8b6914] outline-none transition-colors">
                    <option>Soumission d'article</option>
                    <option>Inscription Académie</option>
                    <option>Candidature Membre</option>
                    <option>Partenariat Institutionnel</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-[#767676] mb-2 font-sans">Prénom</label>
                    <input type="text" className="w-full bg-white border border-[#d8d5ce] px-4 py-3 text-sm focus:border-[#8b6914] outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-[#767676] mb-2 font-sans">Nom</label>
                    <input type="text" className="w-full bg-white border border-[#d8d5ce] px-4 py-3 text-sm focus:border-[#8b6914] outline-none transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-[#767676] mb-2 font-sans">Message</label>
                  <textarea rows="4" className="w-full bg-white border border-[#d8d5ce] px-4 py-3 text-sm focus:border-[#8b6914] outline-none transition-colors"></textarea>
                </div>
                <button className="w-full py-4 bg-[#1a1a1a] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#8b6914] transition-all">
                  Envoyer la demande
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
