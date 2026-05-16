import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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

export default function AdminCertificatesPage() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return certs.filter(c => {
      if (studentParam && c.user_id?.id !== studentParam) return false;
      if (courseFilter !== 'all' && c.course_id?.id !== courseFilter) return false;
      if (yearFilter !== 'all') {
        const y = c.issued_at ? new Date(c.issued_at).getFullYear() : null;
        if (String(y) !== yearFilter) return false;
      }
      if (!q) return true;
      const u = c.user_id || {};
      const name = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
      const email = (u.email || '').toLowerCase();
      const course = (c.course_id?.title || '').toLowerCase();
      const code = (c.certificate_code || '').toLowerCase();
      return name.includes(q) || email.includes(q) || course.includes(q) || code.includes(q);
    });
  }, [certs, search, courseFilter, yearFilter, studentParam]);

  const hasFilter = Boolean(
    search.trim() || courseFilter !== 'all' || yearFilter !== 'all' || studentParam
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
    if (studentParam) clearStudentParam();
  }

  return (
    <main className="bg-[#faf9f6] min-h-screen">
      <div className="bg-white py-20 border-b border-[#d8d5ce]/30">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            eyebrow="Administration LMS"
            title="Certificats Délivrés"
            subtitle="Liste consolidée des certificats émis par l'académie. Lecture seule."
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
      </div>
    </main>
  );
}
