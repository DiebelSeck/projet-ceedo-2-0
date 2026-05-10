import React from 'react';

/**
 * Standardized status labels and colors for the Ceedo 2.0 editorial workflow.
 */
const STATUS_CONFIG = {
  draft: {
    label: 'Brouillon',
    classes: 'border-[#8b6914] text-[#8b6914] bg-white',
  },
  review: {
    label: 'En révision',
    classes: 'border-[#1a1a1a] text-[#1a1a1a] bg-white',
  },
  revisions: {
    label: 'Corrections demandées',
    classes: 'border-[#8b6914] bg-[#8b6914] text-white',
  },
  approved: {
    label: 'Approuvé',
    classes: 'border-[#1a1a1a] bg-[#faf9f6] text-[#1a1a1a]',
  },
  published: {
    label: 'Publié',
    classes: 'border-[#1a1a1a] bg-[#1a1a1a] text-white',
  },
  archived: {
    label: 'Archivé',
    classes: 'border-[#767676] text-[#767676] bg-white',
  },
};

export default function StatusBadge({ status, className = '' }) {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Inconnu',
    classes: 'border-[#d8d5ce] text-[#767676] bg-white',
  };

  return (
    <span className={`inline-block px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest border ${config.classes} ${className}`}>
      {config.label}
    </span>
  );
}
