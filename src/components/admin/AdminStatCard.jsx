import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminStatCard({ title, value, icon, linkText, linkUrl, internalLinkUrl }) {
  return (
    <div className="bg-white border border-[#d8d5ce] p-6 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[#767676]">{title}</h3>
        <div className="text-[#8b6914] text-xl">
          {icon}
        </div>
      </div>
      <div className="text-4xl font-serif font-bold text-[#1a1a1a] mb-6">
        {value}
      </div>
      {internalLinkUrl ? (
        <Link to={internalLinkUrl} className="mt-auto text-[10px] uppercase tracking-[0.2em] font-bold text-[#8b6914] hover:text-[#1a1a1a] transition-colors">
          {linkText} →
        </Link>
      ) : linkUrl ? (
        <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="mt-auto text-[10px] uppercase tracking-[0.2em] font-bold text-[#8b6914] hover:text-[#1a1a1a] transition-colors">
          {linkText} →
        </a>
      ) : null}
    </div>
  );
}
