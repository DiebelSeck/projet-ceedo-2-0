import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import SectionHeader from '../components/ui/SectionHeader';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function AdminAccessPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'active', 'revoked'
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    document.title = 'Gestion des accès — Admin LMS';
    window.scrollTo(0, 0);
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await api.getCourseAccessRequests(filter === 'all' ? null : filter);
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to load requests', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function handleApprove(id) {
    if (!window.confirm('Approuver cette demande d\'accès ?')) return;
    try {
      setActionLoading(id);
      await api.approveCourseAccess(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Erreur lors de l\'approbation');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRevoke(id) {
    if (!window.confirm('Révocquer cet accès ? L\'étudiant ne pourra plus consulter le cours.')) return;
    try {
      setActionLoading(id);
      await api.revokeCourseAccess(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Erreur lors de la révocation');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRestore(id) {
    if (!window.confirm('Restaurer cet accès ?')) return;
    try {
      setActionLoading(id);
      await api.restoreCourseAccess(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Erreur lors de la restauration');
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <main className="bg-[#faf9f6] min-h-screen">
      <div className="bg-white py-20 border-b border-[#d8d5ce]/30">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            eyebrow="Administration LMS"
            title="Gestion des accès"
            subtitle="Gérez les demandes d'accès premium et contrôlez les autorisations."
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex gap-2">
            {['all', 'pending', 'active', 'revoked'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-[10px] uppercase font-bold tracking-widest transition-colors ${
                  filter === f 
                    ? 'bg-[#1a1a1a] text-white' 
                    : 'bg-white text-[#767676] border border-[#d8d5ce] hover:bg-[#e8e6e1]'
                }`}
              >
                {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : f === 'active' ? 'Actifs' : 'Révoqués'}
              </button>
            ))}
          </div>
          
          <button onClick={loadData} className="text-[10px] uppercase font-bold tracking-widest text-[#8b6914] hover:text-[#1a1a1a] transition-colors">
            Rafraîchir
          </button>
        </div>

        <div className="bg-white border border-[#d8d5ce] overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-[#8b6914]/20 border-t-[#8b6914] rounded-full animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center text-[#767676] font-serif italic">
              Aucun enregistrement trouvé pour ce filtre.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#d8d5ce] bg-[#faf9f6]">
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Étudiant</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Formation</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Statut</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold">Date</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest text-[#767676] font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id} className="border-b border-[#e8e6e1] hover:bg-[#faf9f6]/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-[#1a1a1a] text-sm">
                        {req.user_id?.first_name} {req.user_id?.last_name}
                      </div>
                      <div className="text-[11px] text-[#767676]">{req.user_id?.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-serif text-[#1a1a1a] text-sm line-clamp-2">
                        {req.course_id?.title || 'Formation inconnue'}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-[#8b6914] mt-1">
                        {req.access_type}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 text-[9px] uppercase tracking-widest font-bold border ${
                        req.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                        req.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-[11px] text-[#767676]">
                      {req.status === 'active' ? (
                        <>Validé le <br />{formatDate(req.granted_at)}</>
                      ) : (
                        <>Demandé le <br />{formatDate(req.requested_at)}</>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {req.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(req.id)}
                            disabled={actionLoading === req.id}
                            className="px-3 py-1.5 bg-[#8b6914] text-white text-[9px] uppercase font-bold tracking-widest hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
                          >
                            Approuver
                          </button>
                        )}
                        {req.status === 'active' && (
                          <button
                            onClick={() => handleRevoke(req.id)}
                            disabled={actionLoading === req.id}
                            className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 text-[9px] uppercase font-bold tracking-widest hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            Révoquer
                          </button>
                        )}
                        {req.status === 'revoked' && (
                          <button
                            onClick={() => handleRestore(req.id)}
                            disabled={actionLoading === req.id}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-200 text-[9px] uppercase font-bold tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-50"
                          >
                            Restaurer
                          </button>
                        )}
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
