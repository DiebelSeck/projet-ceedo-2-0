import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import SectionHeader from '../components/ui/SectionHeader';
import AdminStatCard from '../components/admin/AdminStatCard';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://admin.projetceedo20.org';
const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_ENROLLMENTS_FOR_RANKING = 3;

const ALERT_STYLES = {
  critical: 'bg-red-50 border-red-200 text-red-800',
  warning:  'bg-yellow-50 border-yellow-200 text-yellow-800',
  info:     'bg-blue-50 border-blue-200 text-blue-800',
};

const ALERT_BADGE = {
  critical: { label: 'Critique', className: 'bg-red-100 text-red-700' },
  warning:  { label: 'Attention', className: 'bg-yellow-100 text-yellow-700' },
  info:     { label: 'Info', className: 'bg-blue-100 text-blue-700' },
};

function CourseRow({ rank, course, tone }) {
  const barColor = tone === 'risk' ? 'bg-red-500' : 'bg-[#8b6914]';
  return (
    <div className="flex items-center gap-4 py-3 border-b border-[#e8e6e1] last:border-b-0">
      <div className="w-6 text-[10px] uppercase tracking-widest font-bold text-[#767676]">#{rank}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-serif text-[#1a1a1a] truncate">{course.title}</div>
        <div className="text-[11px] text-[#767676] mt-0.5">
          {course.enrollmentCount} inscription{course.enrollmentCount > 1 ? 's' : ''}
          {course.isPaid ? ' · Premium' : ''}
        </div>
      </div>
      <div className="w-32 flex items-center gap-2">
        <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
          <div className={`${barColor} h-full`} style={{ width: `${course.averageProgress}%` }} />
        </div>
        <span className="text-[11px] font-bold text-[#4a4a4a] w-10 text-right">{course.averageProgress}%</span>
      </div>
    </div>
  );
}

function AlertItem({ severity, title, detail }) {
  const badge = ALERT_BADGE[severity] || ALERT_BADGE.info;
  return (
    <div className={`p-4 border ${ALERT_STYLES[severity] || ALERT_STYLES.info}`}>
      <div className="flex items-start gap-3">
        <span className={`shrink-0 inline-block px-2 py-0.5 text-[9px] uppercase tracking-widest font-bold ${badge.className}`}>
          {badge.label}
        </span>
        <div className="flex-1">
          <div className="text-sm font-bold text-[#1a1a1a]">{title}</div>
          <div className="text-[12px] mt-1">{detail}</div>
        </div>
      </div>
    </div>
  );
}

function PlaceholderCard({ message = 'Données indisponibles' }) {
  return (
    <div className="bg-white border border-dashed border-[#d8d5ce] p-8 text-center text-[#767676] font-serif italic">
      {message}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState(null);
  const [usersOverview, setUsersOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [partialErrors, setPartialErrors] = useState([]);

  useEffect(() => {
    document.title = 'Administration LMS — Projet Ceedo 2.0';
    window.scrollTo(0, 0);
    return () => { document.title = 'Projet Ceedo 2.0'; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      setLoading(true);
      const settled = await Promise.allSettled([
        api.getAdminStats(),
        api.getAdminProgressOverview(),
        api.getAdminUsersLearningOverview(),
      ]);
      if (cancelled) return;

      const errors = [];
      const [statsRes, progressRes, usersRes] = settled;

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      } else {
        errors.push({ name: 'stats', message: statsRes.reason?.message || 'getAdminStats failed' });
      }

      if (progressRes.status === 'fulfilled') {
        setProgress(Array.isArray(progressRes.value) ? progressRes.value : []);
      } else {
        errors.push({ name: 'progress', message: progressRes.reason?.message || 'getAdminProgressOverview failed' });
      }

      if (usersRes.status === 'fulfilled') {
        setUsersOverview(Array.isArray(usersRes.value) ? usersRes.value : []);
      } else {
        errors.push({ name: 'users', message: usersRes.reason?.message || 'getAdminUsersLearningOverview failed' });
      }

      setPartialErrors(errors);
      setLoading(false);
    }
    loadAll();
    return () => { cancelled = true; };
  }, []);

  // Activity windows (7d / 30d / 90d). Derived from progressOverview timestamps.
  const activity = useMemo(() => {
    if (!progress) return null;
    const now = Date.now();
    const c7  = now -  7 * DAY_MS;
    const c30 = now - 30 * DAY_MS;
    const c90 = now - 90 * DAY_MS;
    const lastByUser = new Map();
    for (const r of progress) {
      const uid = r?.user_id?.id;
      if (!uid) continue;
      const tStart = r.started_at   ? Date.parse(r.started_at)   : 0;
      const tEnd   = r.completed_at ? Date.parse(r.completed_at) : 0;
      const ts = Math.max(tStart || 0, tEnd || 0);
      if (ts > (lastByUser.get(uid) || 0)) lastByUser.set(uid, ts);
    }
    let a7 = 0, a30 = 0, a90 = 0;
    for (const ts of lastByUser.values()) {
      if (ts >= c7)  a7  += 1;
      if (ts >= c30) a30 += 1;
      if (ts >= c90) a90 += 1;
    }
    return { a7, a30, a90 };
  }, [progress]);

  // Per-course aggregation.
  const courses = useMemo(() => {
    if (!progress) return null;
    const byId = new Map();
    for (const r of progress) {
      const cid = r?.course_id?.id;
      if (!cid) continue;
      let entry = byId.get(cid);
      if (!entry) {
        entry = {
          id: cid,
          title: r.course_id?.title || 'Sans titre',
          isPaid: Boolean(r.course_id?.is_paid),
          sum: 0,
          count: 0,
        };
        byId.set(cid, entry);
      }
      const pct = Number.isFinite(r?.progress_percentage) ? r.progress_percentage : 0;
      entry.sum += pct;
      entry.count += 1;
    }
    const all = Array.from(byId.values()).map(e => ({
      id: e.id,
      title: e.title,
      isPaid: e.isPaid,
      enrollmentCount: e.count,
      averageProgress: e.count > 0 ? Math.round(e.sum / e.count) : 0,
    }));
    const eligible = all.filter(c => c.enrollmentCount >= MIN_ENROLLMENTS_FOR_RANKING);
    const top  = [...eligible].sort((a, b) => b.averageProgress - a.averageProgress).slice(0, 3);
    const risk = [...eligible].sort((a, b) => a.averageProgress - b.averageProgress).slice(0, 3);
    return { all, eligible, top, risk, coursesWithEnrollments: byId.size };
  }, [progress]);

  // Global pending certificates — sum of pendingCertCount across users.
  const globalPendingCertCount = useMemo(() => {
    if (!usersOverview) return null;
    return usersOverview.reduce(
      (n, u) => n + (Number.isFinite(u?.pendingCertCount) ? u.pendingCertCount : 0),
      0,
    );
  }, [usersOverview]);

  // Inactive completers — users with completed_count > 0 but !active30d.
  const inactiveCompletersCount = useMemo(() => {
    if (!usersOverview) return null;
    let n = 0;
    for (const u of usersOverview) {
      if ((u?.completed_count || 0) > 0 && !u?.active30d) n += 1;
    }
    return n;
  }, [usersOverview]);

  // Empty-participation courses — courses with zero enrollments.
  const emptyCoursesCount = useMemo(() => {
    if (!stats || !courses) return null;
    const total = stats.totalCourses ?? 0;
    return Math.max(0, total - courses.coursesWithEnrollments);
  }, [stats, courses]);

  // Composed alerts (max 5, priority order: critical → warning → info).
  const alerts = useMemo(() => {
    const out = [];
    if (courses?.eligible) {
      const severe = courses.eligible.filter(c => c.averageProgress < 15);
      if (severe.length > 0) {
        out.push({
          severity: 'critical',
          title: 'Formations gravement en retard',
          detail: `${severe.length} formation${severe.length > 1 ? 's' : ''} avec une progression moyenne inférieure à 15 %.`,
        });
      }
    }
    if (globalPendingCertCount != null && globalPendingCertCount > 0) {
      out.push({
        severity: 'warning',
        title: 'Certificats en attente',
        detail: `${globalPendingCertCount} certificat${globalPendingCertCount > 1 ? 's' : ''} prêt${globalPendingCertCount > 1 ? 's' : ''} à délivrer manuellement.`,
      });
    }
    if (courses?.eligible) {
      const low = courses.eligible.filter(c => c.averageProgress >= 15 && c.averageProgress < 30);
      if (low.length > 0) {
        out.push({
          severity: 'warning',
          title: 'Formations à faible progression',
          detail: `${low.length} formation${low.length > 1 ? 's' : ''} avec une progression moyenne entre 15 % et 30 %.`,
        });
      }
    }
    if (inactiveCompletersCount != null && inactiveCompletersCount > 0) {
      out.push({
        severity: 'info',
        title: 'Étudiants inactifs avec formations complétées',
        detail: `${inactiveCompletersCount} étudiant${inactiveCompletersCount > 1 ? 's' : ''} ont complété au moins une formation mais ne sont plus actifs sur les 30 derniers jours.`,
      });
    }
    if (emptyCoursesCount != null && emptyCoursesCount > 0) {
      out.push({
        severity: 'info',
        title: 'Formations sans inscriptions',
        detail: `${emptyCoursesCount} formation${emptyCoursesCount > 1 ? 's' : ''} publiée${emptyCoursesCount > 1 ? 's' : ''} sans aucune inscription.`,
      });
    }
    return out.slice(0, 5);
  }, [courses, globalPendingCertCount, inactiveCompletersCount, emptyCoursesCount]);

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
        {partialErrors.length > 0 && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 text-[12px] text-yellow-800" role="alert">
            <span className="font-bold uppercase tracking-widest text-[10px] mr-2">Données partielles chargées</span>
            Sections affectées : {partialErrors.map(e => e.name).join(', ')}.
          </div>
        )}

        {/* Section 1 — Population & catalogue */}
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#767676] font-bold mb-4">
          Population & Catalogue
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminStatCard
            title="Comptes utilisateurs"
            value={stats?.totalStudents ?? 0}
            icon="👥"
            linkText="Voir les étudiants"
            internalLinkUrl="/admin/users"
          />
          <AdminStatCard
            title="Actifs (30j)"
            value={stats?.activeStudents30d ?? 0}
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
            title="Progression moyenne"
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

        {/* Section 4 — Activité Académique */}
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#767676] font-bold mt-12 mb-4">
          Activité Académique
        </h2>
        {activity ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AdminStatCard title="Actifs (7j)"  value={activity.a7}  icon="🔥" linkText="Voir la progression" internalLinkUrl="/admin/progress" />
            <AdminStatCard title="Actifs (30j)" value={activity.a30} icon="📅" linkText="Voir la progression" internalLinkUrl="/admin/progress" />
            <AdminStatCard title="Actifs (90j)" value={activity.a90} icon="🗓️" linkText="Voir la progression" internalLinkUrl="/admin/progress" />
          </div>
        ) : (
          <PlaceholderCard message="Activité indisponible — la vue Suivi de progression n'a pas pu être chargée." />
        )}

        {/* Section 5 — Top Formations */}
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#767676] font-bold mt-12 mb-4">
          Top Formations
        </h2>
        {!courses ? (
          <PlaceholderCard message="Classement indisponible." />
        ) : courses.top.length === 0 ? (
          <PlaceholderCard message={`Pas assez de données — minimum ${MIN_ENROLLMENTS_FOR_RANKING} inscriptions par formation requis.`} />
        ) : (
          <div className="bg-white border border-[#d8d5ce] p-4">
            {courses.top.map((c, i) => (
              <CourseRow key={c.id} rank={i + 1} course={c} tone="top" />
            ))}
          </div>
        )}

        {/* Section 6 — Formations à risque */}
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#767676] font-bold mt-12 mb-4">
          Formations à risque
        </h2>
        {!courses ? (
          <PlaceholderCard message="Classement indisponible." />
        ) : courses.risk.length === 0 ? (
          <PlaceholderCard message={`Pas assez de données — minimum ${MIN_ENROLLMENTS_FOR_RANKING} inscriptions par formation requis.`} />
        ) : (
          <div className="bg-white border border-[#d8d5ce] p-4">
            {courses.risk.map((c, i) => (
              <CourseRow key={c.id} rank={i + 1} course={c} tone="risk" />
            ))}
          </div>
        )}

        {/* Section 7 — Alertes Académiques */}
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#767676] font-bold mt-12 mb-4">
          Alertes Académiques
        </h2>
        {alerts.length === 0 ? (
          <PlaceholderCard message="Aucune alerte académique pour le moment." />
        ) : (
          <div className="flex flex-col gap-3">
            {alerts.map((a, i) => (
              <AlertItem key={i} severity={a.severity} title={a.title} detail={a.detail} />
            ))}
          </div>
        )}

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
