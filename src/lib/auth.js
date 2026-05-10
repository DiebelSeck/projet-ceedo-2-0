/**
 * Minimal Directus authentication utility.
 *
 * Persists the access token in localStorage so the session survives page reloads.
 * Refresh-token rotation is intentionally out of scope for this first pass —
 * when the access token expires, the user is logged out and must sign in again.
 */

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL;

const TOKEN_KEY = 'ceedo.directus.access_token';
const REFRESH_KEY = 'ceedo.directus.refresh_token';
const EXPIRES_KEY = 'ceedo.directus.expires_at';

// ─── Storage helpers ─────────────────────────────────────────────────────────

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setSession({ access_token, refresh_token, expires }) {
  try {
    localStorage.setItem(TOKEN_KEY, access_token);
    if (refresh_token) localStorage.setItem(REFRESH_KEY, refresh_token);
    if (expires) localStorage.setItem(EXPIRES_KEY, String(Date.now() + Number(expires)));
  } catch {
    /* localStorage unavailable — session will simply not persist */
  }
}

function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(EXPIRES_KEY);
  } catch { /* noop */ }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Authenticate a user against Directus and persist the access token.
 * Throws on failure with a human-readable message.
 */
export async function login(email, password) {
  if (!DIRECTUS_URL) {
    throw new Error('VITE_DIRECTUS_URL is not set.');
  }

  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    let message = `Authentication failed (${res.status})`;
    try {
      const errJson = await res.json();
      const directusMsg = errJson?.errors?.[0]?.message;
      if (directusMsg) message = directusMsg;
    } catch { /* ignore parse errors */ }
    throw new Error(message);
  }

  const { data } = await res.json();
  setSession(data);
  return data;
}

/**
 * Clear local session. Best-effort: also calls Directus /auth/logout if a
 * refresh token is available, but does not block on the result.
 */
export async function logout() {
  let refresh_token = null;
  try { refresh_token = localStorage.getItem(REFRESH_KEY); } catch { /* noop */ }

  clearSession();

  if (DIRECTUS_URL && refresh_token) {
    // Fire-and-forget: invalidate the refresh token server-side.
    fetch(`${DIRECTUS_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token }),
    }).catch(() => { /* ignore — client session already cleared */ });
  }
}

/**
 * Fetch the currently authenticated user from Directus.
 * Returns the user object on success, or null if unauthenticated/expired.
 * On 401 the local session is automatically cleared.
 */
export async function getCurrentUser() {
  const token = getToken();
  if (!token) return null;
  if (!DIRECTUS_URL) return null;

  const res = await fetch(`${DIRECTUS_URL}/users/me?fields=*,role.name`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401 || res.status === 403) {
    clearSession();
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to load current user (${res.status})`);
  }

  const { data } = await res.json();
  return data;
}

/** True if a token is present in storage (does not validate freshness). */
export function hasToken() {
  return Boolean(getToken());
}

/**
 * Request membership of a community space.
 * Creates a `community_members` row with status="pending" linked to the
 * authenticated user (Directus resolves the user from the bearer token via
 * `$CURRENT_USER` in the collection's create-permission preset).
 *
 * Throws if the user is not authenticated or if Directus rejects the request
 * (e.g. duplicate pending row, missing permissions).
 */
export async function requestMembership(communityId) {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  if (!communityId) throw new Error('communityId is required');
  if (!DIRECTUS_URL) throw new Error('VITE_DIRECTUS_URL is not set.');

  const res = await fetch(`${DIRECTUS_URL}/items/community_members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      community: communityId,
      status: 'pending',
    }),
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const errJson = await res.json();
      const directusMsg = errJson?.errors?.[0]?.message;
      if (directusMsg) message = directusMsg;
    } catch { /* ignore parse errors */ }
    throw new Error(message);
  }

  const json = await res.json();
  return json?.data ?? json;
}
