import axios from 'axios'
import { API_URL, LOGIN_PATH } from '@config/runtime'

// ── Clé localStorage (même que AuthContext) ────────────────
const TOKEN_KEY = 'eam_token'

// ══════════════════════════════════════════════════════════
// INSTANCE AXIOS CENTRALISÉE
// ══════════════════════════════════════════════════════════
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15s — important pour connexions lentes Madagascar
  headers: {
    'Content-Type': 'application/json',
  },
})

// ══════════════════════════════════════════════════════════
// INTERCEPTEUR REQUÊTE — Injecter le token JWT automatiquement
// ══════════════════════════════════════════════════════════
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ══════════════════════════════════════════════════════════
// INTERCEPTEUR RÉPONSE — Gestion erreurs globale
// ══════════════════════════════════════════════════════════
api.interceptors.response.use(
  // Réponse OK → retourner directement les données
  (response) => response,

  // Erreur → traitement centralisé
  (error) => {
    const status = error.response?.status

    // Token expiré → nettoyer et rediriger vers login
    if (status === 401) {
      const isAuthRoute = error.config?.url?.includes('/auth/')
      if (!isAuthRoute) {
        // Token invalide sur une route protégée → déconnexion forcée
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem('eam_user')
        // Redirection sans react-router (hors composant)
        if (window.location.pathname !== LOGIN_PATH) {
          window.location.replace(LOGIN_PATH)
        }
      }
    }

    // 403 Forbidden
    if (status === 403) {
      console.warn('EAM API: Accès refusé (403)')
    }

    // 500+ → Erreur serveur
    if (status >= 500) {
      console.error('EAM API: Erreur serveur', error.response?.data)
    }

    // Timeout ou pas de réseau
    if (error.code === 'ECONNABORTED') {
      error.message = 'Timeout — Vérifiez votre connexion internet'
    }

    if (error.code === 'ERR_NETWORK') {
      error.message = 'Connexion impossible au serveur â€” verifiez le reseau ou la configuration API mobile'
    }

    return Promise.reject(error)
  }
)

// ══════════════════════════════════════════════════════════
// ENDPOINTS AUTH
// ══════════════════════════════════════════════════════════
export const authAPI = {
  login:    (email, password)  => api.post('/auth/login',    { email, password }),
  register: (userData)         => api.post('/auth/register', userData),
  me:       ()                 => api.get('/auth/me'),
  logout:   ()                 => api.post('/auth/logout'),
}

// ══════════════════════════════════════════════════════════
// ENDPOINTS COURS
// ══════════════════════════════════════════════════════════
export const coursAPI = {
  // Liste tous les cours (optionnel: filtrer par niveau)
  getAll:       (niveau)        => api.get('/cours', { params: niveau ? { niveau } : {} }),
  // Détail d'un cours
  getById:      (coursId)       => api.get(`/cours/${coursId}`),
  // Leçons d'un cours
  getLecons:    (coursId)       => api.get(`/cours/${coursId}/lecons`),
  // Détail d'une leçon
  getLecon:     (leconId)       => api.get(`/cours/lecon/${leconId}`),
}

export const adaptiveCoursAPI = {
  startSession: (payload) => api.post('/adaptive-cours/session/start', payload || {}),
  submitAttempt: (sessionId, payload) => api.post(`/adaptive-cours/session/${sessionId}/attempt`, payload || {}),
  finishSession: (sessionId) => api.post(`/adaptive-cours/session/${sessionId}/finish`, {}),
  getRecommendation: () => api.get('/adaptive-cours/recommendation'),
}

// ══════════════════════════════════════════════════════════
// ENDPOINTS PROGRESSION
// ══════════════════════════════════════════════════════════
export const progressionAPI = {
  // Récupérer la progression complète de l'utilisateur
  getAll:       ()              => api.get('/cours/progression'),
  // Récupérer progression d'un cours spécifique
  getCours:     (coursId)       => api.get(`/cours`, { params: { niveau: coursId } }),
  // Marquer une leçon comme complétée
  completeLecon:(leconId, data) => api.post(`/cours/progression/lecon/${leconId}/complete`, data),
  // Sauvegarder résultat d'un exercice
  saveExercice: (exerciceId, data) => api.post(`/cours/progression/exercice/${exerciceId}`, data),
  // Statistiques globales de l'utilisateur
  getStats:     ()              => api.get('/cours/progression/stats'),
}

// ══════════════════════════════════════════════════════════
// ENDPOINTS SPRECHEN
// ══════════════════════════════════════════════════════════
export const sprechenAPI = {
  // Rejoindre la file d'attente de matching
  joinQueue:    (niveau)        => api.post('/sprechen/queue', { niveau }),
  // Quitter la file
  leaveQueue:   ()              => api.delete('/sprechen/queue'),
  // Historique des sessions
  getHistorique:()              => api.get('/sprechen/historique'),
  // Détail d'une session
  getSession:   (sessionId)     => api.get(`/sprechen/session/${sessionId}`),
  // Sauvegarder une session terminée
  saveSession:  (data)          => api.post('/sprechen/session', data),
  // Statistiques spreken
  getStats:     ()              => api.get('/sprechen/stats'),
}

// ══════════════════════════════════════════════════════════
// ENDPOINTS COMMUNAUTÉ / CHAT
// ══════════════════════════════════════════════════════════
export const chatAPI = {
  // Liste des canaux disponibles
  getCanaux:    ()              => api.get('/chat/canaux'),
  // Messages d'un canal (avec pagination)
  getMessages:  (canal, page)   => api.get(`/chat/canaux/${canal}/messages`, { params: { page: page || 1 } }),
  // Envoyer un message (REST fallback si socket ko)
  sendMessage:  (canal, texte)  => api.post(`/chat/canaux/${canal}/messages`, { texte }),
  // Annuaire et conversations privees
  getDirectUsers: (q = '')      => api.get('/chat/direct/users', { params: q ? { q } : {} }),
  getDirectConversations: ()    => api.get('/chat/direct/conversations'),
  getDirectMessages: (userId, page) => api.get(`/chat/direct/${userId}/messages`, { params: { page: page || 1 } }),
  sendDirectMessage: (userId, texte) => api.post(`/chat/direct/${userId}/messages`, { texte }),
}

// ══════════════════════════════════════════════════════════
// ENDPOINTS UTILISATEUR
// ══════════════════════════════════════════════════════════
export const userAPI = {
  // Récupérer le profil
  getProfil:    ()              => api.get('/user/profil'),
  // Mettre à jour le profil
  updateProfil: (data)          => api.put('/user/profil', data),
  // Changer le mot de passe
  changePassword:(data)         => api.put('/user/password', data),
  // Tableau de bord — toutes les données résumées
  getDashboard: ()              => api.get('/user/dashboard'),
}

export const gamificationAPI = {
  getStats:      ()              => api.get('/gamification/stats'),
  addXp:         (amount, action) => api.post('/gamification/xp', { amount, action }),
  checkStreak:   ()              => api.post('/gamification/streak/check'),
  getBadges:     ()              => api.get('/gamification/badges'),
  markBadgeSeen: (badgeId)       => api.post(`/gamification/badge/${badgeId}/vu`),
  getLeaderboard:(limit = 10)    => api.get('/gamification/leaderboard', { params: { limit } }),
}

// ══════════════════════════════════════════════════════════
// HELPER — Gestion offline
// ══════════════════════════════════════════════════════════
export const isOnline = () => navigator.onLine

// Helper pour appels avec fallback localStorage
export const withOfflineFallback = async (apiCall, localKey, fallbackData = null) => {
  if (!isOnline()) {
    const cached = localStorage.getItem(localKey)
    return cached ? JSON.parse(cached) : fallbackData
  }
  try {
    const res = await apiCall()
    // Mettre en cache pour usage offline futur
    localStorage.setItem(localKey, JSON.stringify(res.data))
    return res.data
  } catch {
    const cached = localStorage.getItem(localKey)
    return cached ? JSON.parse(cached) : fallbackData
  }
}

// ══════════════════════════════════════════════════════════
// EXPORT PAR DÉFAUT — instance axios brute si besoin
// ══════════════════════════════════════════════════════════
// ENDPOINTS STATS (public)
export const statsAPI = {
  getOverview: () => api.get('/stats/overview'),
  getTemoignages: (limit = 3) => api.get('/stats/temoignages', { params: { limit } }),
}

export default api
