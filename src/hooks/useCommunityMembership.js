import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getToken } from '../lib/auth';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL;

/**
 * Checks whether the currently authenticated user is an *active* member of a
 * given community space.
 *
 * Queries the Directus `community_members` collection filtered by:
 *   - user      = current user id
 *   - community = communityId
 *   - status    = 'active'
 *
 * Input:  communityId (string | number) — usually `space.id`
 * Output: { isMember, loading }
 *
 * Behavior:
 *   - If no user is authenticated → isMember = false, loading = false
 *   - If communityId is missing  → isMember = false, loading = false
 *   - On request error           → isMember = false (logged to console)
 */
export function useCommunityMembership(communityId) {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState(null); // 'active' | 'pending' | null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to resolve before deciding.
    if (authLoading) {
      setLoading(true);
      return;
    }

    // Not logged in → no membership.
    if (!user || !communityId) {
      setStatus(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const token = getToken();
    const url = new URL(`${DIRECTUS_URL}/items/community_members`);
    url.searchParams.set(
      'filter',
      JSON.stringify({
        _and: [
          { user: { _eq: user.id } },
          { community: { _eq: communityId } },
        ],
      }),
    );
    url.searchParams.set('fields', 'id,status');
    url.searchParams.set('limit', '1');

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Membership check failed: ${res.status} ${res.statusText}`);
        }
        const json = await res.json();
        return Array.isArray(json?.data) ? json.data : [];
      })
      .then((rows) => {
        if (cancelled) return;
        setStatus(rows[0]?.status ?? null);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(`[useCommunityMembership] community="${communityId}":`, err);
        setStatus(null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, communityId, authLoading]);

  return { isMember: status === 'active', status, loading };
}
