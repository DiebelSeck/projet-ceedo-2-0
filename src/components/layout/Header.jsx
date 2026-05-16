import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { NAV_ITEMS } from '../../data/navigation'
import { useAuth } from '../../hooks/useAuth'
import SectionHeader from '../ui/SectionHeader'

// Editorial/admin roles allowed to see LMS admin + editorial panel entries.
// Kept as a const at module scope so it stays cheap to evaluate per render.
const EDITORIAL_ROLES = ['Administrator', 'Admin', 'Editor', 'Reviewer']

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [authorDropdownOpen, setAuthorDropdownOpen] = useState(false)
  const [explorerOpen, setExplorerOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isEditorial = isAuthenticated && EDITORIAL_ROLES.includes(user?.role?.name)

  async function handleLogout() {
    try {
      await logout()
    } catch (err) {
      console.error('[Header] logout failed:', err)
    } finally {
      setAuthorDropdownOpen(false)
      setMobileOpen(false)
      navigate('/')
    }
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setAuthorDropdownOpen(false)
    setExplorerOpen(false)
  }, [location])

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          scrolled ? 'bg-white/95 backdrop-blur-sm py-3 border-[#d8d5ce]' : 'bg-white py-5 border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="font-serif text-2xl font-bold tracking-tight text-[#1a1a1a] hover:opacity-80 transition-opacity"
          >
            Ceedo <span className="text-[#8b6914] font-sans text-sm align-super">2.0</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Explorer Mega Menu Entry */}
            <div className="relative">
              <button
                onMouseEnter={() => setExplorerOpen(true)}
                className={`px-4 py-2 text-[11px] font-serif font-bold transition-all flex items-center gap-2 ${
                  explorerOpen || location.pathname.includes('/explorer')
                    ? 'text-[#8b6914]'
                    : 'text-[#4a4a4a] hover:text-[#1a1a1a]'
                }`}
              >
                Explorer
                <svg className={`w-2.5 h-2.5 transition-transform ${explorerOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {explorerOpen && (
                <div 
                  className="absolute left-0 top-full pt-2 w-[780px]"
                  onMouseLeave={() => setExplorerOpen(false)}
                >
                  <div className="bg-white border border-[#e5e0d6] shadow-2xl p-8">
                    {/* Mega Menu Header */}
                    <div className="mb-8 pb-6 border-b border-[#faf9f6]">
                      <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#8b6914] mb-1">
                        Explorer le système Ceedo
                      </p>
                      <p className="text-sm text-[#767676] font-serif italic">
                        Naviguer par axes, espaces et ressources.
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-8">
                      {/* Column 1: Axes (Catégories) */}
                      <div>
                        <h4 className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#8b6914] mb-4 border-b border-[#faf9f6] pb-2">
                          Axes
                        </h4>
                        <div className="flex flex-col gap-1">
                          <MegaLink to="/explorer" label="Humanités" />
                          <MegaLink to="/explorer" label="Spiritualité" />
                          <MegaLink to="/explorer" label="Philosophie" />
                          <MegaLink to="/explorer" label="Sciences" />
                          <MegaLink to="/explorer" label="Intelligence Artificielle" />
                          <MegaLink to="/explorer" label="Économie" />
                        </div>
                      </div>

                      {/* Column 2: Espaces */}
                      <div>
                        <h4 className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#8b6914] mb-4 border-b border-[#faf9f6] pb-2">
                          Espaces
                        </h4>
                        <div className="flex flex-col gap-1">
                          <MegaLink to="/communaute/cercle-mai" label="Cercle MAI" />
                          <MegaLink to="/communaute" label="Communauté" />
                          <MegaLink to="/contact" label="Réseau" />
                        </div>
                      </div>

                      {/* Column 3: Ressources */}
                      <div>
                        <h4 className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#8b6914] mb-4 border-b border-[#faf9f6] pb-2">
                          Ressources
                        </h4>
                        <div className="flex flex-col gap-1">
                          <MegaLink to="/articles" label="Articles" />
                          <MegaLink to="/publications" label="Recherche" />
                          <MegaLink to="/dossiers" label="Dossiers" />
                          <MegaLink to="/library" label="Bibliothèque" />
                          <MegaLink to="/academie" label="Académie" />
                        </div>
                      </div>

                      {/* Column 4: Auteur */}
                      <div>
                        <h4 className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#8b6914] mb-4 border-b border-[#faf9f6] pb-2">
                          Auteur
                        </h4>
                        <div className="flex flex-col gap-1">
                          {isAuthenticated ? (
                            <>
                              <MegaLink to="/my-articles" label="Tableau de bord" />
                              <MegaLink to="/submit-article" label="Soumettre" />
                              <MegaLink to="/my-articles?status=draft" label="Brouillons" />
                            </>
                          ) : (
                            <>
                              <MegaLink to="/login" label="Se connecter" />
                              <MegaLink to="/contact" label="Devenir auteur" />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all ${
                    isActive ? 'text-[#8b6914]' : 'text-[#4a4a4a] hover:text-[#1a1a1a]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Action CTA + Author Space */}
          <div className="flex items-center gap-4">
            {/* Espace Auteur Dropdown (Desktop) */}
            <div className="hidden lg:block relative">
              <button
                onMouseEnter={() => setAuthorDropdownOpen(true)}
                className={`flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                  authorDropdownOpen || location.pathname.includes('articles') || location.pathname.includes('submit')
                    ? 'text-[#8b6914]'
                    : 'text-[#4a4a4a] hover:text-[#1a1a1a]'
                }`}
              >
                Espace Auteur
                <svg className={`w-2.5 h-2.5 transition-transform ${authorDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {authorDropdownOpen && (
                <div 
                  className="absolute right-0 top-full pt-2 w-56"
                  onMouseLeave={() => setAuthorDropdownOpen(false)}
                >
                  <div className="bg-white border border-[#d8d5ce] shadow-xl p-2 flex flex-col">
                    {isAuthenticated ? (
                      <>
                        <DropdownLink to="/my-articles" label="Tableau de bord" />
                        <DropdownLink to="/submit-article" label="Soumettre un article" />

                        {isEditorial && (
                          <>
                            <div className="h-px bg-[#d8d5ce]/30 my-2" />
                            <DropdownLink to="/admin" label="Administration LMS" />
                            <DropdownLink to="/editor" label="Panel Éditorial" />
                          </>
                        )}

                        <div className="h-px bg-[#d8d5ce]/30 my-2" />
                        <DropdownLink to="/my-articles?status=draft" label="Mes Brouillons" />
                        <DropdownLink to="/my-articles?status=review" label="En Révision" />
                        <DropdownLink to="/my-articles?status=published" label="Mes Publications" />

                        <div className="h-px bg-[#d8d5ce]/30 my-2" />
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#8b6914] hover:bg-[#faf9f6] hover:text-[#1a1a1a] transition-all"
                        >
                          Se déconnecter
                        </button>
                      </>
                    ) : (
                      <>
                        <DropdownLink to="/login" label="Se connecter" />
                        <DropdownLink to="/contact" label="Devenir auteur" />
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/contact"
              className="hidden md:inline-block px-5 py-2.5 bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#8b6914] transition-all"
            >
              REJOINDRE LE PROJET
            </Link>
            
            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-[#1a1a1a]"
              aria-label="Menu"
            >
              <div className="w-6 flex flex-col gap-1.5">
                <span className={`h-px bg-current transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`h-px bg-current transition-all ${mobileOpen ? 'opacity-0' : ''}`}></span>
                <span className={`h-px bg-current transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-white transition-transform duration-500 lg:hidden ${
          mobileOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="h-full flex flex-col pt-24 pb-12 px-6 overflow-y-auto">
          <div className="mb-12">
            <SectionHeader 
              eyebrow="Navigation"
              title="Menu Principal"
              align="center"
            />
          </div>
          <nav className="flex flex-col gap-6 text-center">
            <Link to="/explorer" className="text-2xl font-serif text-[#8b6914]">Explorer</Link>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `text-xl font-serif tracking-tight transition-all ${
                    isActive ? 'text-[#8b6914]' : 'text-[#1a1a1a]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          {/* Mobile Espace Auteur */}
          <div className="mt-8 pt-8 border-t border-[#d8d5ce] flex flex-col gap-6">
            <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8b6914] text-center">
              Espace Auteur
            </h3>
            <div className="flex flex-col gap-4 text-center">
              {isAuthenticated ? (
                <>
                  <Link to="/my-articles" className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a]">Mes articles</Link>
                  <Link to="/submit-article" className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a]">Soumettre un article</Link>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Link to="/my-articles?status=draft" className="text-[9px] uppercase font-bold tracking-widest py-2 bg-[#faf9f6] text-[#767676]">Brouillons</Link>
                    <Link to="/my-articles?status=review" className="text-[9px] uppercase font-bold tracking-widest py-2 bg-[#faf9f6] text-[#767676]">Révision</Link>
                    <Link to="/my-articles?status=published" className="text-[9px] uppercase font-bold tracking-widest py-2 bg-[#faf9f6] text-[#767676] col-span-2">Publiés</Link>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a]">Se connecter</Link>
                  <Link to="/contact" className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a]">Devenir auteur</Link>
                </>
              )}
            </div>
          </div>
          <div className="mt-auto flex flex-col gap-4">
            <Link
              to="/contact"
              className="w-full py-4 bg-[#1a1a1a] text-white text-xs font-bold uppercase tracking-widest text-center"
            >
              REJOINDRE LE PROJET
            </Link>
            <p className="text-[10px] text-[#767676] text-center uppercase tracking-widest font-bold">
              Infrastructure Intellectuelle Kamite
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

function DropdownLink({ to, label }) {
  return (
    <Link
      to={to}
      className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#4a4a4a] hover:bg-[#faf9f6] hover:text-[#8b6914] transition-all"
    >
      {label}
    </Link>
  )
}

function MegaLink({ to, label }) {
  return (
    <Link
      to={to}
      className="px-2 py-1.5 -ml-2 text-[10px] font-bold uppercase tracking-wider text-[#4a4a4a] hover:text-[#8b6914] hover:bg-[#faf9f6] transition-all rounded-sm"
    >
      {label}
    </Link>
  )
}
