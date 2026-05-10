import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import SectionHeader from '../components/ui/SectionHeader';

export default function BibliothequePage() {
  const [documents, setDocuments] = useState([]);
  const [tagTypes, setTagTypes] = useState({});
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    discipline: '',
    periode: '',
    approche: '',
    corpus: '',
    type: ''
  });

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const [tagsData, dossiersData, docsData] = await Promise.all([
          api.getTagTypesWithTags(),
          api.getDossiers({ limit: 100 }),
          api.getLibraryDocuments({ search: '', filters: {} })
        ]);
        setTagTypes(tagsData);
        setDossiers(dossiersData);
        setDocuments(docsData);
      } catch (err) {
        console.error("Erreur bibliothèque:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (loading) return;
      const data = await api.getLibraryDocuments({ search, filters });
      setDocuments(data);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <main className="bg-white min-h-screen">
      {/* 1. Institutional Hero */}
      <section className="bg-parchment-pale pt-24 pb-16 md:pt-40 md:pb-24 border-b border-border-light/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl">
            <SectionHeader
              eyebrow="Infrastructure Documentaire"
              title="Bibliothèque Numérique"
              subtitle="Un espace de conservation et de consultation des sources primaires et des appareils critiques qui soutiennent la recherche au sein du Projet Ceedo."
            />
          </div>
        </div>
      </section>

      {/* 2. Systemic Search & Results Context */}
      <div className="sticky top-[72px] z-30 bg-white/95 backdrop-blur-md border-b border-border-light/40 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="relative flex-grow max-w-xl">
              <input 
                type="text" 
                placeholder="Rechercher par titre, auteur ou thématique..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-parchment/30 border border-border-light/60 py-3 pl-12 pr-4 text-sm font-serif italic focus:outline-none focus:border-gold/50 transition-colors"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold opacity-50 text-lg">⌕</span>
            </div>
            
            <div className="flex items-center gap-4">
               <span className="text-[10px] uppercase font-bold tracking-widest text-ink-muted">
                 {documents.length} Ressource{documents.length !== 1 ? 's' : ''} indexée{documents.length !== 1 ? 's' : ''}
               </span>
               {activeFiltersCount > 0 && (
                 <button 
                   onClick={() => setFilters({ discipline: '', periode: '', approche: '', corpus: '', type: '' })}
                   className="text-[9px] uppercase font-bold text-gold border-b border-gold pb-0.5 hover:text-ink hover:border-ink transition-colors"
                 >
                   Réinitialiser les filtres
                 </button>
               )}
            </div>
          </div>

          {/* Results Context Header */}
          {activeFiltersCount > 0 && (
            <div className="mt-6 flex flex-wrap gap-2 animate-fadeIn">
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null;
                return (
                  <span key={key} className="inline-flex items-center gap-2 bg-gold/5 border border-gold/20 px-3 py-1.5 text-[9px] uppercase font-bold tracking-widest text-gold">
                    <span className="opacity-50">{key}:</span> {value}
                    <button onClick={() => handleFilterChange(key, '')} className="hover:text-ink">✕</button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* 3. Systemic Filter Sidebar */}
          <aside className="lg:col-span-3 space-y-12 h-fit sticky top-44">
            <div className="space-y-8">
               <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold text-ink border-b border-border-light pb-4">Axes de Recherche</h2>
               
               {/* Discipline */}
               <FilterGroup 
                 label="Discipline" 
                 options={tagTypes['discipline']?.tags} 
                 currentValue={filters.discipline}
                 onChange={(v) => handleFilterChange('discipline', v)}
               />

               {/* Période */}
               <FilterGroup 
                 label="Période" 
                 options={tagTypes['periode']?.tags} 
                 currentValue={filters.periode}
                 onChange={(v) => handleFilterChange('periode', v)}
               />

               {/* Corpus Associé */}
               <FilterGroup 
                 label="Corpus Associé" 
                 options={dossiers.map(d => ({ slug: d.slug, name: d.title }))} 
                 currentValue={filters.corpus}
                 onChange={(v) => handleFilterChange('corpus', v)}
               />

               {/* Type de document */}
               <FilterGroup 
                 label="Type de document" 
                 options={[
                   { slug: 'Livre', name: 'Livre' },
                   { slug: 'Article scientifique', name: 'Article scientifique' },
                   { slug: 'Manuscrit', name: 'Manuscrit' },
                   { slug: 'Archive', name: 'Archive' },
                   { slug: 'Carte', name: 'Carte' }
                 ]} 
                 currentValue={filters.type}
                 onChange={(v) => handleFilterChange('type', v)}
               />
            </div>
          </aside>

          {/* 4. Bibliographic Archive List */}
          <section className="lg:col-span-9">
            {loading ? (
              <div className="py-32 flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin"></div>
              </div>
            ) : documents.length > 0 ? (
              <div className="divide-y divide-border-light/40">
                {documents.map((doc) => (
                  <BibliographicRecord key={doc.id} doc={doc} />
                ))}
              </div>
            ) : (
              <div className="py-32 text-center border border-dashed border-border-light bg-parchment/5">
                <p className="text-lg font-serif text-ink-muted italic">Aucun document ne correspond à vos critères de recherche.</p>
                <button 
                  onClick={() => {setFilters({ discipline: '', periode: '', approche: '', corpus: '', type: '' }); setSearch('');}}
                  className="mt-6 text-[10px] uppercase font-bold tracking-widest text-gold border-b border-gold pb-1"
                >
                  Afficher tout le catalogue
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function FilterGroup({ label, options, currentValue, onChange }) {
  if (!options?.length) return null;
  return (
    <div className="space-y-4">
      <h3 className="text-[9px] uppercase tracking-widest font-bold text-ink-muted opacity-60">{label}</h3>
      <select 
        value={currentValue} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-parchment/10 border border-border-light/40 py-2.5 px-3 text-xs font-serif italic focus:outline-none focus:border-gold/30"
      >
        <option value="">Tous les {label.toLowerCase()}s</option>
        {options.map(opt => (
          <option key={opt.slug} value={opt.slug}>{opt.name}</option>
        ))}
      </select>
    </div>
  );
}

function BibliographicRecord({ doc }) {
  return (
    <article className="group py-10 flex flex-col md:flex-row gap-10 hover:translate-x-2 transition-transform duration-500">
      <div className="flex-grow space-y-6">
        <div className="flex flex-wrap items-center gap-4">
           <span className={`text-[9px] uppercase tracking-[0.2em] font-bold px-2 py-0.5 border ${
             doc.sourceType === 'primaire' ? 'bg-gold/10 border-gold/30 text-gold' : 'border-border-light text-ink-muted opacity-60'
           }`}>
             {doc.sourceType === 'primaire' ? 'Source Primaire' : doc.sourceType === 'critique' ? 'Appareil Critique' : 'Source Secondaire'}
           </span>
           <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-ink-muted/40">
             {doc.documentType} — {doc.year || 'S.D.'}
           </span>
        </div>

        <div>
          <h3 className="text-2xl md:text-3xl font-serif text-ink leading-tight mb-3 group-hover:text-gold transition-colors duration-300">
            {doc.title}
          </h3>
          <p className="text-sm font-serif text-ink-light opacity-80 mb-2 italic">
            Par <span className="text-ink font-bold not-italic">{doc.author}</span>
          </p>
        </div>

        <p className="text-base text-ink-light leading-relaxed line-clamp-3 font-serif italic opacity-70">
          {doc.abstract}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {doc.relatedCorpus?.map(corpus => (
            <Link 
              key={corpus.id} 
              to={`/dossiers/${corpus.slug}`}
              className="text-[9px] uppercase font-bold tracking-widest text-gold bg-gold/5 px-3 py-1 hover:bg-gold hover:text-white transition-all"
            >
              Corpus: {corpus.title}
            </Link>
          ))}
        </div>
      </div>

      <div className="md:w-48 shrink-0 flex flex-col gap-3">
         <a 
           href={doc.fileUrl || '#'} 
           className="w-full py-3 bg-ink text-white text-[9px] uppercase font-bold tracking-[0.2em] text-center hover:bg-gold transition-colors"
           target="_blank" 
           rel="noopener noreferrer"
         >
           Consulter
         </a>
         <button 
           onClick={() => {
             const citation = doc.citation || `${doc.author} (${doc.year}). ${doc.title}. Projet Ceedo Archive.`;
             navigator.clipboard.writeText(citation);
             alert('Citation copiée dans le presse-papier');
           }}
           className="w-full py-3 border border-border-light text-ink-muted text-[9px] uppercase font-bold tracking-[0.2em] text-center hover:border-gold hover:text-gold transition-colors"
         >
           Citer la source
         </button>
         <div className="mt-2 text-[8px] uppercase tracking-widest font-bold text-ink-muted/40 text-center italic">
           Permanent Link: /library/{doc.id?.slice(0,8)}
         </div>
      </div>
    </article>
  );
}
