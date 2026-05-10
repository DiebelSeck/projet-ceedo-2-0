import React, { useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

/**
 * Editorial actions bar for approving, rejecting, or archiving articles.
 * Permissions:
 * - Approve/Archive: Admin, Editor
 * - Request Changes: Admin, Editor, Reviewer
 */
export default function EditorialActions({ article, onActionComplete }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showNotesForm, setShowNotesForm] = useState(false);
  const [notes, setNotes] = useState('');

  const userRole = user?.role?.name || '';
  const canApprove = ['Admin', 'Editor'].includes(userRole);
  const canReview = ['Admin', 'Editor', 'Reviewer'].includes(userRole);

  if (!canReview) return null;

  const handleApprove = async () => {
    if (!window.confirm('Valider cet article ? Il passera en statut "Approuvé" et pourra être publié.')) return;
    setLoading(true);
    try {
      await api.approveArticle(article.id, user.id);
      onActionComplete?.('approved');
    } catch (err) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!window.confirm('Publier cet article officiellement ?')) return;
    setLoading(true);
    try {
      await api.publishArticle(article.id, user.id);
      onActionComplete?.('published');
    } catch (err) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      alert('Veuillez saisir une note pour expliquer les changements requis.');
      return;
    }
    setLoading(true);
    try {
      await api.requestArticleChanges(article.id, notes, user.id);
      onActionComplete?.('revisions');
      setShowNotesForm(false);
      setNotes('');
    } catch (err) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!window.confirm('Archiver cet article ?')) return;
    setLoading(true);
    try {
      await api.archiveArticle(article.id);
      onActionComplete?.('archived');
    } catch (err) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!window.confirm('Restaurer cet article en brouillon ?')) return;
    setLoading(true);
    try {
      await api.restoreArticleToDraft(article.id);
      onActionComplete?.('draft');
    } catch (err) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-t border-[#d8d5ce] py-6 sticky bottom-0 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
      <div className="max-w-4xl mx-auto px-6">
        {!showNotesForm ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#767676]">
                Actions Éditoriales
              </span>
              <div className="h-4 w-px bg-[#d8d5ce]" />
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${article.status === 'review' ? 'bg-[#8b6914]' : 'bg-[#767676]'}`} />
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a]">
                  Statut : {article.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {['draft', 'archived'].includes(article.status) && (
                <button
                  disabled={loading}
                  onClick={handleRestore}
                  className="px-6 py-2.5 border border-[#1a1a1a] text-[10px] font-bold uppercase tracking-widest hover:bg-[#faf9f6] transition-all disabled:opacity-50"
                >
                  Restaurer Brouillon
                </button>
              )}

              {['review', 'approved'].includes(article.status) && (
                <button
                  disabled={loading}
                  onClick={() => setShowNotesForm(true)}
                  className="px-6 py-2.5 border border-[#1a1a1a] text-[10px] font-bold uppercase tracking-widest hover:bg-[#faf9f6] transition-all disabled:opacity-50"
                >
                  Demander des corrections
                </button>
              )}

              {canApprove && article.status === 'review' && (
                <button
                  disabled={loading}
                  onClick={handleApprove}
                  className="px-6 py-2.5 bg-[#8b6914] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#c4965a] transition-all disabled:opacity-50"
                >
                  Approuver l'article
                </button>
              )}

              {canApprove && article.status === 'approved' && (
                <button
                  disabled={loading}
                  onClick={handlePublish}
                  className="px-6 py-2.5 bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#8b6914] transition-all disabled:opacity-50"
                >
                  Publier officiellement
                </button>
              )}

              {canApprove && article.status === 'published' && (
                <button
                  disabled={loading}
                  onClick={handleArchive}
                  className="px-6 py-2.5 border border-red-200 text-red-600 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all disabled:opacity-50"
                >
                  Retirer de la publication
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#8b6914]">
                Motif du retour en brouillon
              </h4>
              <button 
                onClick={() => setShowNotesForm(false)}
                className="text-[10px] uppercase font-bold tracking-widest text-[#767676] hover:text-[#1a1a1a]"
              >
                Annuler
              </button>
            </div>
            <textarea
              autoFocus
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Détaillez les modifications attendues..."
              className="w-full bg-[#faf9f6] border border-[#d8d5ce] p-4 text-sm font-serif outline-none focus:border-[#8b6914] min-h-[100px]"
            />
            <div className="flex justify-end">
              <button
                disabled={loading || !notes.trim()}
                onClick={handleReject}
                className="px-8 py-3 bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#8b6914] transition-all disabled:opacity-50"
              >
                Envoyer au brouillon
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
