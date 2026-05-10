import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import SectionHeader from '../components/ui/SectionHeader';
import { Link } from 'react-router-dom';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://admin.projetceedo20.org';

export default function DossiersIndexPage() {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getDossiers();
        setDossiers(data);
      } catch (err) {
        console.error('Error loading dossiers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="bg-white min-h-screen">
      <div className="bg-[#1a1a1a] text-white py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            eyebrow="Knowledge Clusters"
            title="Dossiers Thématiques"
            subtitle="Explorations approfondies regroupant articles de fond, études académiques et ressources documentaires autour d'axes stratégiques."
            dark={true}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20 lg:py-32">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-square bg-[#faf9f6]" />
            ))}
          </div>
        ) : dossiers.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-[#faf9f6]">
            <p className="text-[#767676] italic font-serif">Aucun dossier thématique publié pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {dossiers.map((dossier) => (
              <DossierCard key={dossier.id} dossier={dossier} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function DossierCard({ dossier }) {
  const coverUrl = dossier.cover_image ? `${DIRECTUS_URL}/assets/${dossier.cover_image}` : null;

  return (
    <Link 
      to={`/dossiers/${dossier.slug}`}
      className="group block relative overflow-hidden bg-black aspect-square"
    >
      {coverUrl ? (
        <img 
          src={coverUrl} 
          alt={dossier.title} 
          className="w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700 grayscale" 
        />
      ) : (
        <div className="w-full h-full bg-[#1a1a1a]" />
      )}
      
      <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent">
        <span className="text-[9px] uppercase font-bold tracking-[0.3em] text-[#8b6914] mb-2 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          Dossier Spécial
        </span>
        <h3 className="text-2xl font-serif font-bold text-white leading-tight">
          {dossier.title}
        </h3>
        <p className="text-[10px] uppercase font-bold tracking-widest text-white/60 mt-4 border-t border-white/20 pt-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
          Explorer le dossier →
        </p>
      </div>
    </Link>
  );
}
