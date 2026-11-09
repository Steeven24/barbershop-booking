const KEY = 'barbershop.admin_token'

// localStorage can throw (private mode, blocked storage): treat that as logged out
export function getToken(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem(KEY, token)
  } catch {
    // Session still works in memory until the page reloads
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Nothing to clear
  }
}

/** Fired when the API rejects the token, so the app can send the user to login. */
export const UNAUTHORIZED_EVENT = 'auth:unauthorized'
