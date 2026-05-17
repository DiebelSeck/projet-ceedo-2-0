import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

/**
 * ArticleCommentsBox displays a thread of editorial comments and allows authorized
 * users to add new ones.
 *
 * Visibility:
 * - internal: Only visible to editorial roles (Reviewer, Editor, Admin)
 * - author_visible: Visible to all, including the author.
 */
export default function ArticleCommentsBox({ articleId, readOnly = false }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const userRole = user?.role?.name || '';
  const isEditorialRole = ['Admin', 'Editor', 'Reviewer'].includes(userRole);

  useEffect(() => {
    if (articleId) loadComments();
  }, [articleId]);

  function isPermissionError(err) {
    return err?.message?.includes('(403)') || err?.message?.includes('403');
  }

  async function loadComments() {
    setLoading(true);
    setPermissionDenied(false);

    try {
      const data = await api.getArticleComments(articleId);

      // Filter internal comments if user is an author
      const filtered = isEditorialRole
        ? data
        : data.filter(c => c.visibility === 'author_visible');

      setComments(filtered);
    } catch (err) {
      if (isPermissionError(err)) {
        setComments([]);
        setPermissionDenied(true);
        return;
      }

      console.error('[ArticleCommentsBox] Load failed:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      await api.createArticleComment({
        article_id: articleId,
        author_id: user.id,
        content: newComment,
        role: userRole.toLowerCase(),
        visibility: isInternal ? 'internal' : 'author_visible'
      });
      setNewComment('');
      loadComments();
    } catch (err) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && comments.length === 0) return (
    <div className="py-8 text-center text-[10px] uppercase font-bold tracking-widest text-[#767676]">
      Chargement de la discussion...
    </div>
  );

  return (
    <div className="bg-[#faf9f6] border border-[#d8d5ce] p-6 lg:p-8">
      <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1a1a1a] mb-8 border-b border-[#d8d5ce] pb-4 flex items-center justify-between">
        Discussion Éditoriale
        <span className="text-[#767676]">{comments.length} message{comments.length > 1 ? 's' : ''}</span>
      </h3>

      {permissionDenied ? (
        <p className="text-sm text-[#767676] italic font-serif text-center py-4">
          Commentaires indisponibles pour votre rôle actuel.
        </p>
      ) : (
        <>
          <div className="space-y-6 mb-8 max-h-[500px] overflow-y-auto pr-4">
            {comments.map((comment) => (
              <div key={comment.id} className={`flex flex-col gap-2 ${comment.visibility === 'internal' ? 'bg-[#fefce8] p-3 border-l-2 border-yellow-400' : ''}`}>
                <div className="flex items-center justify-between text-[9px] uppercase font-bold tracking-widest">
                  <span className={comment.visibility === 'internal' ? 'text-yellow-700' : 'text-[#8b6914]'}>
                    {comment.author_id ? `${comment.author_id.first_name} ${comment.author_id.last_name}` : 'Anonyme'}
                    <span className="ml-2 text-[#767676] opacity-60">({comment.role})</span>
                  </span>
                  <span className="text-[#767676]">
                    {new Date(comment.date_created).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-sm text-[#4a4a4a] leading-relaxed font-serif whitespace-pre-wrap">
                  {comment.content}
                </div>
                {comment.visibility === 'internal' && (
                  <span className="text-[8px] uppercase font-bold text-yellow-600 flex items-center gap-1">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0h-2z" /></svg>
                    Notes internes
                  </span>
                )}
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-sm text-[#767676] italic font-serif text-center py-4">
                Aucun commentaire pour le moment.
              </p>
            )}
          </div>

          {!readOnly && isEditorialRole && (
            <form onSubmit={handleSubmit} className="mt-8 pt-8 border-t border-[#d8d5ce]">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajouter une observation ou une consigne..."
                className="w-full bg-white border border-[#d8d5ce] p-4 text-sm font-serif outline-none focus:border-[#8b6914] min-h-[100px] transition-all"
                required
              />
              <div className="mt-4 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="w-3 h-3 border-[#d8d5ce] text-[#8b6914] focus:ring-[#8b6914]"
                  />
                  <span className="text-[9px] uppercase font-bold tracking-widest text-[#767676] group-hover:text-[#1a1a1a] transition-all">
                    Note interne (invisible pour l'auteur)
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="px-6 py-2.5 bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#8b6914] transition-all disabled:opacity-50"
                >
                  {submitting ? 'Envoi...' : 'Publier'}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
