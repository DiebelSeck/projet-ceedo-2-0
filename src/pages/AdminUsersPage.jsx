import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { downloadCSV } from '../lib/csvExport';
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

const SORT_FIELDS = [
  { value: 'lastActivity',    label: 'Dernière activité' },
  { value: 'name',            label: 'Nom' },
  { value: 'averageProgress', label: 'Progression moy.' },
  { value: 'enrollmentDate',  label: 'Date d’inscription' },
  { value: 'pendingCerts',    label: 'Certificats en attente' },
  { value: 'certificateCount',label: 'Certificats délivrés' },
  { value: 'successScore',    label: 'Score réussite' },
];

const INTEL_FILTERS = [
  { key: 'risk',     label: 'À risque' },
  { key: 'inactive', label: 'Inactifs' },
  { key: 'top',      label: 'Top performers' },
  { key: 'slow',     label: 'Progression lente' },
  { key: 'pending',  label: 'Certificats en attente' },
];

const BADGE_META = {
  risk:    { label: 'À risque',          className: 'bg-red-50 text-red-700 border-red-200' },
  inactive:{ label: 'Inactif',           className: 'bg-stone-100 text-stone-600 border-stone-300' },
  top:     { label: 'Top performer',     className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  slow:    { label: 'Progression lente', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  pending: { label: 'Cert. en attente',  className: 'bg-blue-50 text-blue-700 border-blue-200' },
};

const SLOW_COMPLETION_DAYS = 60;

/**
 * Derive student success signals from already-loaded learning overview fields.
 * Pure frontend — no schema assumptions, no new API calls.
 */
function deriveSuccess(u) {
  const avg = Number.isFinite(u.averageProgress) ? u.averageProgress : 0;
  const completed = Number.isFinite(u.completed_count) ? u.completed_count : 0;
  const pending = Number.isFinite(u.pendingCertCount) ? u.pendingCertCount : 0;
  const enrollments = Array.isArray(u.enrollments) ? u.enrollments : [];
  const certificates = Array.isArray(u.certificates) ? u.certificates : [];
  const avgCompletionDays = Number.isFinite(u.averageCompletionDays) ? u.averageCompletionDays : null;
  const active30d = Boolean(u.active30d);

  // Has at least one in-progress enrollment (started but not completed)
  const hasInProgress = enrollments.some(e => e && e.started_at && !e.completed_at);

  const flags = {
    inactive: !active30d && enrollments.length > 0,
    risk:     !active30d && hasInProgress && avg < 50 && completed === 0,
    top:      completed >= 2 || certificates.length >= 2 || (completed >= 1 && avg >= 90),
    slow:     avgCompletionDays != null && avgCompletionDays > SLOW_COMPLETION_DAYS,
    pending:  pending > 0,
  };

  // Completion velocity: 'fast' | 'normal' | 'slow' | null
  let completionVelocity = null;
  if (avgCompletionDays != null) {
    if (avgCompletionDays <= 14)      completionVelocity = 'fast';
    else if (avgCompletionDays <= 45) completionVelocity = 'normal';
    else                               completionVelocity = 'slow';
  }

  // Estimated days to finish remaining work, based on user's own velocity.
  // Uses averageCompletionDays as a benchmark scaled by remaining progress.
  let estimatedCompletionDays = null;
  if (avgCompletionDays != null && avg > 0 && avg < 100) {
    const remaining = (100 - avg) / 100;
    estimatedCompletionDays = Math.round(avgCompletionDays * remaining);
  }

  // Weighted score 0–100 (clamped). Higher = healthier success profile.
  let score = 50;
  score += Math.round(avg * 0.3);                       // up to +30
  if (flags.top)      score += 20;
  if (active30d)      score += 10;
  if (flags.pending)  score += 5;                       // close to a certificate
  if (flags.inactive) score -= 15;
  if (flags.risk)     score -= 25;
  if (flags.slow)     score -= 10;
  if (completed === 0 && enrollments.length > 0 && avg === 0) score -= 10; // never started
  score = Math.max(0, Math.min(100, score));

  return {
    flags,
    completionVelocity,
    estimatedCompletionDays,
    successScore: score,
  };
}

// Comparator: nulls/NaN always sort last regardless of direction.
function compareWithNullsLast(av, bv, dir) {
  const aMissing = av == null || (typeof av === 'number' && Number.isNaN(av));
  const bMissing = bv == null || (typeof bv === 'number' && Number.isNaN(bv));
  if (aMissing && bMissing) return 0;
  if (aMissing) return 1;
  if (bMissing) return -1;
  if (typeof av === 'string' && typeof bv === 'string') {
    return dir === 'asc'
      ? av.localeCompare(bv, 'fr', { sensitivity: 'base' })
      : bv.localeCompare(av, 'fr', { sensitivity: 'base' });
  }
  return dir === 'asc' ? av - bv : bv - av;
}

function getSortValue(u, key) {
  switch (key) {
    case 'name':             return (u.name || '').trim() || null;
    case 'averageProgress':  return Number.isFinite(u.averageProgress) ? u.averageProgress : null;
    case 'lastActivity':     return u.lastActivity   ? Date.parse(u.lastActivity)   : null;
    case 'enrollmentDate':   return u.enrollmentDate ? Date.parse(u.enrollmentDate) : null;
    case 'pendingCerts':     return Number.isFinite(u.pendingCertCount) ? u.pendingCertCount : null;
    case 'certificateCount': return Array.isArray(u.certificates) ? u.certificates.length : null;
    case 'successScore':     return Number.isFinite(u._success?.successScore) ? u._success.successScore : null;
    default:                 return null;
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [active30dFilter, setActive30dFilter] = useState('all');     // 'all' | 'yes' | 'no'
  const [pendingCertFilter, setPendingCertFilter] = useState('all'); // 'all' | 'yes' | 'no'
  const [issuedCertFilter, setIssuedCertFilter] = useState('all');   // 'all' | 'yes' | 'no'
  const [progressMin, setProgressMin] = useState('');                // empty string = unset
  const [progressMax, setProgressMax] = useState('');
  const [sortBy, setSortBy] = useState('lastActivity');
  const [sortDir, setSortDir] = useState('desc');
  const [intelFilter, setIntelFilter] = useState(null);

  useEffect(() => {
    document.title = 'Gestion des Étudiants — Admin LMS';
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setLoadError(null);
        const data = await api.getAdminUsersLearningOverview();
        // Only show users who have interacted with LMS
        const activeOnly = (data || []).filter(u => u.enrollments.length > 0 || u.certificates.length > 0);
        setUsers(activeOnly);
      } catch (err) {
        console.error(err);
        setLoadError(err?.message || 'Erreur de chargement de la liste des étudiants.');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const enrichedUsers = useMemo(
    () => users.map(u => ({ ...u, _success: deriveSuccess(u) })),
    [users]
  );

  const successSummary = useMemo(() => {
    const c = { risk: 0, inactive: 0, top: 0, slow: 0, pending: 0, totalScore: 0 };
    for (const u of enrichedUsers) {
      const f = u._success.flags;
      if (f.risk)     c.risk     += 1;
      if (f.inactive) c.inactive += 1;
      if (f.top)      c.top      += 1;
      if (f.slow)     c.slow     += 1;
      if (f.pending)  c.pending  += 1;
      c.totalScore += u._success.successScore;
    }
    const averageScore = enrichedUsers.length > 0
      ? Math.round(c.totalScore / enrichedUsers.length)
      : 0;
    return { ...c, averageScore };
  }, [enrichedUsers]);

  const availableStatuses = useMemo(() => {
    const set = new Set();
    for (const u of users) {
      for (const e of u.enrollments || []) {
        if (e?.status) set.add(e.status);
      }
    }
    return Array.from(set).sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const minN = progressMin === '' ? null : Number(progressMin);
    const maxN = progressMax === '' ? null : Number(progressMax);

    const passes = (u) => {
      // Intelligence filter (composes with the rest)
      if (intelFilter && !u._success?.flags?.[intelFilter]) return false;
      // Enrollment status (any-of)
      if (statusFilter !== 'all') {
        const hasStatus = (u.enrollments || []).some(e => e?.status === statusFilter);
        if (!hasStatus) return false;
      }
      // Active 30d
      if (active30dFilter === 'yes' && !u.active30d) return false;
      if (active30dFilter === 'no'  &&  u.active30d) return false;
      // Pending certificates
      const pending = Number.isFinite(u.pendingCertCount) ? u.pendingCertCount : 0;
      if (pendingCertFilter === 'yes' && pending <= 0) return false;
      if (pendingCertFilter === 'no'  && pending >  0) return false;
      // Issued certificates
      const issued = Array.isArray(u.certificates) ? u.certificates.length : 0;
      if (issuedCertFilter === 'yes' && issued <= 0) return false;
      if (issuedCertFilter === 'no'  && issued >  0) return false;
      // Progress range
      const avg = Number.isFinite(u.averageProgress) ? u.averageProgress : 0;
      if (minN != null && Number.isFinite(minN) && avg < minN) return false;
      if (maxN != null && Number.isFinite(maxN) && avg > maxN) return false;
      // Free-text search: name, email, OR any enrollment course title
      if (!q) return true;
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      if (name.includes(q) || email.includes(q)) return true;
      for (const e of u.enrollments || []) {
        const title = (e?.course_id?.title || '').toLowerCase();
        if (title.includes(q)) return true;
      }
      return false;
    };

    const list = enrichedUsers.filter(passes);

    const sorted = [...list].sort((a, b) =>
      compareWithNullsLast(getSortValue(a, sortBy), getSortValue(b, sortBy), sortDir)
    );

    return sorted;
  }, [
    enrichedUsers, search, statusFilter,
    active30dFilter, pendingCertFilter, issuedCertFilter,
    progressMin, progressMax, sortBy, sortDir, intelFilter,
  ]);

  // Alerts: sort by inverse score (lowest score = highest risk), but only flagged users
  const topAlerts = useMemo(() => {
    return enrichedUsers
      .filter(u => {
        const f = u._success.flags;
        return f.risk || f.inactive || f.slow;
      })
      .sort((a, b) => a._success.successScore - b._success.successScore)
      .slice(0, 5);
  }, [enrichedUsers]);

  function resetFilters() {
    setSearch('');
    setStatusFilter('all');
    setActive30dFilter('all');
    setPendingCertFilter('all');
    setIssuedCertFilter('all');
    setProgressMin('');
    setProgressMax('');
    setSortBy('lastActivity');
    setSortDir('desc');
    setIntelFilter(null);
  }

  function renderSuccessBadges(intel) {
    const order = ['risk', 'inactive', 'slow', 'pending', 'top'];
    const keys = order.filter(k => intel?.flags?.[k]);
    if (keys.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {keys.map(k => {
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

  function handleExportCSV() {
    if (filteredUsers.length === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    const columns = [
      { header: 'Nom',                          value: u => u.name || '' },
      { header: 'Email',                        value: u => u.email || '' },
      { header: 'Inscriptions',                 value: u => (u.enrollments?.length ?? 0) },
      { header: 'Complétées',                   value: u => (u.completed_count ?? 0) },
      { header: 'Progression moyenne (%)',      value: u => Number.isFinite(u.averageProgress) ? u.averageProgress : 0 },
      { header: 'Actif (30j)',                  value: u => u.active30d ? 'Oui' : 'Non' },
      { header: 'Dernière activité',            value: u => (u.lastActivity   ? String(u.lastActivity).slice(0, 10)   : '') },
      { header: 'Date inscription',             value: u => (u.enrollmentDate ? String(u.enrollmentDate).slice(0, 10) : '') },
      { header: 'Certificats délivrés',         value: u => (u.certificates?.length ?? 0) },
      { header: 'Certificats en attente',       value: u => (u.pendingCertCount ?? 0) },
      { header: 'Durée moyenne complétion (j)', value: u => (u.averageCompletionDays != null ? u.averageCompletionDays : '') },
    ];
    downloadCSV(filteredUsers, `ceedo-lms-students-${today}.csv`, columns);
  }

  return (
    <main className="bg-[#faf9f6] min-h-screen">
      <div className="bg-white py-20 border-b border-[#d8d5ce]/30">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            eyebrow="Administration LMS"
            title="Étudiants Actifs"
            subtitle="Suivez la progression, l'engagement et les succès de vos apprenants."
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <Link to="/admin" className="text-[10px] uppercase tracking-widest font-bold text-[#4a4a4a] hover:text-[#8b6914]">
            ← Retour au Dashboard
          </Link>
          <a href={`${DIRECTUS_URL}/admin/content/directus_users`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-[#1a1a1a] text-white text-[10px] uppercase font-bold tracking-widest hover:bg-[#8b6914] transition-colors">
            Gérer dans Directus
          </a>
        </div>

        {loadError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-[12px] text-red-800 flex items-center justify-between gap-4 flex-wrap" role="alert">
            <div>
              <span className="font-bold uppercase tracking-widest text-[10px] mr-2">Erreur de chargement</span>
              {loadError}
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-[10px] uppercase tracking-widest font-bold text-red-800 border border-red-300 px-3 py-2 hover:bg-red-100"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Student success intelligence — summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {[
            { key: 'risk',     label: 'Étudiants à risque', value: successSummary.risk,     accent: 'text-red-700' },
            { key: 'inactive', label: 'Inactifs',           value: successSummary.inactive, accent: 'text-stone-600' },
            { key: 'top',      label: 'Top performers',     value: successSummary.top,      accent: 'text-emerald-700' },
            { key: 'pending',  label: 'Certificats en attente', value: successSummary.pending, accent: 'text-blue-700' },
            { key: 'score',    label: 'Score moyen réussite',   value: `${successSummary.averageScore}`, accent: 'text-[#8b6914]' },
          ].map(card => {
            const isFilter = card.key !== 'score';
            const active = isFilter && intelFilter === card.key;
            const Wrapper = isFilter ? 'button' : 'div';
            const wrapperProps = isFilter
              ? {
                  type: 'button',
                  onClick: () => setIntelFilter(active ? null : card.key),
                  className: `text-left bg-white border p-5 transition-colors ${
                    active ? 'border-[#1a1a1a] ring-2 ring-[#1a1a1a]/10' : 'border-[#d8d5ce] hover:border-[#8b6914]'
                  }`,
                }
              : { className: 'bg-white border border-[#d8d5ce] p-5' };
            return (
              <Wrapper key={card.key} {...wrapperProps}>
                <div className="text-[10px] uppercase tracking-widest text-[#767676] font-bold">{card.label}</div>
                <div className={`mt-2 text-3xl font-serif font-bold ${card.accent}`}>{card.value}</div>
                {isFilter && (
                  <div className="mt-1 text-[10px] uppercase tracking-widest text-[#767676]">
                    {active ? 'Filtre actif' : 'Cliquer pour filtrer'}
                  </div>
                )}
              </Wrapper>
            );
          })}
        </div>

        {/* Compact alerts — student success */}
        <div className="bg-white border border-[#d8d5ce] p-5 mb-8">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-[11px] uppercase tracking-widest font-bold text-[#1a1a1a]">
              Alertes — réussite étudiante
            </h2>
            <span className="text-[10px] uppercase tracking-widest text-[#767676]">
              {topAlerts.length === 0 ? 'Aucune alerte' : `Top ${topAlerts.length}`}
            </span>
          </div>
          {topAlerts.length === 0 ? (
            <p className="text-[12px] text-[#767676] italic">
              Aucun signal de réussite préoccupant détecté pour les étudiants chargés.
            </p>
          ) : (
            <ul className="divide-y divide-[#e8e6e1]">
              {topAlerts.map(u => {
                const order = ['risk', 'inactive', 'slow', 'pending'];
                const flags = order.filter(k => u._success.flags[k]);
                return (
                  <li key={u.id} className="py-2 flex flex-wrap items-center gap-3">
                    <Link
                      to={`/admin/users/${u.id}`}
                      className="font-serif font-bold text-[#1a1a1a] text-sm flex-1 min-w-[180px] hover:text-[#8b6914] hover:underline"
                    >
                      {u.name || u.email || 'Sans nom'}
                      <span className="font-normal text-[#767676] text-[11px]"> — score {u._success.successScore}/100</span>
                    </Link>
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
                    <span className="text-[10px] uppercase tracking-widest text-[#767676]">
                      {u._success.estimatedCompletionDays != null
                        ? `~${u._success.estimatedCompletionDays}j restants`
                        : 'Aucune estimation'}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Intelligence filter row */}
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-widest text-[#767676] font-bold mb-2">
            Intelligence réussite
          </div>
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
              const count = successSummary[f.key] ?? 0;
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
                  {f.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4 flex gap-4 flex-wrap items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email ou formation…"
            className="w-full md:w-80 px-4 py-3 border border-[#d8d5ce] bg-white text-sm focus:outline-none focus:border-[#8b6914]"
          />
          {availableStatuses.length > 0 && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-[#d8d5ce] bg-white text-sm focus:outline-none focus:border-[#8b6914]"
            >
              <option value="all">Tous statuts</option>
              {availableStatuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
          <select
            value={active30dFilter}
            onChange={(e) => setActive30dFilter(e.target.value)}
            className="px-4 py-3 border border-[#d8d5ce] bg-white text-sm focus:outline-none focus:border-[#8b6914]"
            aria-label="Filtre Actif (30j)"
          >
            <option value="all">Actif (30j) : tous</option>
            <option value="yes">Actif (30j) : oui</option>
            <option value="no">Actif (30j) : non</option>
          </select>
          <select
            value={pendingCertFilter}
            onChange={(e) => setPendingCertFilter(e.target.value)}
            className="px-4 py-3 border border-[#d8d5ce] bg-white text-sm focus:outline-none focus:border-[#8b6914]"
            aria-label="Filtre certificats en attente"
          >
            <option value="all">Cert. en attente : tous</option>
            <option value="yes">Avec en attente</option>
            <option value="no">Sans en attente</option>
          </select>
          <select
            value={issuedCertFilter}
            onChange={(e) => setIssuedCertFilter(e.target.value)}
            className="px-4 py-3 border border-[#d8d5ce] bg-white text-sm focus:outline-none focus:border-[#8b6914]"
            aria-label="Filtre certificats délivrés"
          >
            <option value="all">Cert. délivré : tous</option>
            <option value="yes">Avec certificat</option>
            <option value="no">Sans certificat</option>
          </select>
        </div>

        <div className="mb-6 flex gap-4 flex-wrap items-center">
          <div className="flex items-center gap-2">
            <label className="text-[10px] uppercase tracking-widest text-[#767676] font-bold">Progression</label>
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={progressMin}
              onChange={(e) => setProgressMin(e.target.value)}
              placeholder="Min"
              className="w-20 px-3 py-2 border border-[#d8d5ce] bg-white text-sm focus:outline-none focus:border-[#8b6914]"
              aria-label="Progression minimum"
            />
            <span className="text-[#767676]">–</span>
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={progressMax}
              onChange={(e) => setProgressMax(e.target.value)}
              placeholder="Max"
              className="w-20 px-3 py-2 border border-[#d8d5ce] bg-white text-sm focus:outline-none focus:border-[#8b6914]"
              aria-label="Progression maximum"
            />
            <span className="text-[10px] text-[#767676]">%</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] uppercase tracking-widest text-[#767676] font-bold">Trier par</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-[#d8d5ce] bg-white text-sm focus:outline-none focus:border-[#8b6914]"
            >
              {SORT_FIELDS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))}
              className="px-3 py-2 border border-[#d8d5ce] bg-white text-sm hover:bg-[#faf9f6]"
              aria-label={`Inverser l'ordre (actuel : ${sortDir === 'asc' ? 'croissant' : 'décroissant'})`}
              title={sortDir === 'asc' ? 'Croissant' : 'Décroissant'}
            >
              {sortDir === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-[#8b6914] border border-[#8b6914]/40 hover:bg-[#8b6914]/5"
          >
            Réinitialiser
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredUsers.length === 0}
            className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-white bg-[#1a1a1a] hover:bg-[#8b6914] disabled:bg-[#d8d5ce] disabled:text-[#767676] disabled:cursor-not-allowed transition-colors"
            title={filteredUsers.length === 0 ? 'Aucun étudiant à exporter' : 'Télécharger la sélection courante en CSV'}
          >
            Exporter CSV
          </button>
          <span className="text-[10px] uppercase tracking-widest text-[#767676] font-bold ml-auto">
            {filteredUsers.length} / {users.length} étudiants
          </span>
        </div>

        <div className="bg-white border border-[#d8d5ce] overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-[#8b6914]/20 border-t-[#8b6914] rounded-full animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-[#767676] font-serif italic">
              {users.length === 0 ? 'Aucun étudiant actif trouvé.' : 'Aucun résultat pour cette recherche.'}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#d8d5ce] bg-[#faf9f6]">
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Utilisateur</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Inscription</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Dernière activité</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold text-center">Inscriptions</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold text-center">Formations Complétées</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold text-center">Progression</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold text-center">Actif (30j)</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold text-center">Certificats</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold text-right">Détails</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => {
                  const avgProgress = Number.isFinite(u.averageProgress) ? u.averageProgress : 0;
                  return (
                  <React.Fragment key={u.id}>
                    <tr className="border-b border-[#e8e6e1] hover:bg-[#faf9f6]/50 transition-colors">
                      <td className="p-4">
                        <Link
                          to={`/admin/users/${u.id}`}
                          className="font-bold text-[#1a1a1a] text-sm hover:text-[#8b6914] hover:underline"
                        >
                          {u.name || 'Sans nom'}
                        </Link>
                        <div className="text-[11px] text-[#767676] mt-1">{u.email}</div>
                        {renderSuccessBadges(u._success)}
                      </td>
                      <td className="p-4 text-[11px] text-[#4a4a4a]">{formatDate(u.enrollmentDate)}</td>
                      <td className="p-4 text-[11px] text-[#4a4a4a]">{formatDate(u.lastActivity)}</td>
                      <td className="p-4 text-center font-medium text-[#1a1a1a]">{u.enrollments.length}</td>
                      <td className="p-4 text-center font-medium text-[#1a1a1a]">{u.completed_count}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-20 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#8b6914] h-full" style={{ width: `${avgProgress}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-[#4a4a4a] w-8 text-right">{avgProgress}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {u.active30d ? (
                          <span className="inline-block px-2 py-1 text-[9px] uppercase tracking-widest font-bold border bg-green-50 text-green-700 border-green-200">Oui</span>
                        ) : (
                          <span className="inline-block px-2 py-1 text-[9px] uppercase tracking-widest font-bold border bg-gray-100 text-gray-600 border-gray-200">Non</span>
                        )}
                      </td>
                      <td className="p-4 text-center font-medium text-[#1a1a1a]">{u.certificates.length}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setExpandedUserId(expandedUserId === u.id ? null : u.id)}
                          className="text-[10px] uppercase tracking-widest font-bold text-[#8b6914] hover:underline"
                        >
                          {expandedUserId === u.id ? 'Fermer' : 'Voir progression'}
                        </button>
                      </td>
                    </tr>
                    {expandedUserId === u.id && (
                      <tr className="bg-[#faf9f6] border-b border-[#d8d5ce]">
                        <td colSpan="9" className="p-6">
                          <div className="flex flex-col gap-4 max-w-3xl">
                            <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#4a4a4a] border-b border-[#d8d5ce] pb-2">
                              Détail des inscriptions
                            </h4>
                            {u.enrollments.length === 0 ? (
                              <p className="text-xs text-[#767676] italic">Aucune inscription</p>
                            ) : (
                              u.enrollments.map(enr => (
                                <div key={enr.id} className="flex justify-between items-center bg-white p-4 border border-[#e8e6e1]">
                                  <div className="font-serif text-[#1a1a1a] text-sm">{enr.course_id?.title || 'Formation inconnue'}</div>
                                  <div className="flex items-center gap-6">
                                    <div className="w-32 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                      <div className="bg-[#8b6914] h-full" style={{ width: `${enr.progress_percentage || 0}%` }} />
                                    </div>
                                    <span className="text-[10px] font-bold text-[#4a4a4a] w-8 text-right">{enr.progress_percentage || 0}%</span>
                                    <span className={`inline-block w-20 text-center px-2 py-1 text-[9px] uppercase tracking-widest font-bold border ${enr.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                      {enr.status}
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
