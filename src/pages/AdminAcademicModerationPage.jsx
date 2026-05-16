import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import SectionHeader from '../components/ui/SectionHeader';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://admin.projetceedo20.org';

const STATUS_META = {
  draft:     { label: 'Brouillon',   className: 'bg-gray-100 text-gray-700 border-gray-200' },
  review:    { label: 'En relecture',className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  approved:  { label: 'Approuvée',   className: 'bg-blue-50 text-blue-700 border-blue-200' },
  published: { label: 'Publiée',     className: 'bg-green-50 text-green-700 border-green-200' },
  archived:  { label: 'Archivée',    className: 'bg-stone-100 text-stone-600 border-stone-200' },
};

const STATUS_FILTERS = [
  { key: 'all',       label: 'Toutes' },
  { key: 'draft',     label: 'Brouillon' },
  { key: 'review',    label: 'En relecture' },
  { key: 'approved',  label: 'Approuvées' },
  { key: 'published', label: 'Publiées' },
  { key: 'archived',  label: 'Archivées' },
];

const INTEL_FILTERS = [
  { key: 'priority',   label: 'Priorité haute' },
  { key: 'watch',      label: 'À surveiller' },
  { key: 'followup',   label: 'Suivi académique' },
  { key: 'commercial', label: 'Priorité commerciale' },
];

const BADGE_META = {
  priority:   { label: 'Priorité haute',        className: 'bg-red-50 text-red-700 border-red-200' },
  medium:     { label: 'Priorité moyenne',      className: 'bg-orange-50 text-orange-700 border-orange-200' },
  watch:      { label: 'À surveiller',          className: 'bg-amber-50 text-amber-700 border-amber-200' },
  followup:   { label: 'Suivi académique',      className: 'bg-purple-50 text-purple-700 border-purple-200' },
  commercial: { label: 'Priorité commerciale',  className: 'bg-rose-50 text-rose-700 border-rose-200' },
};

function statusMeta(status) {
  return STATUS_META[status] || { label: status || '—', className: 'bg-gray-100 text-gray-700 border-gray-200' };
}

/**
 * Derive moderation intelligence from a course row using only fields
 * exposed by api.getAdminCourses().
 */
function deriveIntel(course) {
  const status = course.status;
  const enrollments = Number(course.enrollments_count) || 0;
  const certificates = Number(course.certificates_count) || 0;
  const isPaid = Boolean(course.is_paid);

  const flags = {
    priority: false,
    medium: false,
    watch: false,
    followup: false,
    commercial: false,
  };

  // High priority — review
  if (status === 'review') flags.priority = true;
  // Medium priority — draft
  if (status === 'draft') flags.medium = true;
  // Watch — published but zero enrollments
  if (status === 'published' && enrollments === 0) flags.watch = true;
  // Academic follow-up — enrolled learners but no certificates yet
  if (enrollments > 0 && certificates === 0) flags.followup = true;
  // Commercial priority — paid course still in review or draft
  if (isPaid && (status === 'review' || status === 'draft')) flags.commercial = true;

  // Numeric score for ordering (higher = more urgent)
  let score = 0;
  if (flags.priority)   score += 100;
  if (flags.commercial) score += 60;
  if (flags.medium)     score += 40;
  if (flags.followup)   score += 25;
  if (flags.watch)      score += 15;

  return { flags, score };
}

export default function AdminAcademicModerationPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [intelFilter, setIntelFilter] = useState(null);

  useEffect(() => {
    document.title = 'Centre de modération académique — Admin LMS';
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.getAdminCourses();
        setCourses(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Enrich courses with derived intel (frontend-only, no schema assumptions)
  const enriched = useMemo(
    () => courses.map(c => ({ ...c, _intel: deriveIntel(c) })),
    [courses]
  );

  const statusCounts = useMemo(() => {
    const c = { total: enriched.length, draft: 0, review: 0, approved: 0, published: 0, archived: 0 };
    for (const course of enriched) {
      if (c[course.status] !== undefined) c[course.status] += 1;
    }
    return c;
  }, [enriched]);

  const intelCounts = useMemo(() => {
    const c = { priority: 0, watch: 0, followup: 0, commercial: 0 };
    for (const course of enriched) {
      if (course._intel.flags.priority)   c.priority   += 1;
      if (course._intel.flags.watch)      c.watch      += 1;
      if (course._intel.flags.followup)   c.followup   += 1;
      if (course._intel.flags.commercial) c.commercial += 1;
    }
    return c;
  }, [enriched]);

  const visibleCourses = useMemo(() => {
    let rows = enriched;
    if (statusFilter !== 'all') {
      rows = rows.filter(c => c.status === statusFilter);
    }
    if (intelFilter) {
      rows = rows.filter(c => c._intel.flags[intelFilter]);
    }
    // Sort by intelligence score descending, then by title
    return [...rows].sort((a, b) => {
      const diff = b._intel.score - a._intel.score;
      if (diff !== 0) return diff;
      return (a.title || '').localeCompare(b.title || '');
    });
  }, [enriched, statusFilter, intelFilter]);

  const statusSummary = [
    { key: 'total',     label: 'Total',        value: statusCounts.total },
    { key: 'draft',     label: 'Brouillon',    value: statusCounts.draft },
    { key: 'review',    label: 'En relecture', value: statusCounts.review },
    { key: 'approved',  label: 'Approuvées',   value: statusCounts.approved },
    { key: 'published', label: 'Publiées',     value: statusCounts.published },
    { key: 'archived',  label: 'Archivées',    value: statusCounts.archived },
  ];

  const intelSummary = [
    { key: 'priority',   label: 'Priorité haute',       value: intelCounts.priority,   accent: 'text-red-700' },
    { key: 'watch',      label: 'À surveiller',         value: intelCounts.watch,      accent: 'text-amber-700' },
    { key: 'followup',   label: 'Suivi académique',     value: intelCounts.followup,   accent: 'text-purple-700' },
    { key: 'commercial', label: 'Priorité commerciale', value: intelCounts.commercial, accent: 'text-rose-700' },
  ];

  const topAlerts = useMemo(() => {
    return enriched
      .filter(c => c._intel.score > 0)
      .sort((a, b) => b._intel.score - a._intel.score)
      .slice(0, 5);
  }, [enriched]);

  function renderBadges(intel) {
    const order = ['priority', 'medium', 'commercial', 'followup', 'watch'];
    const badges = order.filter(k => intel.flags[k]);
    if (badges.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {badges.map(k => {
          const meta = BADGE_META[k];
          return (
            <span
              key={k}
              className={`inline-block px-2 py-0.5 text-[9px] uppercase tracking-widest font-bold border ${meta.className}`}
            >
              {meta.label}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <main className="bg-[#faf9f6] min-h-screen">
      <div className="bg-white py-20 border-b border-[#d8d5ce]/30">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            eyebrow="Administration LMS"
            title="Centre de modération académique"
            subtitle="Suivi en lecture seule des formations à différentes étapes du cycle éditorial, enrichi d'une couche de priorisation."
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <Link to="/admin" className="text-[10px] uppercase tracking-widest font-bold text-[#4a4a4a] hover:text-[#8b6914]">
            ← Retour au Dashboard
          </Link>
          <a
            href={`${DIRECTUS_URL}/admin/content/courses`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#1a1a1a] text-white text-[10px] uppercase font-bold tracking-widest hover:bg-[#8b6914] transition-colors"
          >
            Ouvrir dans Directus
          </a>
        </div>

        {/* Status summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {statusSummary.map(card => (
            <div key={card.key} className="bg-white border border-[#d8d5ce] p-5">
              <div className="text-[10px] uppercase tracking-widest text-[#767676] font-bold">{card.label}</div>
              <div className="mt-2 text-3xl font-serif font-bold text-[#1a1a1a]">{card.value}</div>
            </div>
          ))}
        </div>

        {/* Intelligence summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {intelSummary.map(card => {
            const active = intelFilter === card.key;
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setIntelFilter(active ? null : card.key)}
                className={`text-left bg-white border p-5 transition-colors ${
                  active ? 'border-[#1a1a1a] ring-2 ring-[#1a1a1a]/10' : 'border-[#d8d5ce] hover:border-[#8b6914]'
                }`}
              >
                <div className="text-[10px] uppercase tracking-widest text-[#767676] font-bold">{card.label}</div>
                <div className={`mt-2 text-3xl font-serif font-bold ${card.accent}`}>{card.value}</div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-[#767676]">
                  {active ? 'Filtre actif' : 'Cliquer pour filtrer'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Compact moderation alerts */}
        <div className="bg-white border border-[#d8d5ce] p-5 mb-10">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-[11px] uppercase tracking-widest font-bold text-[#1a1a1a]">
              Alertes de modération
            </h2>
            <span className="text-[10px] uppercase tracking-widest text-[#767676]">
              {topAlerts.length === 0 ? 'Aucune alerte' : `Top ${topAlerts.length}`}
            </span>
          </div>
          {topAlerts.length === 0 ? (
            <p className="text-[12px] text-[#767676] italic">
              Aucune formation ne déclenche d'alerte de modération pour le moment.
            </p>
          ) : (
            <ul className="divide-y divide-[#e8e6e1]">
              {topAlerts.map(c => {
                const order = ['priority', 'medium', 'commercial', 'followup', 'watch'];
                const flags = order.filter(k => c._intel.flags[k]);
                return (
                  <li key={c.id} className="py-2 flex flex-wrap items-center gap-3">
                    <span className="font-serif font-bold text-[#1a1a1a] text-sm flex-1 min-w-[200px]">
                      {c.title}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {flags.map(k => {
                        const meta = BADGE_META[k];
                        return (
                          <span
                            key={k}
                            className={`inline-block px-2 py-0.5 text-[9px] uppercase tracking-widest font-bold border ${meta.className}`}
                          >
                            {meta.label}
                          </span>
                        );
                      })}
                    </div>
                    <a
                      href={`${DIRECTUS_URL}/admin/content/courses/${c.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] uppercase tracking-widest font-bold text-[#1a1a1a] hover:underline"
                    >
                      Éditer →
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Status filter row */}
        <div className="mb-3">
          <div className="text-[10px] uppercase tracking-widest text-[#767676] font-bold mb-2">Statut</div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map(f => {
              const active = statusFilter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key)}
                  className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold border transition-colors ${
                    active
                      ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                      : 'bg-white text-[#4a4a4a] border-[#d8d5ce] hover:border-[#8b6914] hover:text-[#8b6914]'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Intelligence filter row */}
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-widest text-[#767676] font-bold mb-2">Intelligence</div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIntelFilter(null)}
              className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold border transition-colors ${
                intelFilter === null
                  ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                  : 'bg-white text-[#4a4a4a] border-[#d8d5ce] hover:border-[#8b6914] hover:text-[#8b6914]'
              }`}
            >
              Aucun
            </button>
            {INTEL_FILTERS.map(f => {
              const active = intelFilter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setIntelFilter(active ? null : f.key)}
                  className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold border transition-colors ${
                    active
                      ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                      : 'bg-white text-[#4a4a4a] border-[#d8d5ce] hover:border-[#8b6914] hover:text-[#8b6914]'
                  }`}
                >
                  {f.label} ({intelCounts[f.key]})
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#d8d5ce] overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-[#8b6914]/20 border-t-[#8b6914] rounded-full animate-spin" />
            </div>
          ) : visibleCourses.length === 0 ? (
            <div className="p-12 text-center text-[12px] text-[#767676]">
              Aucune formation ne correspond aux filtres sélectionnés.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#d8d5ce] bg-[#faf9f6]">
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Formation</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Statut</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Modèle</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold text-center">Inscrits</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold text-center">Certificats</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold text-right">Liens</th>
                </tr>
              </thead>
              <tbody>
                {visibleCourses.map(c => {
                  const meta = statusMeta(c.status);
                  return (
                    <tr key={c.id} className="border-b border-[#e8e6e1] hover:bg-[#faf9f6]/50 transition-colors">
                      <td className="p-4">
                        <div className="font-serif font-bold text-[#1a1a1a] text-sm line-clamp-1">{c.title}</div>
                        {c.slug ? (
                          <div className="text-[10px] text-[#767676] mt-1 font-mono">/{c.slug}</div>
                        ) : (
                          <div className="text-[10px] text-[#767676] mt-1 italic">slug manquant</div>
                        )}
                        {renderBadges(c._intel)}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 text-[9px] uppercase tracking-widest font-bold border ${meta.className}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="p-4 text-[11px] font-bold text-[#4a4a4a]">
                        {c.is_paid ? (
                          <span className="inline-block px-2 py-1 border border-[#8b6914]/30 text-[#8b6914]">
                            Premium{c.price ? ` — ${c.price} ${c.currency || ''}`.trim() : ''}
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 border border-[#d8d5ce] text-[#4a4a4a]">
                            Gratuit
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center text-[#1a1a1a] font-bold">{c.enrollments_count}</td>
                      <td className="p-4 text-center text-[#1a1a1a] font-bold">{c.certificates_count}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-3">
                          {c.slug && (
                            <Link
                              to={`/courses/${c.slug}`}
                              target="_blank"
                              className="text-[10px] uppercase tracking-widest font-bold text-[#8b6914] hover:underline"
                            >
                              Page publique
                            </Link>
                          )}
                          <a
                            href={`${DIRECTUS_URL}/admin/content/courses/${c.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] uppercase tracking-widest font-bold text-[#1a1a1a] hover:underline"
                          >
                            Éditer dans Directus
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <p className="mt-6 text-[11px] text-[#767676] italic">
          Cette vue est en lecture seule. La couche d'intelligence est dérivée côté client à partir des données existantes — les actions de modération s'effectuent directement dans Directus.
        </p>
      </div>
    </main>
  );
}
