import { useState, useEffect, useCallback } from 'react';
import {
  login as authLogin,
  logout as authLogout,
  getCurrentUser,
  hasToken,
} from '../lib/auth';

/**
 * Reactive authentication hook.
 *
 * Returns:
 *   {
 *     user,              // Directus user object | null
 *     isAuthenticated,   // boolean
 *     loading,           // initial-load flag
 *     login(email, pwd), // promise<user>
 *     logout(),          // promise<void>
 *     refresh(),         // re-fetch /users/me
 *   }
 *
 * On mount, if a token is present in storage it tries to resolve the current
 * user. A failed resolve clears the local session silently.
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!hasToken()) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const me = await getCurrentUser();
      setUser(me);
      return me;
    } catch (err) {
      console.error('[useAuth] Failed to load current user:', err);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await refresh();
      if (cancelled) return;
      // refresh() already updates state; this is just to silence unused-var lint
      void me;
    })();
    return () => { cancelled = true; };
  }, [refresh]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      await authLogin(email, password);
      const me = await getCurrentUser();
      setUser(me);
      return me;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authLogout();
    setUser(null);
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    loading,
    login,
    logout,
    refresh,
  };
}
