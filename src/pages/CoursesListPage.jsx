import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import SectionHeader from '../components/ui/SectionHeader';
import CourseCard from '../components/academy/CourseCard';

export default function CoursesListPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getCourses();
        setCourses(data);
      } catch (err) {
        console.error('Error loading courses:', err);
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
            eyebrow="Catalogue des Formations"
            title="Parcours d'Apprentissage"
            subtitle="Explorez notre sélection de cours structurés pour approfondir vos connaissances sur les humanités africaines et la recherche souveraine."
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-[4/5] bg-[#faf9f6]" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-[#faf9f6]">
            <p className="text-[#767676] italic font-serif">Aucune formation indexée pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
