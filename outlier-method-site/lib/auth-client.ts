// Beta-tester session token lives in sessionStorage, not a cookie — cookies
// are shared across every tab in the browser and only clear when the whole
// browser process quits. sessionStorage is genuinely per-tab: opening a new
// tab (even to the same site) starts with no token, and closing the tab
// discards it. authFetch attaches it as a bearer header on every request.

const TOKEN_KEY = "ads_user_token";

export function getUserToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(TOKEN_KEY);
}

export function setUserToken(token: string): void {
  window.sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearUserToken(): void {
  window.sessionStorage.removeItem(TOKEN_KEY);
}

export function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = getUserToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
