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

const FILTERS = [
  { key: 'all',       label: 'Toutes' },
  { key: 'draft',     label: 'Brouillon' },
  { key: 'review',    label: 'En relecture' },
  { key: 'approved',  label: 'Approuvées' },
  { key: 'published', label: 'Publiées' },
  { key: 'archived',  label: 'Archivées' },
];

function statusMeta(status) {
  return STATUS_META[status] || { label: status || '—', className: 'bg-gray-100 text-gray-700 border-gray-200' };
}

export default function AdminAcademicModerationPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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

  const counts = useMemo(() => {
    const c = { total: courses.length, draft: 0, review: 0, approved: 0, published: 0, archived: 0 };
    for (const course of courses) {
      if (c[course.status] !== undefined) c[course.status] += 1;
    }
    return c;
  }, [courses]);

  const visibleCourses = useMemo(() => {
    if (filter === 'all') return courses;
    return courses.filter(c => c.status === filter);
  }, [courses, filter]);

  const summaryCards = [
    { key: 'total',     label: 'Total',        value: counts.total },
    { key: 'draft',     label: 'Brouillon',    value: counts.draft },
    { key: 'review',    label: 'En relecture', value: counts.review },
    { key: 'approved',  label: 'Approuvées',   value: counts.approved },
    { key: 'published', label: 'Publiées',     value: counts.published },
    { key: 'archived',  label: 'Archivées',    value: counts.archived },
  ];

  return (
    <main className="bg-[#faf9f6] min-h-screen">
      <div className="bg-white py-20 border-b border-[#d8d5ce]/30">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            eyebrow="Administration LMS"
            title="Centre de modération académique"
            subtitle="Suivi en lecture seule des formations à différentes étapes du cycle éditorial."
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

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {summaryCards.map(card => (
            <div key={card.key} className="bg-white border border-[#d8d5ce] p-5">
              <div className="text-[10px] uppercase tracking-widest text-[#767676] font-bold">{card.label}</div>
              <div className="mt-2 text-3xl font-serif font-bold text-[#1a1a1a]">{card.value}</div>
            </div>
          ))}
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map(f => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
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

        {/* Table */}
        <div className="bg-white border border-[#d8d5ce] overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-[#8b6914]/20 border-t-[#8b6914] rounded-full animate-spin" />
            </div>
          ) : visibleCourses.length === 0 ? (
            <div className="p-12 text-center text-[12px] text-[#767676]">
              Aucune formation ne correspond à ce filtre.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#d8d5ce] bg-[#faf9f6]">
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Formation</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Statut</th>
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
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 text-[9px] uppercase tracking-widest font-bold border ${meta.className}`}>
                          {meta.label}
                        </span>
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
          Cette vue est en lecture seule. Les actions de modération (approbation, publication, archivage) s'effectuent directement dans Directus.
        </p>
      </div>
    </main>
  );
}
