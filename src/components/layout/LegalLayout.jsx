import { useEffect } from 'react';
import SectionHeader from '../ui/SectionHeader';

/**
 * Reusable layout for legal and institutional pages.
 * Follows the Ceedo 2.0 institutional design language.
 */
export default function LegalLayout({ 
  eyebrow = "Cadre Juridique", 
  title, 
  intro, 
  children, 
  lastUpdated = "25 Avril 2026" 
}) {
  
  useEffect(() => {
    window.scrollTo(0, 0);
    if (title) {
      document.title = `${title} — Projet Ceedo 2.0`;
    }
    return () => {
      document.title = 'Projet Ceedo 2.0';
    };
  }, [title]);

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="border-b border-[#d8d5ce]/30 pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            subtitle={null}
          />
        </div>
      </section>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main content */}
          <div className="lg:col-span-8">
            {intro && (
              <p className="text-lg leading-relaxed font-serif italic text-[#4a4a4a] border-l-4 border-[#8b6914] pl-6 mb-12">
                {intro}
              </p>
            )}

            <div className="prose prose-serif prose-lg max-w-none text-[#4a4a4a] leading-relaxed legal-content">
              {children}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-[#faf9f6] p-8 border border-[#d8d5ce] sticky top-24">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] mb-6 pb-4 border-b border-[#d8d5ce]">
                Projet Ceedo 2.0
              </h4>
              <div className="mb-4">
                <span className="block text-[10px] text-[#767676] uppercase font-bold mb-1">
                  Dernière mise à jour
                </span>
                <span className="text-sm font-medium">
                  {lastUpdated}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-[#767676] uppercase font-bold mb-1">
                  Statut
                </span>
                <span className="text-sm font-medium italic opacity-70">
                  Document Officiel
                </span>
              </div>
              <div className="mt-8 pt-8 border-t border-[#d8d5ce]">
                <p className="text-[10px] text-[#767676] leading-relaxed uppercase tracking-wider">
                  Pour toute question relative à ce document :
                </p>
                <a href="mailto:admin@projetceedo20.org" className="text-sm font-bold text-[#8b6914] hover:underline">
                  admin@projetceedo20.org
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .legal-content h2 { 
          font-family: serif; 
          font-size: 1.5rem; 
          color: #1a1a1a; 
          margin-top: 2.5rem; 
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #faf9f6;
        }
        .legal-content p { margin-bottom: 1.25rem; }
        .legal-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; }
        .legal-content li { margin-bottom: 0.5rem; }
      `}</style>
    </main>
  );
}
