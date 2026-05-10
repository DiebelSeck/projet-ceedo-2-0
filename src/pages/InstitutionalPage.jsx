import { useEffect } from 'react';
import { useInstitutionalPage } from '../hooks/useInstitutionalPage';
import SectionHeader from '../components/ui/SectionHeader';

/**
 * CMS-driven institutional page component.
 *
 * Props:
 *   slug    — slug of the record in the Directus `pages` collection (required)
 *   eyebrow — small label shown above the page title (optional)
 */
export default function InstitutionalPage({ slug, eyebrow }) {
  const { page, loading, error } = useInstitutionalPage(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (page?.metaTitle) {
      document.title = `${page.metaTitle} — Projet Ceedo 2.0`;
    }
    return () => {
      document.title = 'Projet Ceedo 2.0';
    };
  }, [page]);

  if (loading) return <PageLoading />;
  if (error) return <PageError />;
  if (!page) return <PageNotReady />;

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="border-b border-[#d8d5ce]/30 pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            eyebrow={eyebrow}
            title={page.headline}
            subtitle={null}
          />
        </div>
      </section>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main content */}
          <div className="lg:col-span-8">
            {page.intro && (
              <p className="text-lg leading-relaxed font-serif italic text-[#4a4a4a] border-l-4 border-[#8b6914] pl-6 mb-12">
                {page.intro}
              </p>
            )}

            {page.content ? (
              <div
                className="prose prose-serif prose-lg max-w-none text-[#4a4a4a] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            ) : (
              !page.intro && (
                <p className="text-sm italic text-[#767676]">
                  Contenu en cours de rédaction.
                </p>
              )
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-[#faf9f6] p-8 border border-[#d8d5ce] sticky top-24">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] mb-6 pb-4 border-b border-[#d8d5ce]">
                Projet Ceedo 2.0
              </h4>
              {page.dateUpdated && (
                <div className="mb-4">
                  <span className="block text-[10px] text-[#767676] uppercase font-bold mb-1">
                    Mis à jour
                  </span>
                  <span className="text-sm font-medium">
                    {new Date(page.dateUpdated).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
              <div>
                <span className="block text-[10px] text-[#767676] uppercase font-bold mb-1">
                  Statut
                </span>
                <span className="text-sm font-medium italic opacity-70">
                  Document de référence
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function PageLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-32">
      <div className="w-12 h-12 border-4 border-[#C4965A]/20 border-t-[#C4965A] rounded-full animate-spin mb-4" />
      <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#767676] opacity-60">
        Chargement...
      </p>
    </div>
  );
}

function PageError() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-32 text-center">
      <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#8b6914] mb-6">
        Erreur de chargement
      </p>
      <h1
        className="text-3xl font-semibold text-[#1a1a1a] mb-6"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        Cette page n'a pas pu être chargée
      </h1>
      <p className="text-[#4a4a4a] leading-relaxed max-w-md">
        Une erreur s'est produite lors du chargement du contenu.
        Veuillez actualiser la page ou réessayer ultérieurement.
      </p>
    </div>
  );
}

function PageNotReady() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-32 text-center">
      <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#8b6914] mb-6">
        En préparation
      </p>
      <h1
        className="text-3xl font-semibold text-[#1a1a1a] mb-6"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        Cette section est en cours de rédaction
      </h1>
      <p className="text-[#4a4a4a] leading-relaxed max-w-md">
        Le contenu de cette page est en cours de préparation éditoriale.
        Merci de revenir prochainement.
      </p>
    </div>
  );
}
