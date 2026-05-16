import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import SectionHeader from '../components/ui/SectionHeader';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://admin.projetceedo20.org';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    document.title = 'Gestion des Étudiants — Admin LMS';
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.getAdminUsersLearningOverview();
        // Only show users who have interacted with LMS
        const activeOnly = data.filter(u => u.enrollments.length > 0 || u.certificates.length > 0);
        setUsers(activeOnly);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
    return users.filter(u => {
      if (statusFilter !== 'all') {
        const hasStatus = (u.enrollments || []).some(e => e?.status === statusFilter);
        if (!hasStatus) return false;
      }
      if (!q) return true;
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [users, search, statusFilter]);

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

        <div className="mb-6 flex gap-4 flex-wrap items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email…"
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
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
          <span className="text-[10px] uppercase tracking-widest text-[#767676] font-bold">
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
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold text-center">Inscriptions</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold text-center">Formations Complétées</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold text-center">Certificats</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold text-right">Détails</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <React.Fragment key={u.id}>
                    <tr className="border-b border-[#e8e6e1] hover:bg-[#faf9f6]/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-[#1a1a1a] text-sm">{u.name || 'Sans nom'}</div>
                        <div className="text-[11px] text-[#767676] mt-1">{u.email}</div>
                      </td>
                      <td className="p-4 text-center font-medium text-[#1a1a1a]">{u.enrollments.length}</td>
                      <td className="p-4 text-center font-medium text-[#1a1a1a]">{u.completed_count}</td>
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
                        <td colSpan="5" className="p-6">
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
