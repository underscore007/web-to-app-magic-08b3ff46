import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@context/AuthContext'
import { gamificationAPI, withOfflineFallback } from '@services/api'

const GamificationContext = createContext(null)

const DEFAULT_DATA = {
  stats: {
    xp: 0,
    level: 1,
    streakCurrent: 0,
    streakBest: 0,
    badgesCount: 0,
  },
  xpWindow: {
    currentLevel: 1,
    current: 0,
    next: 100,
  },
  lessonsCompleted: 0,
  sprechenSessions: 0,
}

export function useGamification() {
  const ctx = useContext(GamificationContext)
  if (!ctx) throw new Error('useGamification doit etre utilise dans GamificationProvider')
  return ctx
}

export function GamificationProvider({ children }) {
  const { user } = useAuth()
  const [data, setData] = useState(DEFAULT_DATA)
  const [loading, setLoading] = useState(false)
  const userId = user?.id

  const refresh = useCallback(async () => {
    if (!userId) {
      setData(DEFAULT_DATA)
      return DEFAULT_DATA
    }

    setLoading(true)
    try {
      const result = await withOfflineFallback(
        () => gamificationAPI.getStats(),
        `eam_gamification_${userId}`,
        DEFAULT_DATA
      )
      setData(result || DEFAULT_DATA)
      return result || DEFAULT_DATA
    } finally {
      setLoading(false)
    }
  }, [userId])

  const addXp = useCallback(async (amount, action = 'manual') => {
    const res = await gamificationAPI.addXp(amount, action)
    await refresh()
    return res.data
  }, [refresh])

  const checkStreak = useCallback(async () => {
    const res = await gamificationAPI.checkStreak()
    await refresh()
    return res.data
  }, [refresh])

  useEffect(() => {
    refresh()
  }, [refresh])

  const value = useMemo(() => ({
    data,
    loading,
    refresh,
    addXp,
    checkStreak,
  }), [addXp, checkStreak, data, loading, refresh])

  return <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>
}

export default GamificationContext
