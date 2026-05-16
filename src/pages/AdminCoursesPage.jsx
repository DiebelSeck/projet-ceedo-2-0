import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import SectionHeader from '../components/ui/SectionHeader';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://admin.projetceedo20.org';

const STATUS_META = {
  published: { label: 'Publiée', className: 'bg-green-50 text-green-700 border-green-200' },
  draft:     { label: 'Brouillon', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  review:    { label: 'En relecture', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  archived:  { label: 'Archivée', className: 'bg-stone-100 text-stone-600 border-stone-200' },
};

function statusMeta(status) {
  return STATUS_META[status] || { label: status || '—', className: 'bg-gray-100 text-gray-700 border-gray-200' };
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Gestion des Formations — Admin LMS';
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.getAdminCourses();
        setCourses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="bg-[#faf9f6] min-h-screen">
      <div className="bg-white py-20 border-b border-[#d8d5ce]/30">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            eyebrow="Administration LMS"
            title="Formations & Contenus"
            subtitle="Vue d'ensemble des parcours académiques et statistiques d'engagement."
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <Link to="/admin" className="text-[10px] uppercase tracking-widest font-bold text-[#4a4a4a] hover:text-[#8b6914]">
            ← Retour au Dashboard
          </Link>
          <a href={`${DIRECTUS_URL}/admin/content/courses`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-[#1a1a1a] text-white text-[10px] uppercase font-bold tracking-widest hover:bg-[#8b6914] transition-colors">
            Gérer dans Directus
          </a>
        </div>

        <div className="bg-white border border-[#d8d5ce] overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-[#8b6914]/20 border-t-[#8b6914] rounded-full animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#d8d5ce] bg-[#faf9f6]">
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Formation</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Statut</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Modèle</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold text-center">Inscrits</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold text-center">Diplômés</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c.id} className="border-b border-[#e8e6e1] hover:bg-[#faf9f6]/50 transition-colors">
                    <td className="p-4">
                      <div className="font-serif font-bold text-[#1a1a1a] text-sm line-clamp-1">{c.title}</div>
                      <div className="text-[10px] text-[#767676] mt-1 font-mono">/{c.slug}</div>
                    </td>
                    <td className="p-4">
                      {(() => {
                        const meta = statusMeta(c.status);
                        return (
                          <span className={`inline-block px-2 py-1 text-[9px] uppercase tracking-widest font-bold border ${meta.className}`}>
                            {meta.label}
                          </span>
                        );
                      })()}
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
                        <Link to={`/courses/${c.slug}`} target="_blank" className="text-[10px] uppercase tracking-widest font-bold text-[#8b6914] hover:underline">
                          Voir
                        </Link>
                        <a href={`${DIRECTUS_URL}/admin/content/courses/${c.id}`} target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-widest font-bold text-[#1a1a1a] hover:underline">
                          Éditer
                        </a>
                      </div>
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
