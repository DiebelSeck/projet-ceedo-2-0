import { useState, useEffect } from 'react';
import { api } from '../lib/api';

/**
 * Fetches a community space and its associated events, programs and articles
 * by slug. Returns { space, events, programs, articles, loading, error }.
 * space === null means not found (distinct from loading state).
 */
export function useCommunitySpace(slug) {
  const [space, setSpace] = useState(null);
  const [events, setEvents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [articles, setArticles] = useState([]);
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
    setSpace(null);
    setEvents([]);
    setPrograms([]);
    setArticles([]);

    // Two-step load:
    //   1. Resolve the space first (we need its ID to filter articles).
    //   2. Then in parallel: events (by slug), programs (by slug), articles (by id).
    (async () => {
      try {
        const spaceData = await api.getCommunitySpaceBySlug(slug);
        if (cancelled) return;
        setSpace(spaceData);

        // No space → no related content to fetch. Bail out cleanly.
        if (!spaceData) {
          setLoading(false);
          return;
        }

        const [eventsData, programsData, articlesData] = await Promise.all([
          api.getEventsByCommunity(slug),
          api.getProgramsByCommunity(slug),
          // Articles are an additive feature — if the field/permission isn't
          // there yet, swallow the error rather than break the page.
          api.getArticlesByCommunity(spaceData.id).catch((err) => {
            console.warn(`[useCommunitySpace] Articles unavailable for "${slug}":`, err);
            return [];
          }),
        ]);

        if (cancelled) return;
        setEvents(eventsData);
        setPrograms(programsData);
        setArticles(articlesData);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error(`[useCommunitySpace] Failed to load community "${slug}":`, err);
        setError(err);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { space, events, programs, articles, loading, error };
}
