import React from 'react';
import { Link } from 'react-router-dom';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://admin.projetceedo20.org';

export default function CourseCard({ course }) {
  const { title, slug, subtitle, level, duration, cover_image, instructor } = course;
  const coverUrl = cover_image ? `${DIRECTUS_URL}/assets/${cover_image}` : null;

  const levelLabels = {
    introduction: 'Introduction',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé',
    masterclass: 'Masterclass'
  };

  return (
    <div className="group bg-white border border-[#d8d5ce] overflow-hidden hover:border-[#8b6914] transition-all duration-500 flex flex-col h-full">
      <div className="relative aspect-video overflow-hidden bg-[#1a1a1a]">
        {coverUrl && (
          <img 
            src={coverUrl} 
            alt={title} 
            className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
          />
        )}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 bg-white text-[8px] uppercase font-bold tracking-widest text-[#1a1a1a] shadow-sm">
            {levelLabels[level] || level}
          </span>
          <span className="px-3 py-1 bg-[#8b6914] text-[8px] uppercase font-bold tracking-widest text-white shadow-sm">
            {duration}
          </span>
        </div>
      </div>

      <div className="p-8 flex-grow flex flex-col">
        <h3 className="text-xl font-serif font-bold text-[#1a1a1a] mb-4 leading-tight group-hover:text-[#8b6914] transition-colors">
          <Link to={`/courses/${slug}`}>
            {title}
          </Link>
        </h3>
        
        <p className="text-sm text-[#4a4a4a] leading-relaxed line-clamp-2 mb-8 font-serif italic">
          {subtitle}
        </p>

        <div className="mt-auto pt-6 border-t border-[#faf9f6] flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#faf9f6] flex items-center justify-center text-[10px] font-bold text-[#8b6914] border border-[#d8d5ce]">
               {instructor?.first_name?.[0]}{instructor?.last_name?.[0]}
             </div>
             <span className="text-[10px] uppercase font-bold tracking-widest text-[#767676]">
               {instructor ? `${instructor.first_name} ${instructor.last_name}` : 'Instructeur Ceedo'}
             </span>
          </div>
          <Link 
            to={`/courses/${slug}`}
            className="text-[10px] uppercase font-bold tracking-widest text-[#8b6914] flex items-center gap-2 group/link"
          >
            S'inscrire
            <span className="group-hover/link:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
