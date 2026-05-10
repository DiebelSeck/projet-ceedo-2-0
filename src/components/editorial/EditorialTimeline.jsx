import React from 'react';

/**
 * EditorialTimeline displays the traceability metadata of an article.
 * Shows when and by whom the article was reviewed, approved, and published.
 */
export default function EditorialTimeline({ article }) {
  if (!article) return null;

  const events = [
    {
      label: 'Soumission',
      date: article.date_created,
      user: `${article.Author?.first_name} ${article.Author?.last_name}`,
      active: true,
    },
    {
      label: 'Révision',
      date: article.reviewed_at,
      user: article.reviewed_by ? `${article.reviewed_by.first_name} ${article.reviewed_by.last_name}` : null,
      active: !!article.reviewed_at,
    },
    {
      label: 'Approbation',
      date: article.approved_at,
      user: article.approved_by ? `${article.approved_by.first_name} ${article.approved_by.last_name}` : null,
      active: !!article.approved_at,
    },
    {
      label: 'Publication',
      date: article.published_at,
      user: article.published_by ? `${article.published_by.first_name} ${article.published_by.last_name}` : null,
      active: !!article.published_at,
    },
  ].filter(e => e.active);

  return (
    <div className="bg-white border border-[#d8d5ce] p-6 lg:p-8">
      <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1a1a1a] mb-8 border-b border-[#faf9f6] pb-4">
        Traçabilité Éditoriale
      </h3>

      <div className="space-y-8">
        {events.map((event, idx) => (
          <div key={idx} className="flex gap-4 relative">
            {idx !== events.length - 1 && (
              <div className="absolute left-[11px] top-[24px] bottom-[-24px] w-px bg-[#d8d5ce]" />
            )}
            <div className="w-6 h-6 rounded-full border-2 border-[#8b6914] bg-white flex items-center justify-center z-10 shrink-0 mt-1">
              <div className="w-2 h-2 rounded-full bg-[#8b6914]" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a]">
                {event.label}
              </div>
              <div className="text-xs text-[#767676] mt-1 flex flex-col gap-1">
                <span>{new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                <span className="font-bold text-[#8b6914] uppercase text-[9px] tracking-widest">Par {event.user}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-[#faf9f6] grid grid-cols-2 gap-4">
        <div>
          <span className="block text-[8px] uppercase font-bold text-[#767676] mb-1">Cycles de révision</span>
          <span className="text-sm font-serif italic text-[#1a1a1a]">{article.revision_count || 0}</span>
        </div>
        <div>
          <span className="block text-[8px] uppercase font-bold text-[#767676] mb-1">Dernière action</span>
          <span className="text-sm font-serif italic text-[#1a1a1a] capitalize">
            {article.last_editorial_action?.replace('_', ' ') || 'Aucune'}
          </span>
        </div>
      </div>
    </div>
  );
}
