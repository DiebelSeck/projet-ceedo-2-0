import React from 'react';

/**
 * Displays editorial feedback/notes for an article.
 * Typically shown in the author's submission page or the editor's preview.
 */
export default function EditorialNotesBox({ notes }) {
  if (!notes) return null;

  return (
    <div className="bg-[#faf9f6] border border-[#8b6914] p-6 mb-10">
      <div className="flex items-center gap-3 mb-4">
        <svg className="w-4 h-4 text-[#8b6914]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8b6914]">
          Notes de la rédaction
        </h3>
      </div>
      <div className="text-sm text-[#4a4a4a] leading-relaxed font-serif italic whitespace-pre-wrap">
        {notes}
      </div>
      <p className="mt-4 text-[9px] text-[#767676] uppercase tracking-widest font-bold">
        Statut : Action requise
      </p>
    </div>
  );
}
