import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '@services/api'

// ── URL de base API (remplacée par api.js au fichier 10) ───
// ── Clés localStorage ──────────────────────────────────────
const TOKEN_KEY = 'eam_token'
const USER_KEY  = 'eam_user'

function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

// ── Création du contexte ───────────────────────────────────
const AuthContext = createContext(null)

// ── Hook d'utilisation ─────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return ctx
}

// ── Provider ───────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => getStoredUser())
  const [loading, setLoading] = useState(true)  // true au démarrage → vérif token

  // ── Helper : configurer le header Authorization ──
  // ── Au démarrage : restaurer la session depuis localStorage ──
  useEffect(() => {
    const initAuth = async () => {
      const token    = localStorage.getItem(TOKEN_KEY)
      const userData = getStoredUser()

      if (!token || !userData) {
        setLoading(false)
        return
      }

      try {
        // Vérifier que le token est encore valide côté serveur
        const res = await authAPI.me()
        setUser(res.data.user)
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user))
      } catch {
        // Token expiré ou invalide → nettoyer
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // ── LOGIN ──────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const res = await authAPI.login(email, password)
    const { token, user: userData } = res.data

    // Stocker token + user
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setUser(userData)

    return userData
  }, [])

  // ── REGISTER ───────────────────────────────────────────
  const register = useCallback(async ({ prenom, nom, email, password, niveau, objectif }) => {
    const res = await authAPI.register({
      prenom,
      nom,
      email,
      password,
      niveau:   niveau   || 'A1',
      objectif: objectif || 'autre',
    })
    const { token, user: userData } = res.data

    // Connexion automatique après inscription
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setUser(userData)

    return userData
  }, [])

  // ── LOGOUT ─────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.warn('Logout API failed, clearing local session anyway.', error)
    }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  // ── MISE À JOUR du profil utilisateur ──────────────────
  const updateUser = useCallback((updatedData) => {
    const merged = { ...user, ...updatedData }
    localStorage.setItem(USER_KEY, JSON.stringify(merged))
    setUser(merged)
  }, [user])

  // ── Helpers utiles ─────────────────────────────────────
  const isAuthenticated = !!user
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null

  // ── Valeur exposée au contexte ─────────────────────────
  const value = {
    user,
    loading,
    isAuthenticated,
    token,
    login,
    register,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
