import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import InstitutionalPage from './pages/InstitutionalPage'
import PublicationsPage from './pages/PublicationsPage'
import BibliothequePage from './pages/BibliothequePage'
import AcademieIndexPage from './pages/AcademieIndexPage'
import CommunautePage from './pages/CommunautePage'
import EvenementsPage from './pages/EvenementsPage'
import ContactPage from './pages/ContactPage'
import ExplorerIndexPage from './pages/ExplorerIndexPage'
import TagExplorationPage from './pages/TagExplorationPage'
import BibliothequeDetailPage from './pages/BibliothequeDetailPage'
import NotFoundPage from './pages/NotFoundPage'
import CommunityDetailPage from './pages/CommunityDetailPage'
import SubmitArticlePage from './pages/SubmitArticlePage'
import MyArticlesPage from './pages/MyArticlesPage'
import LoginPage from './pages/LoginPage'
import MentionsLegalesPage from './pages/MentionsLegalesPage'
import ConfidentialitePage from './pages/ConfidentialitePage'
import CookiesPage from './pages/CookiesPage'
import AccessibilitePage from './pages/AccessibilitePage'
import ConditionsUtilisationPage from './pages/ConditionsUtilisationPage'
import AcademicPublicationsIndexPage from './pages/AcademicPublicationsIndexPage'
import AcademicPublicationDetailPage from './pages/AcademicPublicationDetailPage'
import PublicationsListPage from './pages/PublicationsListPage'
import PublicationDetailPage from './pages/PublicationDetailPage'
import DossiersIndexPage from './pages/DossiersIndexPage'
import DossierDetailPage from './pages/DossierDetailPage'
import EditorPanelPage from './pages/EditorPanelPage'
import ArticlePreviewPage from './pages/ArticlePreviewPage'
import CoursesListPage from './pages/CoursesListPage'
import DashboardPage from './pages/DashboardPage'
import CourseDetailPage from './pages/CourseDetailPage'
import LessonDetailPage from './pages/LessonDetailPage'
import CertificatesPage from './pages/CertificatesPage'
import CertificateDetailPage from './pages/CertificateDetailPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminAccessPage from './pages/AdminAccessPage'
import AdminCoursesPage from './pages/AdminCoursesPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminStudentDetailPage from './pages/AdminStudentDetailPage'
import AdminCertificatesPage from './pages/AdminCertificatesPage'
import AdminProgressPage from './pages/AdminProgressPage'
import AdminAcademicModerationPage from './pages/AdminAcademicModerationPage'
import RequireEditorialRole from './components/auth/RequireEditorialRole'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />

          {/* Institutional pages — CMS-driven via Directus `pages` collection */}
          <Route path="projet" element={<InstitutionalPage slug="le-projet" eyebrow="Institution" />} />
          <Route path="projet/methodologie" element={<InstitutionalPage slug="methodologie" eyebrow="Cadre Épistémologique" />} />
          <Route path="mentions-legales" element={<MentionsLegalesPage />} />
          <Route path="confidentialite" element={<ConfidentialitePage />} />
          <Route path="cookies" element={<CookiesPage />} />
          <Route path="accessibilite" element={<AccessibilitePage />} />
          <Route path="conditions-utilisation" element={<ConditionsUtilisationPage />} />

          {/* Level 17: Think Tank Infrastructure */}
          <Route path="publications" element={<AcademicPublicationsIndexPage />} />
          <Route path="publications/:slug" element={<AcademicPublicationDetailPage />} />

          {/* /articles — editorial articles surfaced from Directus `articles`.
              Distinct from /publications (Think Tank `publications` collection).
              These two pages were the original list+detail and use the
              api.getArticles / api.getArticleBySlug helpers, which is the same
              source used by the homepage's FeaturedPublications block. */}
          <Route path="articles" element={<PublicationsListPage />} />
          <Route path="articles/:slug" element={<PublicationDetailPage />} />
          
          <Route path="dossiers" element={<DossiersIndexPage />} />
          <Route path="dossiers/:slug" element={<DossierDetailPage />} />
          
          <Route path="library" element={<BibliothequePage />} />
          <Route path="bibliotheque" element={<BibliothequePage />} />
          <Route path="library/:slug" element={<BibliothequeDetailPage />} />
          <Route path="bibliotheque/:slug" element={<BibliothequeDetailPage />} />

          {/* Level 18: Académie CEEDO */}
          <Route path="academie" element={<AcademieIndexPage />} />
          <Route path="courses" element={<CoursesListPage />} />
          <Route path="courses/:slug" element={<CourseDetailPage />} />
          <Route path="courses/:courseSlug/:lessonSlug" element={<LessonDetailPage />} />

          <Route path="explorer" element={<ExplorerIndexPage />} />
          <Route path="explorer/:typeSlug/:tagSlug" element={<TagExplorationPage />} />
          <Route path="communaute" element={<CommunautePage />} />
          <Route path="communaute/:slug" element={<CommunityDetailPage />} />
          <Route path="evenements" element={<EvenementsPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="submit-article" element={<SubmitArticlePage />} />
          <Route path="my-articles" element={<MyArticlesPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="certificates" element={<CertificatesPage />} />
          <Route path="certificates/:id" element={<CertificateDetailPage />} />

          {/* Admin Area — Restricted to Admin & Editor */}
          <Route 
            path="admin" 
            element={
              <RequireEditorialRole allowedRoles={['Admin', 'Editor']}>
                <AdminDashboardPage />
              </RequireEditorialRole>
            } 
          />
          <Route 
            path="admin/access" 
            element={
              <RequireEditorialRole allowedRoles={['Admin', 'Editor']}>
                <AdminAccessPage />
              </RequireEditorialRole>
            } 
          />
          <Route 
            path="admin/courses" 
            element={
              <RequireEditorialRole allowedRoles={['Admin', 'Editor']}>
                <AdminCoursesPage />
              </RequireEditorialRole>
            } 
          />
          <Route
            path="admin/users"
            element={
              <RequireEditorialRole allowedRoles={['Admin', 'Editor']}>
                <AdminUsersPage />
              </RequireEditorialRole>
            }
          />
          <Route
            path="admin/users/:id"
            element={
              <RequireEditorialRole allowedRoles={['Admin', 'Editor']}>
                <AdminStudentDetailPage />
              </RequireEditorialRole>
            }
          />
          <Route
            path="admin/progress"
            element={
              <RequireEditorialRole allowedRoles={['Admin', 'Editor']}>
                <AdminProgressPage />
              </RequireEditorialRole>
            }
          />
          <Route
            path="admin/certificates"
            element={
              <RequireEditorialRole allowedRoles={['Admin', 'Editor']}>
                <AdminCertificatesPage />
              </RequireEditorialRole>
            }
          />
          <Route
            path="admin/academic-moderation"
            element={
              <RequireEditorialRole allowedRoles={['Admin', 'Editor']}>
                <AdminAcademicModerationPage />
              </RequireEditorialRole>
            }
          />

          {/* Editorial Area — Restricted to Editorial Roles */}
          <Route 
            path="editor" 
            element={
              <RequireEditorialRole allowedRoles={['Admin', 'Editor', 'Reviewer']}>
                <EditorPanelPage />
              </RequireEditorialRole>
            } 
          />
          <Route 
            path="editor/articles/:id/preview" 
            element={
              <RequireEditorialRole allowedRoles={['Admin', 'Editor', 'Reviewer']}>
                <ArticlePreviewPage />
              </RequireEditorialRole>
            } 
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
