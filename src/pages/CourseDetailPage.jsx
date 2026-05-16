import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import RelatedResourcesBox from '../components/academy/RelatedResourcesBox';
import ProgressBar from '../components/ui/ProgressBar';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://admin.projetceedo20.org';

const STATUS_LABEL = {
  active:    'En cours',
  completed: 'Terminé',
};

function LessonList({ course, progress, isEnrolled }) {
  const completedIds = new Set(
    (progress?.modules || []).flatMap(m => m.lessons.filter(l => l.completed).map(l => l.id))
  );

  let firstIncompleteId = null;

  if (isEnrolled) {
    for (const mod of (course.modules || [])) {
      for (const lesson of (mod.lessons || [])) {
        if (!completedIds.has(lesson.id)) {
          firstIncompleteId = lesson.id;
          break;
        }
      }
      if (firstIncompleteId) break;
    }
  }

  return (
    <div className="space-y-6">
      {course.modules?.map((module, i) => (
        <div key={module.id} className="border border-[#d8d5ce] bg-white overflow-hidden">
          <div className="p-8 border-b border-[#faf9f6] bg-[#faf9f6]/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[8px] uppercase font-bold text-[#8b6914]">Module 0{i + 1}</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-[#1a1a1a]">{module.title}</h3>
          </div>
          <div className="p-2">
            <div className="space-y-1">
              {module.lessons?.map(lesson => {
                const isCompleted = completedIds.has(lesson.id);
                const isCurrent = lesson.id === firstIncompleteId;
                const isFreePreview = lesson.is_free_preview === true;
                const isProtected = !isFreePreview && !isEnrolled;

                return (
                  <Link
                    key={lesson.id}
                    to={`/courses/${course.slug}/${lesson.slug}`}
                    className={`flex items-center justify-between p-4 transition-colors group ${
                      isCurrent ? 'bg-[#faf9f6] border-l-2 border-[#8b6914]' : 'hover:bg-[#faf9f6]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] shrink-0 border transition-colors ${
                        isCompleted
                          ? 'bg-[#8b6914] border-[#8b6914] text-white'
                          : isCurrent
                            ? 'border-[#8b6914] text-[#8b6914]'
                            : 'border-[#d8d5ce] text-[#767676] group-hover:border-[#8b6914] group-hover:text-[#8b6914]'
                      }`}>
                        {isCompleted ? '✔' : isProtected ? '🔒' : '○'}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-serif ${
                          isCompleted ? 'text-[#767676]' : isCurrent ? 'text-[#1a1a1a] font-semibold' : 'text-[#1a1a1a] group-hover:text-[#8b6914]'
                        }`}>
                          {lesson.title}
                        </span>
                        {isFreePreview && (
                          <span className="text-[9px] uppercase tracking-widest text-[#8b6914] font-bold mt-1">
                            Aperçu gratuit
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-[9px] uppercase font-bold tracking-widest transition-opacity ${
                      isCurrent
                        ? 'text-[#8b6914] opacity-100'
                        : 'text-[#767676] opacity-0 group-hover:opacity-100'
                    }`}>
                      {isCurrent ? 'Continuer' : isCompleted ? '' : 'Commencer'}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CourseDetailPage() {
  const { slug } = useParams();
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessStatus, setAccessStatus] = useState('none');
  const [paymentMsg, setPaymentMsg] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'success') {
      setPaymentMsg({ type: 'success', text: 'Paiement confirmé. Votre accès est activé.' });
    } else if (payment === 'cancelled') {
      setPaymentMsg({ type: 'error', text: 'Paiement annulé. Aucun accès n’a été activé.' });
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getCourseBySlug(slug);
        if (!data) setError('Formation introuvable');
        else setCourse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!course || !isAuthenticated || authLoading) return;
    async function loadProgress() {
      try {
        setProgressLoading(true);
        
        if (course.is_paid) {
          const accessInfo = await api.getCourseAccessStatus(course.id);
          setHasAccess(accessInfo.status === 'active');
          setAccessStatus(accessInfo.status);
          if (accessInfo.status !== 'active') {
            setProgressLoading(false);
            return;
          }
        } else {
          setHasAccess(true);
        }

        const data = await api.getCourseProgress(course.id, course);
        setProgress(data);
      } catch (err) {
        console.error('Progress load error:', err);
      } finally {
        setProgressLoading(false);
      }
    }
    loadProgress();
  }, [course, isAuthenticated, authLoading]);

  async function handleEnroll() {
    setEnrolling(true);
    setEnrollError(null);
    try {
      if (!user?.id) {
        throw new Error("Vous devez être connecté pour vous inscrire.");
      }
      await api.enrollInCourse(course.id, user.id);
      const data = await api.getCourseProgress(course.id, course);
      setProgress(data);
    } catch (err) {
      setEnrollError(err.message || "Erreur lors de l'inscription.");
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-32">
      <div className="w-12 h-12 border-4 border-[#8b6914]/20 border-t-[#8b6914] rounded-full animate-spin mb-4" />
      <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#767676]">Initialisation du parcours...</p>
    </div>
  );

  if (error || !course) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-serif text-[#1a1a1a] mb-6">{error || "Formation introuvable"}</h1>
      <Link to="/courses" className="px-6 py-3 bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-widest">
        Retour au catalogue
      </Link>
    </div>
  );

  const coverUrl = course.cover_image ? `${DIRECTUS_URL}/assets/${course.cover_image}` : null;

  return (
    <main className="bg-white min-h-screen">
      {/* Course Hero */}
      <header className="bg-[#1a1a1a] text-white py-24 lg:py-32 relative overflow-hidden">
        {coverUrl && (
          <img src={coverUrl} alt={course.title} className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale" />
        )}
        <div className="max-w-6xl mx-auto px-6 relative z-10">
           <div className="max-w-3xl">
             <div className="flex items-center gap-4 mb-8">
               <span className="px-3 py-1 bg-[#8b6914] text-[10px] uppercase font-bold tracking-widest text-white">
                 {course.level}
               </span>
               <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">
                 {course.duration}
               </span>
             </div>
             <h1 className="text-4xl lg:text-6xl font-serif font-bold leading-tight mb-8">
               {course.title}
             </h1>
             <p className="text-xl font-serif italic text-white/80 leading-relaxed mb-10 border-l-2 border-[#8b6914] pl-8">
               {course.subtitle}
             </p>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold border border-white/20">
                  {course.instructor?.first_name?.[0]}{course.instructor?.last_name?.[0]}
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold tracking-widest">Instructeur</span>
                  <span className="text-sm font-serif italic">{course.instructor?.first_name} {course.instructor?.last_name}</span>
                </div>
             </div>
           </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          <div className="lg:col-span-8">
            {/* Description */}
            <section className="mb-24">
               <h2 className="text-[10px] uppercase font-bold tracking-[0.4em] text-[#8b6914] mb-8 border-b border-[#faf9f6] pb-4">Présentation du cours</h2>
               <div className="prose prose-serif prose-lg text-[#1a1a1a] leading-relaxed max-w-none">
                 <div dangerouslySetInnerHTML={{ __html: course.description }} />
               </div>
            </section>

            {/* Objectives */}
            {course.learning_objectives && (
              <section className="mb-24 bg-[#faf9f6] p-10 lg:p-14 border border-[#d8d5ce]">
                <h2 className="text-[10px] uppercase font-bold tracking-[0.4em] text-[#8b6914] mb-10">Objectifs d'apprentissage</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {Array.isArray(course.learning_objectives) ? course.learning_objectives.map((obj, i) => (
                    <div key={i} className="flex gap-4">
                       <span className="text-[#8b6914] font-bold">0{i+1}</span>
                       <p className="text-sm font-serif italic text-[#4a4a4a]">{obj}</p>
                    </div>
                  )) : (
                    <p className="text-sm font-serif italic text-[#4a4a4a]">{course.learning_objectives}</p>
                  )}
                </div>
              </section>
            )}

            {/* Syllabus / Modules */}
            <section className="mb-24">
              <h2 className="text-[10px] uppercase font-bold tracking-[0.4em] text-[#8b6914] mb-12 border-b border-[#faf9f6] pb-4 flex items-center justify-between">
                Programme d'études
                <span className="text-[#767676]">{course.modules?.length || 0} Modules</span>
              </h2>
              <LessonList
                course={course}
                progress={progress}
                isEnrolled={!!progress?.enrollment}
              />
            </section>
          </div>

          <aside className="lg:col-span-4">
             <div className="sticky top-24 space-y-12">
                <div className="bg-[#1a1a1a] text-white p-10">
                   <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#8b6914] mb-6 text-center">Accès au parcours</h3>

                   {(authLoading || progressLoading) ? (
                     <div className="flex justify-center py-4">
                       <div className="w-6 h-6 border-2 border-[#8b6914]/30 border-t-[#8b6914] rounded-full animate-spin" />
                     </div>
                   ) : course.is_paid && !hasAccess ? (
                     <div className="text-center">
                       <p className="text-sm font-serif italic text-white/70 mb-6 leading-relaxed">
                         Ce cours est premium. Vous devez demander un accès pour suivre ce programme.
                       </p>
                       <div className="text-2xl font-bold text-[#8b6914] tracking-wider mb-8">
                         {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: course.currency || 'EUR' }).format(course.price || 0)}
                       </div>
                       {!isAuthenticated ? (
                         <Link
                           to="/login"
                           className="block w-full py-4 bg-[#8b6914] text-white text-[10px] font-bold uppercase tracking-widest text-center hover:bg-white hover:text-[#1a1a1a] transition-all"
                         >
                           Se connecter
                         </Link>
                       ) : accessStatus === 'pending' ? (
                         <div className="bg-[#8b6914]/20 border border-[#8b6914] p-4 text-[#8b6914] text-[10px] uppercase tracking-[0.2em] font-bold mt-4">
                           Demande en attente de validation
                         </div>
                       ) : (
                         <div className="flex flex-col gap-3">
                           {paymentMsg && (
                             <div className={`p-3 text-[10px] uppercase font-bold tracking-widest border ${paymentMsg.type === 'success' ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-red-900/30 text-red-400 border-red-500/30'}`}>
                               {paymentMsg.text}
                             </div>
                           )}
                           <button
                             onClick={async () => {
                               try {
                                 setCheckingOut(true);
                                 const res = await api.createStripeCheckoutSession(course.id);
                                 window.location.href = res.url;
                               } catch (err) {
                                 alert(err.message);
                                 setCheckingOut(false);
                               }
                             }}
                             disabled={checkingOut}
                             className="w-full py-4 bg-[#8b6914] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-[#1a1a1a] transition-all disabled:opacity-50"
                           >
                             {checkingOut ? 'Redirection...' : 'Payer et accéder'}
                           </button>
                           <button
                             onClick={async () => {
                               try {
                                 if (!user?.id) {
                                   throw new Error("Vous devez être connecté.");
                                 }
                                 await api.requestCourseAccess(course.id, user.id);
                                 setAccessStatus('pending');
                               } catch (err) {
                                 alert(err.message);
                               }
                             }}
                             className="w-full py-3 bg-transparent border border-white/20 text-white/70 text-[9px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                           >
                             Demander accès manuel
                           </button>
                         </div>
                       )}
                     </div>
                   ) : !isAuthenticated ? (
                     <div className="text-center">
                       <p className="text-sm font-serif italic text-white/70 mb-8 leading-relaxed">
                         Ce parcours est accessible gratuitement aux membres du Projet Ceedo.
                       </p>
                       <Link
                         to="/login"
                         className="block w-full py-4 bg-[#8b6914] text-white text-[10px] font-bold uppercase tracking-widest text-center hover:bg-white hover:text-[#1a1a1a] transition-all"
                       >
                         Se connecter pour s'inscrire
                       </Link>
                     </div>
                   ) : progress?.enrollment ? (() => {
                     // Derive the visual status from actual progress, not from
                     // the persisted enrollment.status. Persistence stays as-is;
                     // this only affects the label shown to the user.
                     const isCompleted =
                       progress &&
                       progress.totalLessons > 0 &&
                       progress.completedLessons >= progress.totalLessons;
                     const displayStatus = isCompleted ? 'Terminé' : 'En cours';
                     return (
                     <div className="flex flex-col gap-5">
                       <div className="flex items-center justify-between">
                         <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">Statut</span>
                         <span className="text-[10px] uppercase tracking-[0.2em] text-[#8b6914]">
                           {displayStatus}
                         </span>
                       </div>
                       <div className="flex flex-col gap-2">
                         <div className="flex items-center justify-between">
                           <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">Progression</span>
                           <span className="text-[10px] text-white/60">{progress.progressPercentage} %</span>
                         </div>
                         <ProgressBar percentage={progress.progressPercentage} />
                       </div>
                       <div className="text-[10px] text-white/40 text-center">
                         {progress.completedLessons} / {progress.totalLessons} leçons complétées
                       </div>
                     </div>
                     );
                   })() : (
                     <div className="text-center">
                       <p className="text-sm font-serif italic text-white/70 mb-8 leading-relaxed">
                         Ce parcours est accessible gratuitement aux membres du Projet Ceedo.
                       </p>
                       {enrollError && (
                         <p className="text-[11px] text-[#8b6914] mb-4">{enrollError}</p>
                       )}
                       <button
                         onClick={handleEnroll}
                         disabled={enrolling}
                         className="w-full py-4 bg-[#8b6914] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-[#1a1a1a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         {enrolling ? 'Inscription...' : "S'inscrire au cours"}
                       </button>
                     </div>
                   )}
                </div>

                <RelatedResourcesBox 
                  resources={{
                    dossiers: course.related_dossier ? [course.related_dossier] : [],
                    publications: course.related_publications || []
                  }} 
                />
             </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
