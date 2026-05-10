import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import SectionHeader from '../components/ui/SectionHeader';
import CourseCard from '../components/academy/CourseCard';
import { Link } from 'react-router-dom';

export default function AcademieIndexPage() {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getFeaturedCourses();
        setFeaturedCourses(data);
      } catch (err) {
        console.error('Error loading featured courses:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="bg-white min-h-screen">
      {/* Academy Hero */}
      <section className="bg-[#1a1a1a] text-white py-24 md:py-40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#8b6914]/10 -skew-x-12 translate-x-1/2"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <SectionHeader
            eyebrow="Académie CEEDO"
            title="S'approprier le savoir souverain"
            subtitle="Une plateforme de transmission dédiée aux humanités fondamentales africaines et à la méthodologie de recherche souveraine."
            dark={true}
          />
          <div className="mt-12 flex flex-wrap justify-center gap-6">
            <Link to="/courses" className="px-10 py-4 bg-[#8b6914] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-white hover:text-[#1a1a1a] transition-all shadow-xl">
              Parcourir les cours
            </Link>
            <Link to="/projet/methodologie" className="px-10 py-4 border border-white/20 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-white hover:text-[#1a1a1a] transition-all">
              Découvrir la méthode
            </Link>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-24 lg:py-32 border-b border-[#faf9f6]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="space-y-10">
              <h2 className="text-[10px] uppercase font-bold tracking-[0.5em] text-[#8b6914] mb-8 flex items-center gap-4">
                <span className="w-12 h-[1px] bg-[#8b6914]"></span>
                La Mission Académique
              </h2>
              <p className="text-2xl lg:text-3xl font-serif text-[#1a1a1a] leading-tight italic">
                "Nous ne formons pas seulement des apprenants, nous structurons des consciences capables de produire et de transmettre le savoir africain avec rigueur."
              </p>
              <p className="text-lg text-[#4a4a4a] leading-relaxed font-serif">
                L'Académie CEEDO est le pilier pédagogique de notre infrastructure. Elle transforme les recherches du Think Tank en parcours d'apprentissage structurés, accessibles à tous ceux qui souhaitent s'investir dans la renaissance intellectuelle africaine.
              </p>
            </div>
            <div className="bg-[#faf9f6] p-12 lg:p-16 border border-[#d8d5ce] space-y-12">
               <div className="flex gap-8">
                 <span className="text-3xl font-serif text-[#8b6914] opacity-20">01</span>
                 <div>
                   <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] mb-3">Souveraineté Épistémique</h4>
                   <p className="text-sm text-[#767676] leading-relaxed">Apprendre à penser à partir de nos propres centres de gravité culturels et historiques.</p>
                 </div>
               </div>
               <div className="flex gap-8">
                 <span className="text-3xl font-serif text-[#8b6914] opacity-20">02</span>
                 <div>
                   <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] mb-3">Rigueur Académique</h4>
                   <p className="text-sm text-[#767676] leading-relaxed">Une exigence de validation et de vérifiabilité au cœur de chaque module de formation.</p>
                 </div>
               </div>
               <div className="flex gap-8">
                 <span className="text-3xl font-serif text-[#8b6914] opacity-20">03</span>
                 <div>
                   <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] mb-3">Transmission Active</h4>
                   <p className="text-sm text-[#767676] leading-relaxed">Devenir un acteur de la transmission pour assurer la continuité de notre héritage intellectuel.</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-24 lg:py-32 bg-[#faf9f6]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-12 mb-20">
            <div className="flex-1">
              <SectionHeader
                eyebrow="Formations à la une"
                title="Débuter votre parcours"
                subtitle="Sélection de cours fondamentaux pour appréhender le système Ceedo 2.0."
              />
            </div>
            <Link
              to="/courses"
              className="px-6 py-3 border border-[#1a1a1a] text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all whitespace-nowrap"
            >
              Voir tous les cours →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-[4/5] bg-white border border-[#d8d5ce]" />
              ))}
            </div>
          ) : featuredCourses.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-[#d8d5ce]">
               <p className="text-[#767676] italic font-serif">Aucune formation disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {featuredCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Connectivity Block */}
      <section className="py-24 lg:py-32 border-t border-[#d8d5ce]">
        <div className="max-w-4xl mx-auto px-6 text-center">
           <h3 className="text-[10px] uppercase font-bold tracking-[0.4em] text-[#8b6914] mb-12">Une Infrastructure Intégrée</h3>
           <h2 className="text-3xl lg:text-4xl font-serif text-[#1a1a1a] leading-tight mb-10">Apprendre. Chercher. Produire.</h2>
           <p className="text-lg text-[#4a4a4a] leading-relaxed font-serif italic mb-12">
             L'Académie CEEDO est connectée en temps réel au Think Tank. Chaque cours est adossé à des dossiers thématiques, des publications académiques et des archives documentaires.
           </p>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Link to="/dossiers" className="p-10 border border-[#d8d5ce] bg-white group hover:border-[#8b6914] transition-all">
                 <span className="block text-[8px] uppercase font-bold text-[#8b6914] mb-3">Recherche</span>
                 <h4 className="text-xl font-serif font-bold text-[#1a1a1a]">Explorer les Dossiers</h4>
              </Link>
              <Link to="/publications" className="p-10 border border-[#d8d5ce] bg-white group hover:border-[#8b6914] transition-all">
                 <span className="block text-[8px] uppercase font-bold text-[#8b6914] mb-3">Savoir</span>
                 <h4 className="text-xl font-serif font-bold text-[#1a1a1a]">Lire les Publications</h4>
              </Link>
           </div>
        </div>
      </section>
    </main>
  );
}
