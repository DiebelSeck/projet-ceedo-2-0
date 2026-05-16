import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import RelatedResourcesBox from '../components/academy/RelatedResourcesBox';
import LessonNavigation from '../components/academy/LessonNavigation';
import ProtectedLessonPanel from '../components/academy/ProtectedLessonPanel';
import PremiumAccessPanel from '../components/academy/PremiumAccessPanel';

export default function LessonDetailPage() {
  const { courseSlug, lessonSlug } = useParams();
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [completedIds, setCompletedIds] = useState(new Set());
  const [completing, setCompleting] = useState(false);
  const [markError, setMarkError] = useState(null);

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessStatus, setAccessStatus] = useState('none');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getLessonBySlug(courseSlug, lessonSlug);
        if (!data) setError('Leçon introuvable');
        else setLesson(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    window.scrollTo(0, 0);
  }, [courseSlug, lessonSlug]);

  useEffect(() => {
    if (!lesson || !isAuthenticated || authLoading) return;
    loadProgress();
  }, [lesson, isAuthenticated, authLoading]);

  async function loadProgress() {
    try {
      if (lesson.course?.is_paid) {
        const accessInfo = await api.getCourseAccessStatus(lesson.course.id);
        setHasAccess(accessInfo.status === 'active');
        setAccessStatus(accessInfo.status);
        if (accessInfo.status !== 'active') return;
      } else {
        setHasAccess(true);
      }

      const data = await api.getCourseProgress(lesson.course.id, lesson.course);
      setIsEnrolled(!!data?.enrollment);
      const ids = new Set((data?.modules || []).flatMap(m => m.lessons.filter(l => l.completed).map(l => l.id)));
      setCompletedIds(ids);
    } catch (err) {
      console.error('Progress load error:', err);
    }
  }

  async function handleEnroll() {
    setEnrolling(true);
    setEnrollError(null);
    try {
      if (!user?.id) {
        throw new Error("Vous devez être connecté pour vous inscrire.");
      }
      await api.enrollInCourse(lesson.course.id, user.id);
      await loadProgress();
    } catch (err) {
      setEnrollError(err.message || "Erreur lors de l'inscription.");
    } finally {
      setEnrolling(false);
    }
  }

  async function handleMarkComplete() {
    setCompleting(true);
    setMarkError(null);
    try {
      if (!user?.id) {
        throw new Error("Vous devez être connecté.");
      }
      await api.markLessonComplete(lesson.id, user.id);
      await loadProgress();
    } catch (err) {
      setMarkError(err.message || 'Une erreur est survenue.');
    } finally {
      setCompleting(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-32">
      <div className="w-12 h-12 border-4 border-[#8b6914]/20 border-t-[#8b6914] rounded-full animate-spin mb-4" />
      <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#767676]">Chargement de la leçon...</p>
    </div>
  );

  if (error || !lesson) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-serif text-[#1a1a1a] mb-6">{error || 'Leçon introuvable'}</h1>
      <Link to={`/courses/${courseSlug}`} className="px-6 py-3 bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-widest">
        Retour au cours
      </Link>
    </div>
  );

  const allLessons = lesson.course?.modules?.flatMap(m => m.lessons) || [];
  const currentIndex = allLessons.findIndex(l => l.slug === lessonSlug);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const isCompleted = completedIds.has(lesson.id);

  const isFreePreview = lesson.is_free_preview === true;
  const canAccessContent = isFreePreview || (isAuthenticated && hasAccess && isEnrolled);

  return (
    <main className="bg-white min-h-screen">
      {/* Lesson Header */}
      <div className="bg-[#faf9f6] border-b border-[#d8d5ce]/30 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex items-center gap-2 text-[9px] uppercase font-bold tracking-[0.3em] text-[#767676] mb-8">
            <Link to="/courses" className="hover:text-[#8b6914] transition-colors">Académie</Link>
            <span>/</span>
            <Link to={`/courses/${courseSlug}`} className="hover:text-[#8b6914] transition-colors truncate max-w-[150px]">
              {lesson.course?.title}
            </Link>
            <span>/</span>
            <span className="text-[#1a1a1a]">{lesson.title}</span>
          </nav>

          <div className="flex items-start justify-between gap-6 flex-wrap">
            <h1 className="text-3xl lg:text-5xl font-serif font-bold text-[#1a1a1a] leading-tight">
              {lesson.title}
            </h1>
            {isCompleted && (
              <span className="shrink-0 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#8b6914] font-bold border border-[#8b6914] px-3 py-1.5">
                ✔ Complété
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

          <div className="lg:col-span-8">
            {/* Media */}
            {canAccessContent && (lesson.video_url || lesson.audio_url) && (
              <div className="aspect-video bg-[#1a1a1a] mb-16 flex items-center justify-center text-white p-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full border-2 border-[#8b6914] flex items-center justify-center text-[#8b6914] mb-4 mx-auto cursor-pointer hover:bg-[#8b6914] hover:text-white transition-all">
                    ▶
                  </div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-white/50">
                    {lesson.video_url ? 'Conférence Vidéo' : 'Support Audio'}
                  </p>
                </div>
              </div>
            )}

            {/* Content */}
            {canAccessContent ? (
              <article className="prose prose-serif prose-lg text-[#1a1a1a] leading-relaxed max-w-none mb-16">
                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
              </article>
            ) : lesson.course?.is_paid && !hasAccess && isAuthenticated ? (
              <PremiumAccessPanel 
                course={lesson.course}
                accessStatus={accessStatus}
                setAccessStatus={setAccessStatus}
                isPaid={true}
              />
            ) : (
              <ProtectedLessonPanel 
                type={!isAuthenticated ? 'login' : 'enroll'}
                course={lesson.course}
                onEnroll={handleEnroll}
                enrolling={enrolling}
                error={enrollError}
              />
            )}

            {/* Completion */}
            {canAccessContent && (
              <div className="mb-4 flex flex-col items-start gap-3 py-10 border-t border-[#d8d5ce]/30">
                {isAuthenticated && isEnrolled ? (
                  isCompleted ? (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#8b6914] flex items-center justify-center text-white text-[11px]">✔</div>
                      <span className="text-[11px] uppercase tracking-[0.3em] text-[#8b6914] font-bold">Leçon complétée</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handleMarkComplete}
                        disabled={completing}
                        className="px-6 py-3 bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#8b6914] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {completing ? 'Enregistrement...' : 'Marquer comme complété'}
                      </button>
                      {markError && (
                        <p className="text-[11px] text-[#8b6914] border-l-2 border-[#8b6914] pl-3">{markError}</p>
                      )}
                    </>
                  )
                ) : (
                  <div className="bg-[#faf9f6] p-6 border border-[#d8d5ce] w-full text-center">
                    <p className="text-sm font-serif italic text-[#4a4a4a] mb-4">
                      {isFreePreview && !isAuthenticated 
                        ? "Connectez-vous pour suivre votre progression"
                        : "Inscrivez-vous au cours pour suivre votre progression"}
                    </p>
                    {!isAuthenticated ? (
                      <Link to="/login" className="inline-block px-6 py-3 bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#8b6914] transition-all">
                        Se connecter
                      </Link>
                    ) : (
                      <button 
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="inline-block px-6 py-3 bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#8b6914] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {enrolling ? 'Inscription...' : "S'inscrire au cours"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <LessonNavigation
              courseSlug={courseSlug}
              prevLesson={prevLesson}
              nextLesson={nextLesson}
              isCompleted={isCompleted}
            />
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-12">
              <div className="bg-[#faf9f6] p-8 border border-[#d8d5ce]">
                <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] mb-6">Plan du cours</h3>
                <div className="space-y-4">
                  {lesson.course?.modules?.map(m => (
                    <div key={m.id}>
                      <h4 className="text-[9px] uppercase font-bold text-[#8b6914] mb-2">{m.title}</h4>
                      <ul className="space-y-1">
                        {m.lessons?.map(l => {
                          const done = completedIds.has(l.id);
                          const active = l.slug === lessonSlug;
                          return (
                            <li key={l.id}>
                              <Link
                                to={`/courses/${courseSlug}/${l.slug}`}
                                className={`flex items-center gap-2 text-xs font-serif p-2 transition-colors ${
                                  active ? 'bg-[#8b6914] text-white' : 'text-[#4a4a4a] hover:bg-[#e8e6e1]'
                                }`}
                              >
                                <span className={`shrink-0 w-4 h-4 rounded-full border flex items-center justify-center text-[9px] ${
                                  done
                                    ? active ? 'border-white bg-white text-[#8b6914]' : 'border-[#8b6914] bg-[#8b6914] text-white'
                                    : active ? 'border-white/50' : 'border-[#d8d5ce]'
                                }`}>
                                  {done ? '✔' : ''}
                                </span>
                                {l.title}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <RelatedResourcesBox resources={lesson.course?.related_resources} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
