import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { getMe, login as loginRequest } from '../api/auth'
import type { AdminUser } from '../api/types'
import { AuthContext, type AuthState } from './AuthContext'
import { clearToken, getToken, setToken, UNAUTHORIZED_EVENT } from './token'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [status, setStatus] = useState<AuthState['status']>(getToken() ? 'loading' : 'anonymous')

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
    setStatus('anonymous')
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { access_token } = await loginRequest(email, password)
    setToken(access_token)
    setUser(await getMe())
    setStatus('authenticated')
  }, [])

  // Restore the session from a stored token on first load
  useEffect(() => {
    if (!getToken()) return
    getMe()
      .then((me) => {
        setUser(me)
        setStatus('authenticated')
      })
      .catch(logout)
  }, [logout])

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout)
  }, [logout])

  const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
