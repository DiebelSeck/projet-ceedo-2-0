import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import SectionHeader from '../components/ui/SectionHeader';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://admin.projetceedo20.org';

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: '2-digit' });
  } catch {
    return iso;
  }
}

function formatDurationDays(startIso, endIso) {
  if (!startIso || !endIso) return '—';
  const start = Date.parse(startIso);
  const end = Date.parse(endIso);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return '—';
  const days = Math.round((end - start) / (24 * 60 * 60 * 1000));
  if (days === 0) return '< 1 j';
  return `${days} j`;
}

const STATUS_LABEL = {
  active: { label: 'En cours', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  completed: { label: 'Complétée', className: 'bg-green-50 text-green-700 border-green-200' },
  paused: { label: 'En pause', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  cancelled: { label: 'Annulée', className: 'bg-gray-100 text-gray-700 border-gray-200' },
};

function StatTile({ label, value }) {
  return (
    <div className="bg-white border border-[#d8d5ce] p-4">
      <div className="text-[10px] uppercase tracking-widest text-[#767676] font-bold mb-2">{label}</div>
      <div className="text-2xl font-serif text-[#1a1a1a]">{value}</div>
    </div>
  );
}

export default function AdminStudentDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Détail Étudiant — Admin LMS';
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await api.getAdminStudentById(id);
        if (!cancelled) setData(result);
      } catch (err) {
        console.error('AdminStudentDetail load failed:', err);
        if (!cancelled) setError(err?.message || 'Erreur de chargement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (id) load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <main className="bg-[#faf9f6] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#8b6914]/20 border-t-[#8b6914] rounded-full animate-spin" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#767676]">Chargement…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-[#faf9f6] min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <Link to="/admin/users" className="text-[10px] uppercase tracking-widest font-bold text-[#4a4a4a] hover:text-[#8b6914]">
            ← Retour aux étudiants
          </Link>
          <div className="mt-8 p-12 bg-white border border-red-200 text-center text-red-700 font-serif italic">
            Erreur : {error}
          </div>
        </div>
      </main>
    );
  }

  const user = data?.user;
  const enrollments = data?.enrollments || [];
  const certificates = data?.certificates || [];
  const derived = data?.derived || {};
  const errors = data?.errors || [];

  const fullName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Utilisateur sans nom'
    : 'Utilisateur introuvable';

  return (
    <main className="bg-[#faf9f6] min-h-screen">
      <div className="bg-white py-20 border-b border-[#d8d5ce]/30">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            eyebrow="Administration LMS"
            title={fullName}
            subtitle="Vue détaillée du parcours d'apprentissage. Lecture seule."
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
          <Link to="/admin/users" className="text-[10px] uppercase tracking-widest font-bold text-[#4a4a4a] hover:text-[#8b6914]">
            ← Retour aux étudiants
          </Link>
          {user?.id ? (
            <a
              href={`${DIRECTUS_URL}/admin/content/directus_users/${user.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#1a1a1a] text-white text-[10px] uppercase font-bold tracking-widest hover:bg-[#8b6914] transition-colors"
            >
              Ouvrir dans Directus
            </a>
          ) : null}
        </div>

        {errors.length > 0 && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 text-[12px] text-yellow-800">
            Certaines données n'ont pas pu être chargées (permissions) : {errors.map(e => e.collection).join(', ')}.
          </div>
        )}

        {/* Header card */}
        <div className="bg-white border border-[#d8d5ce] p-6 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#767676] font-bold mb-2">Nom</div>
            <div className="text-sm font-bold text-[#1a1a1a]">{fullName}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#767676] font-bold mb-2">Email</div>
            <div className="text-sm text-[#4a4a4a] break-all">{user?.email || '—'}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#767676] font-bold mb-2">Actif (30j)</div>
            <div>
              {derived.active30d ? (
                <span className="inline-block px-2 py-1 text-[9px] uppercase tracking-widest font-bold border bg-green-50 text-green-700 border-green-200">Oui</span>
              ) : (
                <span className="inline-block px-2 py-1 text-[9px] uppercase tracking-widest font-bold border bg-gray-100 text-gray-600 border-gray-200">Non</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#767676] font-bold mb-2">Dernière activité</div>
            <div className="text-sm text-[#4a4a4a]">{formatDate(derived.lastActivity)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#767676] font-bold mb-2">Membre depuis</div>
            <div className="text-sm text-[#4a4a4a]">{formatDate(derived.enrollmentDate)}</div>
          </div>
        </div>

        {/* KPI row */}
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#767676] font-bold mb-4">Métriques</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          <StatTile label="Inscriptions" value={derived.enrollmentCount ?? 0} />
          <StatTile label="Complétées" value={derived.completedCount ?? 0} />
          <StatTile label="Progression moy." value={`${derived.averageProgress ?? 0}%`} />
          <StatTile label="Durée moy." value={derived.averageCompletionDays != null ? `${derived.averageCompletionDays} j` : '—'} />
          <StatTile label="Certificats" value={derived.certificateCount ?? 0} />
        </div>

        {/* Enrollments */}
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#767676] font-bold mb-4">Inscriptions</h2>
        <div className="bg-white border border-[#d8d5ce] overflow-x-auto mb-12">
          {enrollments.length === 0 ? (
            <div className="p-8 text-center text-[#767676] font-serif italic">Aucune inscription.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#d8d5ce] bg-[#faf9f6]">
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Formation</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Démarrée</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Terminée</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Durée</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Progression</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map(e => {
                  const pct = Number.isFinite(e.progress_percentage) ? e.progress_percentage : 0;
                  const meta = STATUS_LABEL[e.status] || { label: e.status || '—', className: 'bg-gray-100 text-gray-700 border-gray-200' };
                  return (
                    <tr key={e.id} className="border-b border-[#e8e6e1] hover:bg-[#faf9f6]/50 transition-colors">
                      <td className="p-4 text-sm font-serif text-[#1a1a1a]">
                        {e.course_id?.title || 'Formation inconnue'}
                        {e.course_id?.is_paid ? (
                          <span className="ml-2 inline-block px-2 py-0.5 text-[9px] uppercase tracking-widest font-bold border border-[#8b6914]/30 text-[#8b6914]">Premium</span>
                        ) : null}
                      </td>
                      <td className="p-4 text-[11px] text-[#4a4a4a]">{formatDate(e.started_at)}</td>
                      <td className="p-4 text-[11px] text-[#4a4a4a]">{formatDate(e.completed_at)}</td>
                      <td className="p-4 text-[11px] text-[#4a4a4a]">{formatDurationDays(e.started_at, e.completed_at)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#8b6914] h-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-[#4a4a4a] w-10 text-right">{pct}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 text-[9px] uppercase tracking-widest font-bold border ${meta.className}`}>
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Certificates */}
        <div className="flex items-end justify-between mb-4 gap-4 flex-wrap">
          <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#767676] font-bold">Certificats</h2>
          {user?.id ? (
            <Link
              to={`/admin/certificates?student=${user.id}`}
              className="text-[10px] uppercase tracking-widest font-bold text-[#8b6914] hover:underline"
            >
              Voir tous les certificats →
            </Link>
          ) : null}
        </div>
        <div className="bg-white border border-[#d8d5ce] overflow-x-auto">
          {certificates.length === 0 ? (
            <div className="p-8 text-center text-[#767676] font-serif italic">Aucun certificat délivré.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#d8d5ce] bg-[#faf9f6]">
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Formation</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Code</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Délivré le</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold text-right">Lien</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map(c => (
                  <tr key={c.id} className="border-b border-[#e8e6e1] hover:bg-[#faf9f6]/50 transition-colors">
                    <td className="p-4 text-sm font-serif text-[#1a1a1a]">{c.course_id?.title || 'Formation inconnue'}</td>
                    <td className="p-4 text-[11px] font-mono text-[#4a4a4a]">{c.certificate_code || '—'}</td>
                    <td className="p-4 text-[11px] text-[#4a4a4a]">{formatDate(c.issued_at)}</td>
                    <td className="p-4 text-right">
                      {c.certificate_url ? (
                        <a
                          href={c.certificate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] uppercase tracking-widest font-bold text-[#8b6914] hover:underline"
                        >
                          Voir le certificat
                        </a>
                      ) : (
                        <span className="text-[10px] text-[#767676]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
