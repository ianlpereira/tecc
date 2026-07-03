import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { apiClient } from '../services/apiClient'

interface AuthUser {
  id: number
  username: string
  email: string | null
  full_name: string | null
  role: 'admin' | 'user'
  is_active: boolean
  must_change_password: boolean
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'))
  const [isLoading, setIsLoading] = useState(true)

  // On mount: if there's a stored token, fetch /auth/me to validate it
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token')
    if (!storedToken) {
      setIsLoading(false)
      return
    }
    apiClient
      .get<AuthUser>('/api/v1/auth/me')
      .then((res) => {
        setUser(res.data)
        setToken(storedToken)
      })
      .catch(() => {
        localStorage.removeItem('access_token')
        setToken(null)
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiClient.post<{ access_token: string; user: AuthUser }>(
      '/api/v1/auth/login',
      { username, password }
    )
    const { access_token, user: loggedUser } = res.data
    localStorage.setItem('access_token', access_token)
    setToken(access_token)
    setUser(loggedUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const res = await apiClient.get<AuthUser>('/api/v1/auth/me')
    setUser(res.data)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
