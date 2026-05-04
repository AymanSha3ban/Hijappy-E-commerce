import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { login as apiLogin } from '../services/api'

interface Admin {
  email: string
}

interface AuthContextType {
  admin: Admin | null
  token: string | null
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('hijappy_token')
    const storedAdmin = localStorage.getItem('hijappy_admin')
    if (storedToken && storedAdmin) {
      setToken(storedToken)
      setAdmin(JSON.parse(storedAdmin))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password)
    const { token, admin } = res.data
    localStorage.setItem('hijappy_token', token)
    localStorage.setItem('hijappy_admin', JSON.stringify(admin))
    setToken(token)
    setAdmin(admin)
  }

  const logout = () => {
    localStorage.removeItem('hijappy_token')
    localStorage.removeItem('hijappy_admin')
    setToken(null)
    setAdmin(null)
  }

  return (
    <AuthContext.Provider
      value={{ admin, token, isAdmin: !!admin, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
