import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import SectionHeader from '../components/ui/SectionHeader';
import AdminStatCard from '../components/admin/AdminStatCard';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://admin.projetceedo20.org';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Administration LMS — Projet Ceedo 2.0';
    window.scrollTo(0, 0);
    return () => { document.title = 'Projet Ceedo 2.0'; };
  }, []);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await api.getAdminStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <main className="bg-[#faf9f6] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#8b6914]/20 border-t-[#8b6914] rounded-full animate-spin" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#767676]">Chargement de l'administration...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#faf9f6] min-h-screen">
      <div className="bg-white py-20 border-b border-[#d8d5ce]/30">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader
            eyebrow="Administration"
            title="Tableau de bord LMS"
            subtitle="Gérez l'académie, les demandes d'accès et suivez l'activité des étudiants."
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Section 1 — Population & catalogue */}
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#767676] font-bold mb-4">
          Population & Catalogue
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminStatCard
            title="Étudiants inscrits"
            value={stats?.totalStudents ?? 0}
            icon="👥"
            linkText="Voir les étudiants"
            internalLinkUrl="/admin/users"
          />
          <AdminStatCard
            title="Étudiants actifs"
            value={stats?.activeStudents ?? 0}
            icon="🧑‍🎓"
            linkText="Suivre la progression"
            internalLinkUrl="/admin/progress"
          />
          <AdminStatCard
            title="Total formations"
            value={stats?.totalCourses ?? 0}
            icon="📚"
            linkText="Gérer les formations"
            internalLinkUrl="/admin/courses"
          />
          <AdminStatCard
            title="Formations publiées"
            value={stats?.publishedCourses ?? 0}
            icon="✅"
            linkText="Gérer les formations"
            internalLinkUrl="/admin/courses"
          />
        </div>

        {/* Section 2 — Apprentissage */}
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#767676] font-bold mt-12 mb-4">
          Apprentissage
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminStatCard
            title="Total leçons"
            value={stats?.totalLessons ?? 0}
            icon="📖"
            linkText="Gérer dans Directus"
            linkUrl={`${DIRECTUS_URL}/admin/content/lessons`}
          />
          <AdminStatCard
            title="Leçons complétées"
            value={stats?.completedLessons ?? 0}
            icon="✔️"
            linkText="Suivre la progression"
            internalLinkUrl="/admin/progress"
          />
          <AdminStatCard
            title="Taux de complétion"
            value={`${stats?.completionRate ?? 0}%`}
            icon="📈"
            linkText="Suivre la progression"
            internalLinkUrl="/admin/progress"
          />
          <AdminStatCard
            title="Certificats délivrés"
            value={stats?.certificatesIssued ?? 0}
            icon="🏆"
            linkText="Voir les certificats"
            internalLinkUrl="/admin/certificates"
          />
        </div>

        {/* Section 3 — Accès & monétisation */}
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#767676] font-bold mt-12 mb-4">
          Accès & Premium
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminStatCard
            title="Demandes en attente"
            value={stats?.pendingRequests ?? 0}
            icon="⌛"
            linkText="Voir les demandes"
            internalLinkUrl="/admin/access"
          />
          <AdminStatCard
            title="Inscriptions Premium"
            value={stats?.premiumEnrollments ?? 0}
            icon="💎"
            linkText="Gérer les formations"
            internalLinkUrl="/admin/courses"
          />
        </div>

        <div className="mt-16 bg-white border border-[#d8d5ce] p-8">
          <h2 className="text-xl font-serif font-bold text-[#1a1a1a] mb-6">Actions rapides</h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/admin/courses" className="px-6 py-3 bg-[#1a1a1a] text-white text-[10px] uppercase font-bold tracking-widest hover:bg-[#8b6914] transition-colors">
              Gérer les formations
            </Link>
            <Link to="/admin/users" className="px-6 py-3 border border-[#d8d5ce] text-[#1a1a1a] text-[10px] uppercase font-bold tracking-widest hover:bg-[#faf9f6] transition-colors">
              Suivi des étudiants
            </Link>
            <Link to="/admin/progress" className="px-6 py-3 border border-[#d8d5ce] text-[#1a1a1a] text-[10px] uppercase font-bold tracking-widest hover:bg-[#faf9f6] transition-colors">
              Suivi de progression
            </Link>
            <Link to="/admin/certificates" className="px-6 py-3 border border-[#d8d5ce] text-[#1a1a1a] text-[10px] uppercase font-bold tracking-widest hover:bg-[#faf9f6] transition-colors">
              Certificats
            </Link>
            <Link to="/admin/access" className="px-6 py-3 border border-[#d8d5ce] text-[#1a1a1a] text-[10px] uppercase font-bold tracking-widest hover:bg-[#faf9f6] transition-colors">
              Demandes d'accès
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
