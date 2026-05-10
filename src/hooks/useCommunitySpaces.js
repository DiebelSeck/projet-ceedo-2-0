import { useState, useEffect } from 'react';
import { api } from '../lib/api';

/**
 * Fetches the list of public + members community spaces from Directus.
 * Private spaces are excluded server-side via the API filter.
 * Returns { spaces, loading, error }.
 */
export function useCommunitySpaces() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    api.getCommunitySpaces()
      .then((data) => {
        if (cancelled) return;
        setSpaces(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[useCommunitySpaces] Failed to load community spaces:', err);
        setError(err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { spaces, loading, error };
}
