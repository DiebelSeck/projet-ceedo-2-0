import { useMemo, useState } from 'react'
import SectionHeader from '../components/ui/SectionHeader'

// Routing table for the contact form.
//
// There is no transactional email backend wired to this site yet. To avoid
// (a) silent page reloads from an action-less <form> and (b) misleading
// "message sent" claims, the form is intentionally a *mailto composer*:
// pressing the primary button opens the visitor's default mail client with
// the appropriate recipient, subject and body pre-filled. Every claim made
// to the user is therefore true.
const SUBJECT_OPTIONS = [
  {
    value: 'submission',
    label: 'Soumission d\'article',
    recipient: 'editorial@projetceedo20.org',
    subject: 'Soumission d\'article — Projet Ceedo 2.0',
  },
  {
    value: 'academy',
    label: 'Inscription Académie',
    recipient: 'academie@projetceedo20.org',
    subject: 'Inscription Académie — Projet Ceedo 2.0',
  },
  {
    value: 'membership',
    label: 'Candidature Membre',
    recipient: 'admin@projetceedo20.org',
    subject: 'Candidature membre — Projet Ceedo 2.0',
  },
  {
    value: 'partnership',
    label: 'Partenariat Institutionnel',
    recipient: 'admin@projetceedo20.org',
    subject: 'Partenariat institutionnel — Projet Ceedo 2.0',
  },
  {
    value: 'other',
    label: 'Autre',
    recipient: 'admin@projetceedo20.org',
    subject: 'Demande — Projet Ceedo 2.0',
  },
]

export default function ContactPage() {
  const [subject, setSubject] = useState(SUBJECT_OPTIONS[0].value)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState(null)

  const target = useMemo(
    () => SUBJECT_OPTIONS.find(o => o.value === subject) ?? SUBJECT_OPTIONS[0],
    [subject]
  )

  function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!firstName.trim() || !lastName.trim() || !message.trim()) {
      setError('Merci de renseigner votre nom, prénom et message avant d\'ouvrir votre messagerie.')
      return
    }

    const senderLine = `${firstName.trim()} ${lastName.trim()}`
    const body = `${message.trim()}\n\n— ${senderLine}`
    const href =
      `mailto:${target.recipient}` +
      `?subject=${encodeURIComponent(target.subject)}` +
      `&body=${encodeURIComponent(body)}`

    window.location.href = href
  }

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
              <a
                href="mailto:editorial@projetceedo20.org"
                className="text-sm font-bold text-[#8b6914] hover:underline mb-8 inline-block"
              >
                editorial@projetceedo20.org
              </a>

              <h3 className="text-xl font-serif text-[#1a1a1a] mb-6 mt-8">Académie & Formation</h3>
              <p className="text-[#4a4a4a] leading-relaxed mb-6">
                Renseignements sur les inscriptions, les séminaires en cours et les programmes de certification.
              </p>
              <a
                href="mailto:academie@projetceedo20.org"
                className="text-sm font-bold text-[#8b6914] hover:underline mb-8 inline-block"
              >
                academie@projetceedo20.org
              </a>

              <h3 className="text-xl font-serif text-[#1a1a1a] mb-6 mt-8">Administration Générale</h3>
              <p className="text-[#4a4a4a] leading-relaxed mb-6">
                Partenariats institutionnels, questions administratives et demandes générales.
              </p>
              <a
                href="mailto:admin@projetceedo20.org"
                className="text-sm font-bold text-[#8b6914] hover:underline inline-block"
              >
                admin@projetceedo20.org
              </a>
            </div>

            <div className="bg-[#faf9f6] p-10 border border-[#d8d5ce]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] mb-3">Composer un message</h3>
              <p className="text-xs italic text-[#767676] leading-relaxed mb-8 border-l-2 border-[#8b6914] pl-3">
                Le formulaire ouvre votre messagerie habituelle, pré-remplie avec l’adresse correspondant à votre demande.
                Aucun message n’est envoyé directement depuis ce site.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-[#767676] mb-2 font-sans">
                    Objet de la demande
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-white border border-[#d8d5ce] px-4 py-3 text-sm focus:border-[#8b6914] outline-none transition-colors"
                  >
                    {SUBJECT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-[#767676] mb-2 font-sans">Prénom</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-white border border-[#d8d5ce] px-4 py-3 text-sm focus:border-[#8b6914] outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-[#767676] mb-2 font-sans">Nom</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-white border border-[#d8d5ce] px-4 py-3 text-sm focus:border-[#8b6914] outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-[#767676] mb-2 font-sans">Message</label>
                  <textarea
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-white border border-[#d8d5ce] px-4 py-3 text-sm focus:border-[#8b6914] outline-none transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-xs text-[#8b6914] border-l-2 border-[#8b6914] pl-3 py-1 italic">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-4 bg-[#1a1a1a] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#8b6914] transition-all"
                >
                  Ouvrir ma messagerie
                </button>

                <p className="text-[10px] uppercase tracking-widest text-[#767676] text-center">
                  Destinataire : <span className="text-[#1a1a1a]">{target.recipient}</span>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
