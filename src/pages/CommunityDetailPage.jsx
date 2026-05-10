import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCommunitySpace } from '../hooks/useCommunitySpace';
import { useAuth } from '../hooks/useAuth';
import { useCommunityMembership } from '../hooks/useCommunityMembership';
import { requestMembership } from '../lib/auth';
import { calculateReadingTime } from '../lib/readingTime';
import SectionHeader from '../components/ui/SectionHeader';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://admin.projetceedo20.org';

/**
 * Dynamic community space detail page.
 * Route: /communaute/:slug
 * Fetches community_spaces + linked events + linked programs from Directus.
 */
export default function CommunityDetailPage() {
  const { slug } = useParams();
  const { space, events, programs, articles, loading, error } = useCommunitySpace(slug);
  const [activeTab, setActiveTab] = useState('events');

  // ─── Membership gating (live, Directus-backed) ───────────────────────────
  const { isAuthenticated } = useAuth();
  const { isMember, status: membershipStatus, loading: membershipLoading } = useCommunityMembership(space?.id);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveTab('events');
  }, [slug]);

  useEffect(() => {
    if (space?.title) {
      document.title = `${space.title} — Projet Ceedo 2.0`;
    }
    return () => {
      document.title = 'Projet Ceedo 2.0';
    };
  }, [space]);

  if (loading) return <PageLoading />;
  if (error)   return <PageError />;
  if (!space)  return <PageNotReady />;

  // ─── Split events into upcoming / past ────────────────────────────────────
  const now = new Date();
  const upcomingEvents = events
    .filter((e) => e.startDate && new Date(e.startDate) >= now)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const pastEvents = events
    .filter((e) => e.startDate && new Date(e.startDate) < now)
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  const [featuredEvent, ...restUpcoming] = upcomingEvents;

  // ─── Promote first program as featured (parity with events) ──────────────
  const [featuredProgram, ...restPrograms] = programs;

  // ─── Restricted? ─────────────────────────────────────────────────────────
  // Defer the locked UI until the membership check resolves to avoid a flash
  // of "members-only" content for actual members.
  const isRestricted =
    space.accessType === 'members' && !membershipLoading && !isMember;

  const tabs = [
    { id: 'about',        label: 'À propos' },
    { id: 'events',       label: 'Événements',   count: events.length },
    { id: 'programs',     label: 'Programmes',   count: programs.length },
    { id: 'publications', label: 'Publications', count: articles.length },
  ];

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="border-b border-[#d8d5ce]/30 pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-6">
            <SectionHeader
              eyebrow="Communauté"
              title={space.title}
              subtitle={null}
            />
            <StatusBadge
              accessType={space.accessType}
              isMember={isMember}
              membershipStatus={membershipStatus}
              membershipLoading={membershipLoading}
            />
          </div>
          {space.description && (
            <div className="mt-4 text-lg leading-relaxed text-[#4a4a4a] max-w-2xl" dangerouslySetInnerHTML={{ __html: space.description || '' }} />
          )}
        </div>
      </section>

      {/* Members-only notice */}
      {space.accessType === 'members' && (
        <div className="border-b border-[#d8d5ce]/30 bg-[#faf9f6]">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="text-sm text-[#4a4a4a] leading-relaxed flex-1">
              Cet espace est réservé aux membres du Projet Ceedo 2.0.
              Certains contenus peuvent nécessiter une adhésion active.
            </p>
            <a
              href="/contact"
              className="shrink-0 inline-block px-6 py-3 bg-[#8b6914] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#c4965a] transition-all"
            >
              Demander mon adhésion
            </a>
          </div>
        </div>
      )}

      {/* Tabs nav (sticky for quick switching) */}
      <nav className="sticky top-0 z-10 bg-white border-b border-[#d8d5ce]/60">
        <div className="max-w-6xl mx-auto px-6">
          <ul className="flex gap-8 overflow-x-auto" role="tablist">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <li key={tab.id} role="presentation">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative py-5 text-[10px] uppercase font-bold tracking-widest transition-colors whitespace-nowrap ${
                      isActive ? 'text-[#1a1a1a]' : 'text-[#767676] hover:text-[#1a1a1a]'
                    }`}
                  >
                    {tab.label}
                    {typeof tab.count === 'number' && (
                      <span className={`ml-2 inline-block px-2 py-0.5 text-[9px] tracking-normal ${
                        isActive ? 'bg-[#8b6914] text-white' : 'bg-[#faf9f6] text-[#767676]'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#8b6914]" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24">

        {/* À propos */}
        {activeTab === 'about' && (
          <section>
            <h2 className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] mb-10 pb-4 border-b border-[#d8d5ce]">
              À propos du cercle
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Présentation */}
              <div className="lg:col-span-2">
                <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#8b6914] mb-6">
                  Présentation
                </h3>
                {space.description ? (
                  <div
                    className="text-base text-[#4a4a4a] leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: space.description || '' }}
                  />
                ) : (
                  <p className="text-sm italic text-[#767676]">
                    Aucune présentation détaillée n'est disponible pour cet espace.
                  </p>
                )}
              </div>

              {/* En bref */}
              <aside className="lg:col-span-1">
                <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#8b6914] mb-6">
                  En bref
                </h3>
                <dl className="space-y-5 border border-[#d8d5ce] bg-[#faf9f6] p-6">
                  <div>
                    <dt className="text-[10px] uppercase tracking-widest text-[#767676] mb-1">Accès</dt>
                    <dd className="text-sm font-serif text-[#1a1a1a]">
                      {space.accessType === 'members' ? 'Réservé aux membres' : 'Ouvert à tous'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-widest text-[#767676] mb-1">Événements à venir</dt>
                    <dd className="text-sm font-serif text-[#1a1a1a]">{upcomingEvents.length}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-widest text-[#767676] mb-1">Programmes actifs</dt>
                    <dd className="text-sm font-serif text-[#1a1a1a]">{programs.length}</dd>
                  </div>
                </dl>

                {space.accessType === 'members' && (
                  <a
                    href="/contact"
                    className="mt-6 inline-block w-full text-center px-6 py-3 bg-[#8b6914] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#c4965a] transition-all"
                  >
                    Demander mon adhésion
                  </a>
                )}
              </aside>
            </div>
          </section>
        )}

        {/* Événements */}
        {activeTab === 'events' && (
          <section>
            <h2 className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] mb-10 pb-4 border-b border-[#d8d5ce]">
              Événements
            </h2>
            {isRestricted ? (
              <LockedSection
                label="Événements réservés aux membres"
                message="Les événements de cet espace sont accessibles aux membres du Projet Ceedo 2.0. Adhérez pour consulter le programme complet et vous inscrire aux séances."
                isAuthenticated={isAuthenticated}
                communityId={space.id}
                membershipStatus={membershipStatus}
                teaserCount={upcomingEvents.length}
                teaserLabel={upcomingEvents.length > 1 ? 'événements à venir' : 'événement à venir'}
              />
            ) : events.length === 0 ? (
              <p className="text-sm italic text-[#767676]">
                Aucun événement publié pour cet espace.
              </p>
            ) : (
              <div className="space-y-16">
                {/* Upcoming */}
                <div>
                  <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#8b6914] mb-6">
                    À venir
                  </h3>
                  {upcomingEvents.length === 0 ? (
                    <p className="text-sm italic text-[#767676]">
                      Aucun événement à venir pour le moment.
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {featuredEvent && <EventCard event={featuredEvent} featured />}
                      {restUpcoming.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Past */}
                {pastEvents.length > 0 && (
                  <div>
                    <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#767676] mb-6">
                      Passés
                    </h3>
                    <div className="space-y-6 opacity-70">
                      {pastEvents.map((event) => (
                        <EventCard key={event.id} event={event} past />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Programmes */}
        {activeTab === 'programs' && (
          <section>
            <h2 className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] mb-10 pb-4 border-b border-[#d8d5ce]">
              Programmes
            </h2>
            {isRestricted ? (
              <LockedSection
                label="Programmes réservés aux membres"
                message="Les programmes de cet espace sont accessibles aux membres du Projet Ceedo 2.0. L'adhésion donne accès aux cycles de formation, séminaires et ateliers."
                isAuthenticated={isAuthenticated}
                communityId={space.id}
                membershipStatus={membershipStatus}
                teaserCount={programs.length}
                teaserLabel={programs.length > 1 ? 'programmes en accès membre' : 'programme en accès membre'}
              />
            ) : programs.length === 0 ? (
              <p className="text-sm italic text-[#767676]">
                Aucun programme publié pour cet espace.
              </p>
            ) : (
              <div className="space-y-10">
                {featuredProgram && (
                  <div>
                    <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#8b6914] mb-6">
                      Programme phare
                    </h3>
                    <ProgramCard program={featuredProgram} featured />
                  </div>
                )}
                {restPrograms.length > 0 && (
                  <div>
                    {featuredProgram && (
                      <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#767676] mb-6">
                        Autres programmes
                      </h3>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {restPrograms.map((program) => (
                        <ProgramCard key={program.id} program={program} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Publications */}
        {activeTab === 'publications' && (
          <section>
            <h2 className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] mb-10 pb-4 border-b border-[#d8d5ce]">
              Publications du cercle
            </h2>
            {articles.length === 0 ? (
              <p className="text-sm italic text-[#767676]">
                Aucune publication n'est encore associée à ce cercle.
              </p>
            ) : (
              <div className="divide-y divide-[#d8d5ce]">
                {articles.map((article) => (
                  <ArticleRow key={article.id} article={article} />
                ))}
              </div>
            )}
          </section>
        )}

      </div>
    </main>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function EventCard({ event, featured = false, past = false }) {
  const dateLabel = formatDateRange(event.startDate, event.endDate);
  const ctaUrl = event.registrationUrl || event.onlineUrl || null;
  const ctaLabel = past
    ? 'Voir le compte-rendu'
    : event.mode === 'online'
      ? 'Rejoindre'
      : event.mode === 'hybride'
        ? 'Participer'
        : 'S\'inscrire';

  // The CTA for past events should only render if there's actually a URL to follow.
  const showCta = ctaUrl && !past;

  const containerClass = featured
    ? 'flex flex-col md:flex-row gap-6 md:gap-12 p-10 border-l-4 border-l-[#8b6914] border border-[#d8d5ce] bg-[#faf9f6] group hover:border-[#8b6914] transition-all'
    : 'flex flex-col md:flex-row gap-6 md:gap-12 p-8 border border-[#d8d5ce] bg-white group hover:border-[#8b6914] transition-all';

  return (
    <div className={containerClass}>
      {/* Date */}
      <div className="md:w-32 shrink-0">
        {featured && (
          <span className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-[#8b6914]">
            À la une
          </span>
        )}
        {dateLabel && (
          <span className={`block leading-snug font-serif text-[#1a1a1a] ${featured ? 'text-base' : 'text-sm'}`}>
            {dateLabel}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
          {event.eventType && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8b6914]">
              {event.eventType}
            </span>
          )}
          {event.eventType && event.mode && (
            <span className="text-[#d8d5ce]">·</span>
          )}
          {event.mode === 'presentiel' && event.location && (
            <span className="text-[10px] uppercase text-[#767676]">{event.location}</span>
          )}
          {event.mode === 'online' && (
            <span className="text-[10px] uppercase text-[#767676]">Online</span>
          )}
          {event.mode === 'hybride' && (
            <span className="text-[10px] uppercase text-[#767676]">
              {event.location ? `${event.location} · ` : ''}Online
            </span>
          )}
        </div>
        <h3 className={`font-serif text-[#1a1a1a] mb-3 group-hover:text-[#8b6914] transition-colors ${featured ? 'text-2xl' : 'text-xl'}`}>
          {event.title}
        </h3>
        {event.description && (
          <div
            className={`text-sm text-[#4a4a4a] leading-relaxed ${featured ? 'line-clamp-3' : 'line-clamp-2'}`}
            dangerouslySetInnerHTML={{ __html: event.description || '' }}
          />
        )}
      </div>

      {/* CTA */}
      {showCta && (
        <div className="md:w-36 flex items-center shrink-0">
          {featured ? (
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-[#8b6914] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#c4965a] transition-all"
            >
              {ctaLabel}
            </a>
          ) : (
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] border-b border-[#1a1a1a] pb-1 hover:text-[#8b6914] hover:border-[#8b6914] transition-all"
            >
              {ctaLabel}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function ProgramCard({ program, featured = false }) {
  const containerClass = featured
    ? 'p-10 border-l-4 border-l-[#8b6914] border border-[#d8d5ce] bg-[#faf9f6] hover:border-[#8b6914] transition-all'
    : 'p-8 border border-[#d8d5ce] bg-white hover:border-[#8b6914] transition-all';

  return (
    <div className={containerClass}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4">
        {program.level && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8b6914]">
            {program.level}
          </span>
        )}
        {program.level && program.format && (
          <span className="text-[#d8d5ce]">·</span>
        )}
        {program.format && (
          <span className="text-[10px] uppercase text-[#767676]">{program.format}</span>
        )}
      </div>
      <h3 className={`font-serif text-[#1a1a1a] mb-3 ${featured ? 'text-2xl' : 'text-xl'}`}>
        {program.title}
      </h3>
      {program.description && (
        <div
          className={`text-sm text-[#4a4a4a] leading-relaxed ${featured ? 'line-clamp-4' : 'line-clamp-3'}`}
          dangerouslySetInnerHTML={{ __html: program.description || '' }}
        />
      )}
    </div>
  );
}
function ArticleRow({ article }) {
  const date = article.dateCreated
    ? new Date(article.dateCreated).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;

  const authorName = article.author?.fullName || null;
  const categoryName = article.category?.name || null;
  const readingTime = calculateReadingTime(article.content);
  const featuredImage = article.featuredImage;

  const href = article.slug ? `/publications/${article.slug}` : null;
  const Wrapper = href ? 'a' : 'div';
  const wrapperProps = href
    ? { href, className: 'group block py-10 first:pt-0 last:pb-0' }
    : { className: 'py-10 first:pt-0 last:pb-0' };

  return (
    <Wrapper {...wrapperProps}>
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Date + Metadata */}
        <div className="md:w-32 shrink-0 space-y-3">
          {date && (
            <span className="block text-[10px] uppercase font-bold tracking-widest text-[#767676]">
              {date}
            </span>
          )}
          {readingTime > 0 && (
            <span className="block text-[10px] font-bold text-[#8b6914] uppercase tracking-widest">
              {readingTime} min
            </span>
          )}
        </div>

        {/* Thumbnail (Task 5) */}
        {featuredImage && (
          <div className="hidden sm:block md:w-32 lg:w-40 shrink-0">
            <img
              src={`${DIRECTUS_URL}/assets/${featuredImage}?width=200&height=120&fit=cover`}
              alt=""
              className="w-full aspect-[5/3] object-cover grayscale group-hover:grayscale-0 transition-all duration-500 border border-[#d8d5ce]"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
            {authorName && (
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8b6914]">
                {authorName}
              </span>
            )}
            {authorName && categoryName && (
              <span className="text-[#d8d5ce] text-[10px]">·</span>
            )}
            {categoryName && (
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#767676]">
                {categoryName}
              </span>
            )}
          </div>
          <h3 className={`text-xl lg:text-2xl font-serif text-[#1a1a1a] mb-3 leading-snug ${href ? 'group-hover:text-[#8b6914] transition-colors' : ''}`}>
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-sm text-[#4a4a4a] leading-relaxed line-clamp-3">
              {article.excerpt}
            </p>
          )}
        </div>

        {/* Read indicator */}
        {href && (
          <div className="md:w-24 flex items-center shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] border-b border-[#1a1a1a] pb-1 group-hover:text-[#8b6914] group-hover:border-[#8b6914] transition-all">
              Lire
            </span>
          </div>
        )}
      </div>
    </Wrapper>
  );
}

function LockedSection({
  label,
  message,
  isAuthenticated = false,
  communityId,
  membershipStatus = null,
  teaserCount = 0,
  teaserLabel = '',
}) {
  // Request state: 'idle' | 'loading' | 'success' | 'error'
  const [requestStatus, setRequestStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState(null);

  // A pending row from the server takes precedence over local request state.
  const isPending = membershipStatus === 'pending' || requestStatus === 'success';

  const handleRequest = async () => {
    if (!communityId || requestStatus === 'loading' || isPending) return;
    setRequestStatus('loading');
    setErrorMsg(null);
    try {
      await requestMembership(communityId);
      setRequestStatus('success');
    } catch (err) {
      console.error('[LockedSection] requestMembership failed:', err);
      setErrorMsg(err?.message || 'Une erreur est survenue.');
      setRequestStatus('error');
    }
  };

  const buttonClass =
    'inline-block px-8 py-3 bg-[#8b6914] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#c4965a] transition-all disabled:opacity-60 disabled:cursor-not-allowed';

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="border border-[#d8d5ce] bg-[#faf9f6] p-10 lg:p-14 text-center">
      <span
        className={`inline-block px-3 py-1 mb-6 text-[10px] font-bold uppercase tracking-widest border ${
          isPending
            ? 'border-[#767676] text-[#767676]'
            : 'border-[#8b6914] text-[#8b6914]'
        }`}
      >
        {isPending ? 'En attente' : 'Membres'}
      </span>

      <h3 className="text-2xl font-serif text-[#1a1a1a] mb-4">{label}</h3>
      <p className="text-sm text-[#4a4a4a] leading-relaxed max-w-xl mx-auto mb-8">
        {message}
      </p>

      {/* Teaser — gives a sense of what's behind the gate */}
      {teaserCount > 0 && (
        <div className="mb-8 inline-flex items-center gap-3 px-5 py-3 border border-[#d8d5ce] bg-white">
          <span className="text-2xl font-serif text-[#1a1a1a]">{teaserCount}</span>
          <span className="text-[10px] uppercase tracking-widest text-[#767676]">
            {teaserLabel}
          </span>
        </div>
      )}

      {/* CTA branches */}
      {!isAuthenticated && (
        <div>
          <a href="/login" className={buttonClass}>
            Se connecter pour accéder
          </a>
          <p className="mt-4 text-xs text-[#767676]">
            Pas encore de compte ?{' '}
            <a href="/contact" className="underline hover:text-[#8b6914] transition-colors">
              Demandez un accès
            </a>
          </p>
        </div>
      )}

      {isAuthenticated && isPending && (
        <p className="text-sm text-[#1a1a1a] font-serif max-w-md mx-auto">
          Votre demande d'adhésion est en cours d'examen par un administrateur.
          Vous recevrez une notification dès validation.
        </p>
      )}

      {isAuthenticated && !isPending && (
        <>
          <button
            type="button"
            onClick={handleRequest}
            disabled={requestStatus === 'loading'}
            className={buttonClass}
          >
            {requestStatus === 'loading' ? 'Envoi en cours…' : 'Rejoindre ce cercle'}
          </button>
          {requestStatus === 'error' && errorMsg && (
            <p className="mt-4 text-sm text-[#8b6914]">{errorMsg}</p>
          )}
        </>
      )}
    </div>
  );
}

function StatusBadge({ accessType, isMember, membershipStatus, membershipLoading }) {
  // While the membership check is in flight on a restricted community, render
  // a placeholder badge so the hero doesn't visually flicker.
  if (membershipLoading && accessType === 'members') {
    return (
      <span className="self-start mt-1 inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-[#d8d5ce] text-[#767676]">
        Vérification…
      </span>
    );
  }

  let label;
  let classes;

  if (isMember) {
    label = 'Membre';
    classes = 'border-[#1a1a1a] bg-[#1a1a1a] text-white';
  } else if (membershipStatus === 'pending') {
    label = 'En attente';
    classes = 'border-[#767676] text-[#767676]';
  } else if (accessType === 'members') {
    label = 'Accès restreint';
    classes = 'border-[#8b6914] text-[#8b6914]';
  } else {
    label = 'Accès libre';
    classes = 'border-[#d8d5ce] text-[#4a4a4a]';
  }

  return (
    <span
      className={`self-start mt-1 inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest border ${classes}`}
    >
      {label}
    </span>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateRange(startDate, endDate) {
  if (!startDate) return null;
  const opts = { day: 'numeric', month: 'long', year: 'numeric' };
  const locale = 'fr-FR';
  const start = new Date(startDate).toLocaleDateString(locale, opts);
  if (!endDate) return start;
  const end = new Date(endDate).toLocaleDateString(locale, opts);
  return start === end ? start : `${start} – ${end}`;
}

// ─── State components ─────────────────────────────────────────────────────────

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
        Cet espace n'a pas pu être chargé
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
        Espace introuvable
      </p>
      <h1
        className="text-3xl font-semibold text-[#1a1a1a] mb-6"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        Cet espace communautaire n'existe pas
      </h1>
      <p className="text-[#4a4a4a] leading-relaxed max-w-md">
        L'espace que vous recherchez n'est pas disponible ou n'a pas encore été publié.
      </p>
    </div>
  );
}
