import React from 'react';
import { Link } from 'react-router-dom';

export default function RelatedResourcesBox({ resources = {}, title = "Ressources liées" }) {
  const { articles = [], publications = [], dossiers = [], library = [] } = resources;

  const hasAny = articles.length > 0 || publications.length > 0 || dossiers.length > 0 || library.length > 0;

  if (!hasAny) return null;

  return (
    <div className="bg-[#faf9f6] border border-[#d8d5ce] p-8 lg:p-10">
      <h3 className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#8b6914] mb-8 border-b border-[#d8d5ce] pb-4 flex items-center justify-between">
        {title}
        <span className="text-[#1a1a1a] opacity-40">Système Ceedo 2.0</span>
      </h3>

      <div className="space-y-10">
        {/* Dossiers */}
        {dossiers.length > 0 && (
          <div>
            <h4 className="text-[9px] uppercase font-bold tracking-widest text-[#767676] mb-4">Clusters de savoir</h4>
            <ul className="space-y-3">
              {dossiers.map(d => (
                <li key={d.id}>
                  <Link to={`/dossiers/${d.slug}`} className="text-sm font-serif text-[#1a1a1a] hover:text-[#8b6914] transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-[#8b6914] rounded-full group-hover:scale-150 transition-transform"></span>
                    {d.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Publications */}
        {publications.length > 0 && (
          <div>
            <h4 className="text-[9px] uppercase font-bold tracking-widest text-[#767676] mb-4">Études Académiques</h4>
            <ul className="space-y-3">
              {publications.map(p => (
                <li key={p.id}>
                  <Link to={`/publications/${p.slug}`} className="text-sm font-serif text-[#1a1a1a] hover:text-[#8b6914] transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-[#8b6914] rounded-full group-hover:scale-150 transition-transform"></span>
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Articles */}
        {articles.length > 0 && (
          <div>
            <h4 className="text-[9px] uppercase font-bold tracking-widest text-[#767676] mb-4">Contributions Éditoriales</h4>
            <ul className="space-y-3">
              {articles.map(a => (
                <li key={a.id}>
                  <Link to={`/articles/${a.slug}`} className="text-sm font-serif text-[#1a1a1a] hover:text-[#8b6914] transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-[#8b6914] rounded-full group-hover:scale-150 transition-transform"></span>
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
