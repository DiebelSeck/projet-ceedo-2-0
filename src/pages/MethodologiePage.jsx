import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import SectionHeader from '../components/ui/SectionHeader';

export default function MethodologiePage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      try {
        // Fetching foundational content from Directus
        // We use a specific slug 'mai-methodologie' for the core blocks
        const data = await api.getArticleBySlug('methode-africaine-interne');
        setContent(data);
      } catch (err) {
        console.error("Erreur lors du chargement de la méthodologie", err);
      } finally {
        setLoading(false);
      }
    }
    loadContent();
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center py-32">
        <div className="w-12 h-12 border-4 border-[#C4965A]/20 border-t-[#C4965A] rounded-full animate-spin mb-4"></div>
        <div className="text-ink-muted text-[10px] uppercase tracking-[0.4em] font-bold opacity-60">Chargement du Cadre Scientifique...</div>
      </div>
    );
  }

  const PILLARS = [
    { 
      id: 'langue-archive', 
      title: 'La Langue-archive', 
      description: 'La langue n\'est pas seulement un outil de communication, mais un dépôt sédimenté d\'histoire et de concepts. Chaque terme porte en lui les traces de migrations, d\'échanges et de structures sociales passées.' 
    },
    { 
      id: 'stratigraphie', 
      title: 'Stratigraphie Sémantique', 
      description: 'Une méthode consistant à "creuser" sous les couches de sens contemporains pour retrouver les noyaux conceptuels originels, souvent masqués par les traductions et les paradigmes coloniaux.' 
    },
    { 
      id: 'diachronie', 
      title: 'Diachronie Stratifiée', 
      description: 'L\'analyse du mouvement historique des concepts africains à travers le temps, refusant l\'image d\'une Afrique "hors de l\'histoire" ou figée dans un présent ethnologique.' 
    },
    { 
      id: 'ontologie', 
      title: 'Ontologie Relationnelle', 
      description: 'Une base philosophique où l\'être se définit par ses relations (à l\'autre, à l\'ancêtre, au cosmos), structurant ainsi toute la production de savoir.' 
    }
  ];

  const TOOLS = [
    { name: 'Homonymie signifiante', detail: 'Analyse des termes identiques partageant une racine conceptuelle commune à travers les langues africaines.' },
    { name: 'Homophonie analogique', detail: 'Étude des sons similaires créant des ponts sémantiques et des systèmes de correspondance.' },
    { name: 'Ethnonymie fonctionnelle', detail: 'Comprendre l\'origine et la fonction des noms de peuples au-delà des classifications coloniales.' },
    { name: 'Toponymie conceptuelle', detail: 'Les noms de lieux comme marqueurs d\'événements historiques et d\'organisations spatiales.' },
    { name: 'Onomastique initiatique', detail: 'Patronymie et matronymie comme vecteurs de transmission de lignées et de savoirs.' },
    { name: 'Medu Neter', detail: 'L\'utilisation des systèmes graphiques (hiéroglyphes) comme clé de déchiffrement des langues modernes.' },
    { name: 'Systèmes graphiques', detail: 'Intégration des écritures endogènes (Vai, N\'ko, Adlam) dans l\'analyse textuelle.' },
    { name: 'Philologie africaine', detail: 'Critique textuelle rigoureuse des sources primaires dans leurs langues originales.' }
  ];

  return (
    <main className="bg-white min-h-screen">
      {/* 1. Institutional Hero */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-40 border-b border-border-light/20 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#C4965A]/5 -skew-x-12 translate-x-1/2"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <SectionHeader
              eyebrow="Cadre Épistémologique"
              title="Méthode Africaine Interne (MAI)"
              subtitle={content?.excerpt || "L'infrastructure intellectuelle du Projet Ceedo repose sur une exigence méthodologique rigoureuse : la réappropriation des cadres d'analyse du savoir africain."}
            />
          </div>
        </div>
      </section>

      {/* 2. Positioning Block */}
      <section className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <div className="lg:col-span-8">
            <h2 className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#C4965A] mb-12">
              Positionnement & Souveraineté
            </h2>
            <div className="prose prose-xl prose-serif text-ink leading-relaxed max-w-none italic whitespace-pre-line">
              {content?.content ? (
                <div dangerouslySetInnerHTML={{ __html: content.content }} />
              ) : (
                <>
                  <p className="mb-8">
                    La MAI n'est pas une simple alternative théorique ; elle est une nécessité de survie intellectuelle. Elle répond à l'urgence de briser le "miroir déformant" des paradigmes extérieurs pour observer l'Afrique à partir de ses propres structures de pensée.
                  </p>
                  <p>
                    Adopter cette méthode, c'est choisir la souveraineté épistémique comme préalable à toute production de connaissance sérieuse. C'est transformer le sujet africain de simple "objet d'étude" en "producteur de normes".
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="lg:col-span-4 border-l border-border-light pl-12">
            <div className="sticky top-32">
              <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink-muted mb-8 opacity-60">Attribution</div>
              <p className="text-lg font-serif text-ink mb-2">Cadre scientifique</p>
              <p className="text-gold font-bold tracking-widest text-[11px] uppercase">Projet Ceedo 2.0</p>
              
              <div className="mt-16 pt-16 border-t border-border-light/40">
                <p className="text-xs text-ink-muted font-serif italic leading-relaxed">
                  "Le savoir n'est pas neutre ; il est le reflet d'une architecture mentale. La nôtre se doit d'être endogène."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Fondements Épistémologiques */}
      <section className="bg-parchment-pale/30 py-32 border-y border-border-light/20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-[10px] uppercase tracking-[0.5em] font-bold text-ink-muted mb-24 text-center">
            Fondements de la Méthode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-24">
            {PILLARS.map((pillar, index) => (
              <div key={pillar.id} className="relative group">
                <span className="absolute -left-12 -top-4 text-4xl font-serif text-[#C4965A]/10 font-bold group-hover:text-[#C4965A]/20 transition-colors">
                  0{index + 1}
                </span>
                <h3 className="text-2xl font-serif text-ink mb-6 border-b border-[#C4965A]/20 pb-4 inline-block">
                  {pillar.title}
                </h3>
                <p className="text-lg text-ink-light leading-relaxed font-serif italic opacity-80">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Outillage Conceptuel */}
      <section className="max-w-6xl mx-auto px-6 py-32">
        <h2 className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#C4965A] mb-24 flex items-center gap-6">
          <span className="w-16 h-px bg-[#C4965A]"></span>
          Outillage Conceptuel
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {TOOLS.map((tool) => (
            <div key={tool.name} className="space-y-4 hover:translate-y-[-4px] transition-transform duration-300">
              <h4 className="text-[11px] uppercase tracking-widest font-bold text-ink border-l-2 border-[#C4965A] pl-4">
                {tool.name}
              </h4>
              <p className="text-sm font-serif text-ink-muted leading-relaxed italic opacity-70">
                {tool.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Positionnement Comparatif (Matrix) */}
      <section className="bg-ink text-white py-32 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#C4965A_0%,transparent_50%)]"></div>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <h2 className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#C4965A] mb-24 text-center">
            Matrice de Comparaison Paradigmique
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#C4965A]/30 text-[10px] uppercase tracking-[0.2em] font-bold text-white/60">
                  <th className="py-8 px-6 text-left w-1/4">Axe d'Analyse</th>
                  <th className="py-8 px-6 text-left w-1/3">Paradigme Dominant (Positiviste)</th>
                  <th className="py-8 px-6 text-left w-1/3 text-[#C4965A]">Méthode Africaine Interne</th>
                </tr>
              </thead>
              <tbody className="text-sm font-serif italic">
                <tr className="border-b border-white/10 group">
                  <td className="py-8 px-6 font-bold text-white/40 uppercase text-[9px] tracking-widest">Source Primaire</td>
                  <td className="py-8 px-6 text-white/70">Traitée comme un document brut, souvent via traduction.</td>
                  <td className="py-8 px-6 text-white group-hover:text-[#C4965A] transition-colors">Traitée comme une "Langue-archive" vivante et multidimensionnelle.</td>
                </tr>
                <tr className="border-b border-white/10 group">
                  <td className="py-8 px-6 font-bold text-white/40 uppercase text-[9px] tracking-widest">Temporalité</td>
                  <td className="py-8 px-6 text-white/70">Linéaire, souvent téléologique ou fixiste (présentisme).</td>
                  <td className="py-8 px-6 text-white group-hover:text-[#C4965A] transition-colors">Diachronie stratifiée, intégrant les cycles et les sédimentations.</td>
                </tr>
                <tr className="border-b border-white/10 group">
                  <td className="py-8 px-6 font-bold text-white/40 uppercase text-[9px] tracking-widest">Objectivation</td>
                  <td className="py-8 px-6 text-white/70">Distance critique absolue, séparation sujet/objet.</td>
                  <td className="py-8 px-6 text-white group-hover:text-[#C4965A] transition-colors">Engagement ontologique, le chercheur comme maillon de la chaîne.</td>
                </tr>
                <tr className="border-b border-white/10 group">
                  <td className="py-8 px-6 font-bold text-white/40 uppercase text-[9px] tracking-widest">Validation</td>
                  <td className="py-8 px-6 text-white/70">Consensus académique occidental ou "Universalisme".</td>
                  <td className="py-8 px-6 text-white group-hover:text-[#C4965A] transition-colors">Cohérence endogène et efficacité heuristique sur le terrain.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. Applications Contemporaines */}
      <section className="max-w-6xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#C4965A] mb-12">
              Applications Contemporaines
            </h2>
            <div className="space-y-12">
              <div className="border-l-2 border-border-light pl-8">
                <h4 className="text-lg font-serif text-ink mb-4 italic">Éthique de l'IA & Systèmes de Savoir</h4>
                <p className="text-sm text-ink-muted leading-relaxed font-serif">Comment les structures relationnelles de la MAI peuvent informer une intelligence artificielle plus humaine et moins biaisée par le rationalisme étroit.</p>
              </div>
              <div className="border-l-2 border-border-light pl-8">
                <h4 className="text-lg font-serif text-ink mb-4 italic">Climat & Savoirs Endogènes</h4>
                <p className="text-sm text-ink-muted leading-relaxed font-serif">Utiliser la stratigraphie sémantique pour retrouver les techniques ancestrales de gestion durable des écosystèmes masquées par la modernité.</p>
              </div>
              <div className="border-l-2 border-border-light pl-8">
                <h4 className="text-lg font-serif text-ink mb-4 italic">Sanankuya (Parenté à Plaisanterie)</h4>
                <p className="text-sm text-ink-muted leading-relaxed font-serif">Analyse de la régulation sociale comme modèle de gouvernance contemporain pour la résolution des conflits.</p>
              </div>
            </div>
          </div>
          <div className="bg-parchment p-12 lg:p-20 relative">
             <div className="absolute top-0 left-0 w-2 h-full bg-[#C4965A]"></div>
             <h3 className="text-2xl font-serif text-ink mb-8 leading-tight italic">
               "La MAI n'est pas un retour vers le passé, mais un recours vers le futur."
             </h3>
             <p className="text-sm text-ink-muted leading-relaxed font-serif opacity-80 italic">
               Elle fournit les outils critiques pour naviguer dans la complexité du XXIe siècle sans perdre notre ancrage civilisationnel.
             </p>
          </div>
        </div>
      </section>

      {/* 7. Discussion Critique */}
      <section className="bg-white py-32 border-t border-border-light/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-[10px] uppercase tracking-[0.5em] font-bold text-ink-muted mb-16">
            Rigueur & Discussion Critique
          </h2>
          <div className="prose prose-lg prose-serif text-ink italic leading-[1.8] opacity-80">
            <p className="mb-8">
              En tant que système scientifique, la MAI accepte le principe de falsifiabilité. Sa valeur heuristique se mesure à sa capacité à produire des analyses plus denses, plus précises et plus opérationnelles que les méthodes classiques.
            </p>
            <p>
              Elle n'est pas un dogme fermé, mais un cadre en constante évolution, ouvert à la critique interne et à la confrontation empirique avec les sources.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Institutional Finale */}
      <footer className="py-32 bg-parchment-pale flex flex-col items-center border-t border-border-light/40">
         <div className="mb-12 opacity-20">
            {/* Minimalist Seal/Logo Placeholder */}
            <div className="w-16 h-16 border-2 border-ink rounded-full flex items-center justify-center font-serif text-2xl font-bold">C</div>
         </div>
         <p className="text-[10px] uppercase tracking-[0.6em] text-[#C4965A] font-bold mb-4">
            Charte Méthodologique — Projet Ceedo 2.0
         </p>
         <p className="text-sm font-serif text-ink-muted opacity-50 italic">
            Document de référence pour l'infrastructure intellectuelle
         </p>
      </footer>
    </main>
  );
}
