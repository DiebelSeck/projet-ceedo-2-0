import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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

export default function AdminProgressPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    document.title = 'Suivi de Progression — Admin LMS';
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await api.getAdminProgressOverview();
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('AdminProgress load failed:', err);
        if (!cancelled) setError(err?.message || 'Erreur de chargement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const availableStatuses = useMemo(() => {
    const set = new Set();
    for (const r of rows) if (r?.status) set.add(r.status);
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!q) return true;
      const u = r.user_id || {};
      const name = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
      const email = (u.email || '').toLowerCase();
      const course = (r.course_id?.title || '').toLowerCase();
      return name.includes(q) || email.includes(q) || course.includes(q);
    });
  }, [rows, search, statusFilter]);

  return (
    <main className="bg-[#faf9f6] min-h-screen">
      <div className="bg-white py-20 border-b border-[#d8d5ce]/30">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            eyebrow="Administration LMS"
            title="Suivi de Progression"
            subtitle="Vue d'ensemble des inscriptions et de l'avancement par étudiant. Lecture seule."
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
          <Link to="/admin" className="text-[10px] uppercase tracking-widest font-bold text-[#4a4a4a] hover:text-[#8b6914]">
            ← Retour au Dashboard
          </Link>
          <a
            href={`${DIRECTUS_URL}/admin/content/course_enrollments`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#1a1a1a] text-white text-[10px] uppercase font-bold tracking-widest hover:bg-[#8b6914] transition-colors"
          >
            Gérer dans Directus
          </a>
        </div>

        <div className="mb-6 flex gap-4 flex-wrap items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email ou formation…"
            className="w-full md:w-96 px-4 py-3 border border-[#d8d5ce] bg-white text-sm focus:outline-none focus:border-[#8b6914]"
          />
          {availableStatuses.length > 0 && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-[#d8d5ce] bg-white text-sm focus:outline-none focus:border-[#8b6914]"
            >
              <option value="all">Tous statuts</option>
              {availableStatuses.map(s => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]?.label || s}
                </option>
              ))}
            </select>
          )}
          <span className="text-[10px] uppercase tracking-widest text-[#767676] font-bold">
            {filtered.length} / {rows.length} inscriptions
          </span>
        </div>

        <div className="bg-white border border-[#d8d5ce] overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-[#8b6914]/20 border-t-[#8b6914] rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-700 font-serif italic">
              Erreur : {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-[#767676] font-serif italic">
              {rows.length === 0 ? 'Aucune inscription enregistrée.' : 'Aucun résultat pour ce filtre.'}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#d8d5ce] bg-[#faf9f6]">
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Étudiant</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Formation</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Progression</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Statut</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Démarrée</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Terminée</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Durée</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const u = r.user_id || {};
                  const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Utilisateur inconnu';
                  const pct = Number.isFinite(r.progress_percentage) ? r.progress_percentage : 0;
                  const meta = STATUS_LABEL[r.status] || { label: r.status || '—', className: 'bg-gray-100 text-gray-700 border-gray-200' };
                  return (
                    <tr key={r.id} className="border-b border-[#e8e6e1] hover:bg-[#faf9f6]/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-[#1a1a1a] text-sm">{fullName}</div>
                        <div className="text-[11px] text-[#767676] mt-1">{u.email || '—'}</div>
                      </td>
                      <td className="p-4 text-sm font-serif text-[#1a1a1a]">
                        {r.course_id?.title || 'Formation inconnue'}
                        {r.course_id?.is_paid ? (
                          <span className="ml-2 inline-block px-2 py-0.5 text-[9px] uppercase tracking-widest font-bold border border-[#8b6914]/30 text-[#8b6914]">Premium</span>
                        ) : null}
                      </td>
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
                      <td className="p-4 text-[11px] text-[#4a4a4a]">{formatDate(r.started_at)}</td>
                      <td className="p-4 text-[11px] text-[#4a4a4a]">{formatDate(r.completed_at)}</td>
                      <td className="p-4 text-[11px] text-[#4a4a4a]">{formatDurationDays(r.started_at, r.completed_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
