import { useState, useEffect } from 'react';
import { api } from '../lib/api';

/**
 * Fetches a single institutional page by slug from the Directus `pages` collection.
 * Returns { page, loading, error }.
 * page === null means not found (distinct from loading state).
 */
export function useInstitutionalPage(slug) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);
    setPage(null);

    api
      .getPageBySlug(slug)
      .then((data) => {
        if (cancelled) return;
        setPage(data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(`[useInstitutionalPage] Failed to load page "${slug}":`, err);
        setError(err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { page, loading, error };
}
