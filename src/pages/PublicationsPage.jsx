import { Routes, Route } from 'react-router-dom'
import PublicationsListPage from './PublicationsListPage'
import PublicationDetailPage from './PublicationDetailPage'
import AuthorDetailPage from './AuthorDetailPage'
import CorpusDetailPage from './CorpusDetailPage'

export default function PublicationsPage() {
  return (
    <Routes>
      <Route index element={<PublicationsListPage />} />
      <Route path="corpus/:slug" element={<CorpusDetailPage />} />
      <Route path="dossiers/:slug" element={<CorpusDetailPage />} />
      <Route path=":slug" element={<PublicationDetailPage />} />
      <Route path="auteurs/:slug" element={<AuthorDetailPage />} />
    </Routes>
  )
}


