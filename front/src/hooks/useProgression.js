import { useState, useEffect, useCallback } from 'react'
import { progressionAPI } from '@services/api'

const STORAGE_KEY = 'eam_progression'

// ── useProgression — Sync local + API ─────────────────────
export function useProgression() {
  const [progression, setProgression] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  // Persister dans localStorage à chaque mise à jour
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progression))
  }, [progression])

  // ── Marquer une leçon comme complète ──
  const marquerComplete = useCallback(async (leconId, score = 100) => {
    const update = {
      ...progression,
      [leconId]: { complete: true, score, date: new Date().toISOString() }
    }
    setProgression(update)

    // Sync avec l'API en arrière-plan (fire and forget)
    try {
      await progressionAPI.completeLecon(leconId, { score })
    } catch {
      // Silencieux — la progression locale est déjà sauvegardée
    }
  }, [progression])

  // ── Vérifier si une leçon est complète ──
  const estComplete = useCallback((leconId) => {
    return !!progression[leconId]?.complete
  }, [progression])

  // ── Obtenir le score d'une leçon ──
  const getScore = useCallback((leconId) => {
    return progression[leconId]?.score || null
  }, [progression])

  // ── Progression d'un niveau (% de leçons complètes) ──
  const getProgressionNiveau = useCallback((leconIds) => {
    if (!leconIds?.length) return 0
    const faites = leconIds.filter(id => progression[id]?.complete).length
    return Math.round((faites / leconIds.length) * 100)
  }, [progression])

  // ── Réinitialiser la progression locale ──
  const reset = useCallback(() => {
    setProgression({})
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    progression,
    marquerComplete,
    estComplete,
    getScore,
    getProgressionNiveau,
    reset,
  }
}

export default useProgression
