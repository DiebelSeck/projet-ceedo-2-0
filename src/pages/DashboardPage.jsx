import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import SectionHeader from '../components/ui/SectionHeader';
import CourseProgressCard from '../components/academy/CourseProgressCard';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function DashboardPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Mon tableau de bord — Projet Ceedo 2.0';
    window.scrollTo(0, 0);
    return () => { document.title = 'Projet Ceedo 2.0'; };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadData() {
      try {
        setLoading(true);
        const [enrollData, certData] = await Promise.all([
          api.getUserEnrollments(),
          api.getUserCertificates(),
        ]);
        setEnrollments(enrollData ?? []);
        setCertificates(certData ?? []);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <main className="bg-white min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#8b6914]/20 border-t-[#8b6914] rounded-full animate-spin" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#767676]">Chargement...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="bg-white min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm text-center flex flex-col gap-6">
          <p
            className="text-xl text-[#1a1a1a]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Accès réservé aux membres
          </p>
          <p className="text-sm text-[#767676]">
            Connectez-vous pour accéder à votre tableau de bord.
          </p>
          <Link
            to="/login"
            className="self-center text-[11px] uppercase tracking-[0.3em] text-[#8b6914] border-b border-[#8b6914]/40 pb-0.5 hover:border-[#8b6914]"
          >
            Se connecter
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-[#faf9f6] py-20 md:py-28 border-b border-[#d8d5ce]/30">
        <div className="max-w-5xl mx-auto px-6">
          <SectionHeader
            eyebrow="Espace personnel"
            title="Mon tableau de bord"
            subtitle="Suivez votre progression et retrouvez vos certifications."
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col gap-20">

        {/* Enrollments */}
        <section>
          <h2
            className="text-lg text-[#1a1a1a] mb-8 pb-4 border-b border-[#d8d5ce]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Mes formations
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-44 bg-[#faf9f6] border border-[#e8e6e1]" />
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-[#e8e6e1]">
              <p className="text-[#767676] italic font-serif text-sm">
                Aucune formation en cours.
              </p>
              <Link
                to="/courses"
                className="mt-4 inline-block text-[11px] uppercase tracking-[0.3em] text-[#8b6914] border-b border-[#8b6914]/40 pb-0.5 hover:border-[#8b6914]"
              >
                Explorer le catalogue
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map(enrollment => (
                <CourseProgressCard key={enrollment.id} enrollment={enrollment} />
              ))}
            </div>
          )}
        </section>

        {/* Certificates */}
        <section>
          <h2
            className="text-lg text-[#1a1a1a] mb-8 pb-4 border-b border-[#d8d5ce]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Mes certifications
          </h2>

          {loading ? (
            <div className="flex flex-col gap-3 animate-pulse">
              {[1, 2].map(i => (
                <div key={i} className="h-16 bg-[#faf9f6] border border-[#e8e6e1]" />
              ))}
            </div>
          ) : certificates.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-[#e8e6e1]">
              <p className="text-[#767676] italic font-serif text-sm">
                Aucune certification obtenue pour le moment.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {certificates.map(cert => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between gap-4 border border-[#d8d5ce] px-6 py-4 bg-[#faf9f6]"
                >
                  <div className="flex flex-col gap-0.5">
                    <span
                      className="text-sm text-[#1a1a1a] font-medium"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {cert.course_id?.title ?? '—'}
                    </span>
                    <span className="text-[11px] text-[#767676] uppercase tracking-[0.2em]">
                      Délivré le {formatDate(cert.issued_at)}
                    </span>
                  </div>
                  <Link
                    to={`/certificates/${cert.id}`}
                    className="shrink-0 text-[11px] uppercase tracking-[0.3em] text-[#8b6914] border-b border-[#8b6914]/40 pb-0.5 hover:border-[#8b6914]"
                  >
                    Voir certificat
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
