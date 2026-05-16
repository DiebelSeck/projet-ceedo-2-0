import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import SectionHeader from '../components/ui/SectionHeader';
import StatusBadge from '../components/ui/StatusBadge';

const STATUS_FILTERS = [
  { label: 'En révision', value: 'review' },
  { label: 'Corrections', value: 'revisions' },
  { label: 'Approuvés', value: 'approved' },
  { label: 'Brouillons', value: 'draft' },
  { label: 'Publiés', value: 'published' },
  { label: 'Archivés', value: 'archived' },
  { label: 'Tous', value: 'Tous' },
];

export default function EditorPanelPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || 'review';

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Panel Éditorial — Projet Ceedo 2.0';
    loadArticles();
  }, [statusFilter]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await api.getEditorialArticles(statusFilter);
      setArticles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleFilterChange = (status) => {
    setSearchParams({ status });
  };

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-20 lg:py-32">
        <SectionHeader
          eyebrow="Système Éditorial"
          title="Panel de Révision"
          subtitle="Gestion centralisée du flux de publication et de la qualité éditoriale."
        />

        {/* Filters */}
        <div className="mt-12 flex flex-wrap gap-4 border-b border-[#d8d5ce] pb-8">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleFilterChange(f.value)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                statusFilter === f.value
                  ? 'bg-[#1a1a1a] text-white'
                  : 'text-[#767676] hover:text-[#1a1a1a] bg-[#faf9f6]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="mt-12">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-[#C4965A]/20 border-t-[#C4965A] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#767676]">Chargement des articles...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center text-red-600 font-serif italic">{error}</div>
          ) : articles.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-[#faf9f6]">
              <p className="text-[#767676] italic font-serif">Aucun article trouvé pour ce statut.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#1a1a1a]">
                    <th className="py-4 text-[10px] uppercase font-bold tracking-widest text-[#767676]">Titre</th>
                    <th className="py-4 text-[10px] uppercase font-bold tracking-widest text-[#767676]">Auteur</th>
                    <th className="py-4 text-[10px] uppercase font-bold tracking-widest text-[#767676]">Statut</th>
                    <th className="py-4 text-[10px] uppercase font-bold tracking-widest text-[#767676]">Révisions</th>
                    <th className="py-4 text-[10px] uppercase font-bold tracking-widest text-[#767676]">Dernière action</th>
                    <th className="py-4 text-[10px] uppercase font-bold tracking-widest text-[#767676] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#faf9f6]">
                  {articles.map((article) => (
                    <tr key={article.id} className="group hover:bg-[#faf9f6] transition-colors">
                      <td className="py-6 pr-4">
                        <Link to={`/editor/articles/${article.id}/preview`} className="block">
                          <span className="text-sm font-serif font-bold text-[#1a1a1a] group-hover:text-[#8b6914] transition-colors">
                            {article.title}
                          </span>
                          <span className="block text-[10px] text-[#767676] uppercase tracking-widest mt-1">
                            {article.category?.name || 'Sans catégorie'}
                          </span>
                        </Link>
                      </td>
                      <td className="py-6">
                        <span className="text-xs text-[#4a4a4a]">
                          {article.Author ? `${article.Author.first_name} ${article.Author.last_name}` : 'Anonyme'}
                        </span>
                      </td>
                      <td className="py-6">
                        <StatusBadge status={article.status} />
                      </td>
                      <td className="py-6">
                        <span className="text-xs font-serif italic text-[#767676]">
                          {article.revision_count || 0}
                        </span>
                      </td>
                      <td className="py-6">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#767676] opacity-60">
                          {article.last_editorial_action?.replace('_', ' ') || '—'}
                        </span>
                      </td>
                      <td className="py-6 text-right">
                        <Link
                          to={`/editor/articles/${article.id}/preview`}
                          className="inline-block px-4 py-2 bg-[#1a1a1a] text-white text-[9px] font-bold uppercase tracking-widest hover:bg-[#8b6914] transition-all"
                        >
                          Aperçu
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
