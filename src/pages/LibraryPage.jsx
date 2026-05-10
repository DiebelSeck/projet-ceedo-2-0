import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import SectionHeader from '../components/ui/SectionHeader';

export default function LibraryPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getLibraryResources();
        setResources(data);
      } catch (err) {
        console.error('Error loading library resources:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    window.scrollTo(0, 0);
  }, []);

  const resourceTypes = {
    book: 'Livre',
    article: 'Article',
    video: 'Vidéo',
    pdf: 'Document PDF'
  };

  return (
    <main className="bg-white min-h-screen">
      <div className="bg-[#faf9f6] py-20 md:py-32 border-b border-[#d8d5ce]/30">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            eyebrow="Base de Connaissances"
            title="Bibliothèque Numérique"
            subtitle="Accès centralisé aux ressources documentaires, références bibliographiques et sources externes du système Ceedo."
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20">
        {loading ? (
          <div className="space-y-6 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-[#faf9f6] border border-[#d8d5ce]" />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-[#faf9f6]">
            <p className="text-[#767676] italic font-serif">Aucune ressource répertoriée pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-[#1a1a1a]">
                  <th className="py-4 text-[10px] uppercase font-bold tracking-widest text-[#767676]">Type</th>
                  <th className="py-4 text-[10px] uppercase font-bold tracking-widest text-[#767676]">Titre & Auteur</th>
                  <th className="py-4 text-[10px] uppercase font-bold tracking-widest text-[#767676]">Année</th>
                  <th className="py-4 text-[10px] uppercase font-bold tracking-widest text-[#767676]">Catégorie</th>
                  <th className="py-4 text-[10px] uppercase font-bold tracking-widest text-[#767676] text-right">Ressource</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#faf9f6]">
                {resources.map((res) => (
                  <tr key={res.id} className="group hover:bg-[#faf9f6] transition-colors">
                    <td className="py-6">
                      <span className="inline-block px-2 py-1 bg-white border border-[#d8d5ce] text-[8px] uppercase font-bold tracking-widest text-[#1a1a1a]">
                        {resourceTypes[res.type] || res.type}
                      </span>
                    </td>
                    <td className="py-6">
                      <div className="text-sm font-serif font-bold text-[#1a1a1a]">{res.title}</div>
                      <div className="text-[10px] uppercase tracking-widest text-[#767676] mt-1">{res.author}</div>
                    </td>
                    <td className="py-6">
                      <span className="text-xs font-serif italic text-[#4a4a4a]">{res.year || '—'}</span>
                    </td>
                    <td className="py-6">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#8b6914]">{res.category || 'Général'}</span>
                    </td>
                    <td className="py-6 text-right">
                      {(res.file_url || res.external_link) ? (
                        <a 
                          href={res.file_url || res.external_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block px-4 py-2 border border-[#1a1a1a] text-[#1a1a1a] text-[9px] font-bold uppercase tracking-widest hover:bg-[#1a1a1a] hover:text-white transition-all"
                        >
                          Ouvrir
                        </a>
                      ) : (
                        <span className="text-[9px] uppercase font-bold tracking-widest text-[#d8d5ce]">Non disponible</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
