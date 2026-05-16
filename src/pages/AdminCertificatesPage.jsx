import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import SectionHeader from '../components/ui/SectionHeader';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://admin.projetceedo20.org';

const RECENT_WINDOW_DAYS = 30;

const INTEL_FILTERS = [
  { key: 'missing-url',  label: 'URL manquante' },
  { key: 'missing-code', label: 'Code manquant' },
  { key: 'recent',       label: `Récents (${RECENT_WINDOW_DAYS}j)` },
];

const BADGE_META = {
  'missing-url':  { label: 'URL manquante',  className: 'bg-amber-50 text-amber-700 border-amber-200' },
  'missing-code': { label: 'Code manquant',  className: 'bg-rose-50 text-rose-700 border-rose-200' },
  'recent':       { label: 'Récent',         className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: '2-digit' });
  } catch {
    return iso;
  }
}

function deriveIntel(cert, recentCutoffMs) {
  const flags = {
    'missing-url':  !cert.certificate_url,
    'missing-code': !cert.certificate_code,
    'recent':       false,
  };
  if (cert.issued_at) {
    const t = new Date(cert.issued_at).getTime();
    if (Number.isFinite(t) && t >= recentCutoffMs) flags.recent = true;
  }
  // Score for alerts ranking — incomplete records first, then recency
  let score = 0;
  if (flags['missing-url'])  score += 50;
  if (flags['missing-code']) score += 70;
  if (flags.recent)          score += 10;
  return { flags, score };
}

export default function AdminCertificatesPage() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [intelFilter, setIntelFilter] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const studentParam = searchParams.get('student') || '';

  useEffect(() => {
    document.title = 'Certificats Délivrés — Admin LMS';
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await api.getAdminCertificates();
        if (!cancelled) setCerts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('AdminCertificates load failed:', err);
        if (!cancelled) setError(err?.message || 'Erreur de chargement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const recentCutoffMs = useMemo(
    () => Date.now() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    []
  );

  const enriched = useMemo(
    () => certs.map(c => ({ ...c, _intel: deriveIntel(c, recentCutoffMs) })),
    [certs, recentCutoffMs]
  );

  const courseOptions = useMemo(() => {
    const seen = new Map();
    for (const c of certs) {
      const id = c.course_id?.id;
      const title = c.course_id?.title;
      if (id && title && !seen.has(id)) seen.set(id, title);
    }
    return Array.from(seen.entries())
      .map(([id, title]) => ({ id, title }))
      .sort((a, b) => a.title.localeCompare(b.title, 'fr'));
  }, [certs]);

  const yearOptions = useMemo(() => {
    const years = new Set();
    for (const c of certs) {
      if (!c.issued_at) continue;
      const y = new Date(c.issued_at).getFullYear();
      if (Number.isFinite(y)) years.add(y);
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [certs]);

  const studentLabel = useMemo(() => {
    if (!studentParam) return null;
    const match = certs.find(c => c.user_id?.id === studentParam);
    if (!match?.user_id) return studentParam;
    const u = match.user_id;
    return `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || studentParam;
  }, [certs, studentParam]);

  // Volume + intelligence summary (derived only from already-loaded data)
  const summary = useMemo(() => {
    const byYear = new Map();
    const byCourse = new Map();
    const studentIds = new Set();
    let missingUrl = 0;
    let missingCode = 0;
    let recent = 0;

    for (const c of enriched) {
      if (c.issued_at) {
        const y = new Date(c.issued_at).getFullYear();
        if (Number.isFinite(y)) byYear.set(y, (byYear.get(y) || 0) + 1);
      }
      const courseId = c.course_id?.id;
      const courseTitle = c.course_id?.title || 'Formation inconnue';
      if (courseId) {
        const prev = byCourse.get(courseId) || { id: courseId, title: courseTitle, count: 0 };
        prev.count += 1;
        byCourse.set(courseId, prev);
      }
      if (c.user_id?.id) studentIds.add(c.user_id.id);
      if (c._intel.flags['missing-url'])  missingUrl  += 1;
      if (c._intel.flags['missing-code']) missingCode += 1;
      if (c._intel.flags.recent)          recent      += 1;
    }

    const years = Array.from(byYear.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([year, count]) => ({ year, count }));

    const topCourses = Array.from(byCourse.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total: enriched.length,
      uniqueStudents: studentIds.size,
      uniqueCourses: byCourse.size,
      missingUrl,
      missingCode,
      recent,
      years,
      topCourses,
    };
  }, [enriched]);

  // Student distribution (top 5) — derived from enriched
  const topStudents = useMemo(() => {
    const map = new Map();
    for (const c of enriched) {
      const id = c.user_id?.id;
      if (!id) continue;
      const u = c.user_id;
      const label = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || id;
      const prev = map.get(id) || { id, label, count: 0 };
      prev.count += 1;
      map.set(id, prev);
    }
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [enriched]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched.filter(c => {
      if (studentParam && c.user_id?.id !== studentParam) return false;
      if (courseFilter !== 'all' && c.course_id?.id !== courseFilter) return false;
      if (yearFilter !== 'all') {
        const y = c.issued_at ? new Date(c.issued_at).getFullYear() : null;
        if (String(y) !== yearFilter) return false;
      }
      if (intelFilter && !c._intel.flags[intelFilter]) return false;
      if (!q) return true;
      const u = c.user_id || {};
      const name = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
      const email = (u.email || '').toLowerCase();
      const course = (c.course_id?.title || '').toLowerCase();
      const code = (c.certificate_code || '').toLowerCase();
      return name.includes(q) || email.includes(q) || course.includes(q) || code.includes(q);
    });
  }, [enriched, search, courseFilter, yearFilter, intelFilter, studentParam]);

  const topAlerts = useMemo(() => {
    return enriched
      .filter(c => c._intel.score > 0 && (c._intel.flags['missing-url'] || c._intel.flags['missing-code']))
      .sort((a, b) => {
        const diff = b._intel.score - a._intel.score;
        if (diff !== 0) return diff;
        const ta = a.issued_at ? new Date(a.issued_at).getTime() : 0;
        const tb = b.issued_at ? new Date(b.issued_at).getTime() : 0;
        return tb - ta;
      })
      .slice(0, 5);
  }, [enriched]);

  const hasFilter = Boolean(
    search.trim() || courseFilter !== 'all' || yearFilter !== 'all' || studentParam || intelFilter
  );

  function clearStudentParam() {
    const next = new URLSearchParams(searchParams);
    next.delete('student');
    setSearchParams(next, { replace: true });
  }

  function resetFilters() {
    setSearch('');
    setCourseFilter('all');
    setYearFilter('all');
    setIntelFilter(null);
    if (studentParam) clearStudentParam();
  }

  function renderBadges(intel) {
    const order = ['missing-code', 'missing-url', 'recent'];
    const keys = order.filter(k => intel.flags[k]);
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

  const volumeCards = [
    { key: 'total',    label: 'Total délivrés',  value: summary.total },
    { key: 'students', label: 'Étudiants uniques', value: summary.uniqueStudents },
    { key: 'courses',  label: 'Formations uniques', value: summary.uniqueCourses },
    { key: 'recent',   label: `Récents (${RECENT_WINDOW_DAYS}j)`, value: summary.recent },
  ];

  const intelCards = [
    { key: 'missing-url',  label: 'URL manquante',  value: summary.missingUrl,  accent: 'text-amber-700' },
    { key: 'missing-code', label: 'Code manquant',  value: summary.missingCode, accent: 'text-rose-700' },
    { key: 'recent',       label: `Récents (${RECENT_WINDOW_DAYS}j)`, value: summary.recent, accent: 'text-emerald-700' },
  ];

  return (
    <main className="bg-[#faf9f6] min-h-screen">
      <div className="bg-white py-20 border-b border-[#d8d5ce]/30">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            eyebrow="Administration LMS"
            title="Certificats Délivrés"
            subtitle="Liste consolidée des certificats émis par l'académie, enrichie d'une couche d'intelligence (lecture seule)."
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
          <Link to="/admin" className="text-[10px] uppercase tracking-widest font-bold text-[#4a4a4a] hover:text-[#8b6914]">
            ← Retour au Dashboard
          </Link>
          <a
            href={`${DIRECTUS_URL}/admin/content/certificates`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#1a1a1a] text-white text-[10px] uppercase font-bold tracking-widest hover:bg-[#8b6914] transition-colors"
          >
            Gérer dans Directus
          </a>
        </div>

        {studentParam && (
          <div className="mb-6 p-4 bg-[#faf9f6] border border-[#d8d5ce] flex items-center justify-between gap-4 flex-wrap">
            <div className="text-[12px] text-[#4a4a4a]">
              Filtré sur l'étudiant : <span className="font-bold">{studentLabel}</span>
            </div>
            <button
              type="button"
              onClick={clearStudentParam}
              className="text-[10px] uppercase tracking-widest font-bold text-[#8b6914] hover:underline"
            >
              Retirer le filtre étudiant
            </button>
          </div>
        )}

        {/* Volume summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {volumeCards.map(card => (
            <div key={card.key} className="bg-white border border-[#d8d5ce] p-5">
              <div className="text-[10px] uppercase tracking-widest text-[#767676] font-bold">{card.label}</div>
              <div className="mt-2 text-3xl font-serif font-bold text-[#1a1a1a]">{card.value}</div>
            </div>
          ))}
        </div>

        {/* Intelligence summary — clickable filter cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {intelCards.map(card => {
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

        {/* Distributions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-[#d8d5ce] p-5">
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#1a1a1a] mb-3">
              Par année
            </h3>
            {summary.years.length === 0 ? (
              <p className="text-[11px] text-[#767676] italic">Aucune donnée.</p>
            ) : (
              <ul className="space-y-1">
                {summary.years.map(y => (
                  <li key={y.year} className="flex justify-between text-[12px] text-[#4a4a4a]">
                    <span className="font-mono">{y.year}</span>
                    <span className="font-bold text-[#1a1a1a]">{y.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-white border border-[#d8d5ce] p-5">
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#1a1a1a] mb-3">
              Top formations
            </h3>
            {summary.topCourses.length === 0 ? (
              <p className="text-[11px] text-[#767676] italic">Aucune donnée.</p>
            ) : (
              <ul className="space-y-1">
                {summary.topCourses.map(c => (
                  <li key={c.id} className="flex justify-between gap-3 text-[12px] text-[#4a4a4a]">
                    <span className="font-serif truncate">{c.title}</span>
                    <span className="font-bold text-[#1a1a1a]">{c.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-white border border-[#d8d5ce] p-5">
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#1a1a1a] mb-3">
              Top étudiants
            </h3>
            {topStudents.length === 0 ? (
              <p className="text-[11px] text-[#767676] italic">Aucune donnée.</p>
            ) : (
              <ul className="space-y-1">
                {topStudents.map(s => (
                  <li key={s.id} className="flex justify-between gap-3 text-[12px] text-[#4a4a4a]">
                    <Link
                      to={`/admin/users/${s.id}`}
                      className="font-serif truncate hover:text-[#8b6914] hover:underline"
                    >
                      {s.label}
                    </Link>
                    <span className="font-bold text-[#1a1a1a]">{s.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Compact alerts — incomplete certificate records */}
        <div className="bg-white border border-[#d8d5ce] p-5 mb-10">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-[11px] uppercase tracking-widest font-bold text-[#1a1a1a]">
              Alertes — certificats incomplets
            </h2>
            <span className="text-[10px] uppercase tracking-widest text-[#767676]">
              {topAlerts.length === 0 ? 'Aucune alerte' : `Top ${topAlerts.length}`}
            </span>
          </div>
          {topAlerts.length === 0 ? (
            <p className="text-[12px] text-[#767676] italic">
              Tous les certificats chargés disposent d'un code et d'une URL.
            </p>
          ) : (
            <ul className="divide-y divide-[#e8e6e1]">
              {topAlerts.map(c => {
                const u = c.user_id || {};
                const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || 'Utilisateur inconnu';
                const order = ['missing-code', 'missing-url'];
                const flags = order.filter(k => c._intel.flags[k]);
                return (
                  <li key={c.id} className="py-2 flex flex-wrap items-center gap-3">
                    <span className="font-serif font-bold text-[#1a1a1a] text-sm flex-1 min-w-[180px]">
                      {name}
                      <span className="font-normal text-[#767676] text-[11px]"> — {c.course_id?.title || 'Formation inconnue'}</span>
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
                      href={`${DIRECTUS_URL}/admin/content/certificates/${c.id}`}
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

        {/* Filters */}
        <div className="mb-3">
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
              const count = f.key === 'missing-url' ? summary.missingUrl
                          : f.key === 'missing-code' ? summary.missingCode
                          : summary.recent;
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

        <div className="mb-6 flex gap-4 flex-wrap items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, formation ou code…"
            className="w-full md:w-80 px-4 py-3 border border-[#d8d5ce] bg-white text-sm focus:outline-none focus:border-[#8b6914]"
          />
          {courseOptions.length > 0 && (
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-4 py-3 border border-[#d8d5ce] bg-white text-sm focus:outline-none focus:border-[#8b6914]"
            >
              <option value="all">Toutes formations</option>
              {courseOptions.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          )}
          {yearOptions.length > 0 && (
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-4 py-3 border border-[#d8d5ce] bg-white text-sm focus:outline-none focus:border-[#8b6914]"
            >
              <option value="all">Toutes années</option>
              {yearOptions.map(y => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          )}
          <span className="text-[10px] uppercase tracking-widest text-[#767676] font-bold">
            {filtered.length} / {certs.length} certificats
          </span>
          {hasFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-[10px] uppercase tracking-widest font-bold text-[#8b6914] hover:underline"
            >
              Réinitialiser
            </button>
          )}
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
              {certs.length === 0 ? (
                'Aucun certificat délivré pour le moment.'
              ) : hasFilter ? (
                <span>
                  Aucun certificat ne correspond aux filtres actuels.{' '}
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="not-italic text-[10px] uppercase tracking-widest font-bold text-[#8b6914] hover:underline"
                  >
                    Réinitialiser
                  </button>
                </span>
              ) : (
                'Aucun certificat à afficher.'
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#d8d5ce] bg-[#faf9f6]">
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Étudiant</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Formation</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Code</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Délivré le</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const u = c.user_id || {};
                  const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Utilisateur inconnu';
                  return (
                    <tr key={c.id} className="border-b border-[#e8e6e1] hover:bg-[#faf9f6]/50 transition-colors">
                      <td className="p-4">
                        {u.id ? (
                          <Link
                            to={`/admin/users/${u.id}`}
                            className="font-bold text-[#1a1a1a] text-sm hover:text-[#8b6914] hover:underline"
                          >
                            {fullName}
                          </Link>
                        ) : (
                          <div className="font-bold text-[#1a1a1a] text-sm">{fullName}</div>
                        )}
                        <div className="text-[11px] text-[#767676] mt-1">{u.email || '—'}</div>
                        {renderBadges(c._intel)}
                      </td>
                      <td className="p-4 text-sm font-serif text-[#1a1a1a]">
                        {c.course_id?.title || 'Formation inconnue'}
                      </td>
                      <td className="p-4 text-[11px] font-mono text-[#4a4a4a]">
                        {c.certificate_code || '—'}
                      </td>
                      <td className="p-4 text-[11px] text-[#4a4a4a]">
                        {formatDate(c.issued_at)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-3">
                          {c.certificate_url ? (
                            <a
                              href={c.certificate_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] uppercase tracking-widest font-bold text-[#8b6914] hover:underline"
                            >
                              Voir
                            </a>
                          ) : null}
                          <a
                            href={`${DIRECTUS_URL}/admin/content/certificates/${c.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] uppercase tracking-widest font-bold text-[#1a1a1a] hover:underline"
                          >
                            Directus
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
          Vue en lecture seule. La couche d'intelligence (récence, complétude) est dérivée côté client à partir des données déjà chargées — les corrections s'effectuent dans Directus.
        </p>
      </div>
    </main>
  );
}
