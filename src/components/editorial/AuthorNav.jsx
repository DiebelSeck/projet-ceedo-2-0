import { Link, useLocation } from 'react-router-dom';

/**
 * Author navigation menu for editorial section.
 * Provides quick access to dashboard, new draft, and status filters.
 */
export default function AuthorNav() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentStatus = searchParams.get('status') || 'Tous';

  const items = [
    { label: 'Tableau de bord', href: '/my-articles', exact: true },
    { label: 'Nouveau brouillon', href: '/submit-article' },
    { label: 'Brouillons', href: '/my-articles?status=draft', status: 'draft' },
    { label: 'En révision', href: '/my-articles?status=review', status: 'review' },
    { label: 'Publiés', href: '/my-articles?status=published', status: 'published' },
  ];

  return (
    <nav className="border-b border-[#d8d5ce] bg-white sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-6">
        <ul className="flex flex-wrap items-center gap-x-8 gap-y-2 overflow-x-auto">
          {items.map((item) => {
            // Logic to determine if active
            const isActive = item.status 
              ? currentStatus === item.status 
              : item.exact 
                ? location.pathname === item.href && !searchParams.get('status')
                : location.pathname === item.href;

            return (
              <li key={item.label}>
                <Link
                  to={item.href}
                  className={`relative block py-5 text-[10px] uppercase font-bold tracking-widest transition-colors whitespace-nowrap ${
                    isActive ? 'text-[#1a1a1a]' : 'text-[#767676] hover:text-[#1a1a1a]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#8b6914]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
