import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from './useAuth';

/**
 * Lists the articles authored by the current user (any status).
 * Returns { articles, loading, error, refresh }.
 *
 * Re-fetches automatically when the authenticated user changes.
 */
export function useMyArticles() {
  const { user, loading: authLoading } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      setArticles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMyArticles();
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[useMyArticles] Failed to load:', err);
      setError(err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await refresh();
      if (cancelled) return;
    })();
    return () => { cancelled = true; };
  }, [refresh]);

  return { articles, loading, error, refresh };
}
