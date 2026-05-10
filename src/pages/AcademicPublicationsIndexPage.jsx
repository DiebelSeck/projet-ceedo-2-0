import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import SectionHeader from '../components/ui/SectionHeader';
import { Link } from 'react-router-dom';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://admin.projetceedo20.org';

export default function AcademicPublicationsIndexPage() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getPublications();
        setPublications(data);
      } catch (err) {
        console.error('Error loading academic publications:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="bg-white min-h-screen">
      <div className="bg-[#faf9f6] py-20 md:py-32 border-b border-[#d8d5ce]/30">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            eyebrow="Think Tank Infrastructure"
            title="Publications Académiques"
            subtitle="Études de fond, rapports de recherche et documents de travail produits par nos chercheurs et experts."
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-[300px] bg-[#faf9f6]" />
            ))}
          </div>
        ) : publications.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-[#faf9f6]">
            <p className="text-[#767676] italic font-serif">Aucune publication académique indexée pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {publications.map((pub) => (
              <PublicationRow key={pub.id} pub={pub} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function PublicationRow({ pub }) {
  const coverUrl = pub.cover_image ? `${DIRECTUS_URL}/assets/${pub.cover_image}` : null;

  return (
    <div className="group border border-[#d8d5ce] bg-white hover:border-[#8b6914] transition-all duration-500 overflow-hidden flex flex-col md:flex-row">
      {coverUrl && (
        <div className="md:w-1/3 aspect-[3/4] overflow-hidden">
          <img 
            src={coverUrl} 
            alt={pub.title} 
            className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
          />
        </div>
      )}
      <div className="p-8 flex-grow flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[9px] uppercase font-bold tracking-widest text-[#8b6914]">
            {pub.category?.name || 'Publication'}
          </span>
          <span className="w-1 h-1 bg-[#d8d5ce] rounded-full" />
          <span className="text-[9px] uppercase font-bold tracking-widest text-[#767676]">
            {pub.reading_time || 0} min
          </span>
        </div>
        
        <h3 className="text-xl font-serif font-bold text-[#1a1a1a] mb-4 leading-tight group-hover:text-[#8b6914] transition-colors">
          <Link to={`/publications/${pub.slug}`}>
            {pub.title}
          </Link>
        </h3>
        
        <p className="text-sm text-[#4a4a4a] leading-relaxed line-clamp-3 mb-6 font-serif italic">
          {pub.abstract}
        </p>

        <div className="mt-auto pt-6 border-t border-[#faf9f6] flex items-center justify-between">
          <div className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a]">
            {pub.author ? `${pub.author.first_name} ${pub.author.last_name}` : 'Ceedo Research'}
          </div>
          <Link 
            to={`/publications/${pub.slug}`}
            className="text-[10px] uppercase font-bold tracking-widest text-[#8b6914] flex items-center gap-2 group/link"
          >
            Lire l'étude
            <span className="group-hover/link:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
