import { useState, useEffect, useRef } from 'react'

// ── useOffline — Détection connexion internet ──────────────
// Remplace le mini-hook inline de MainLayout (fichier 4)
// Utilisé aussi dans : Sprechen, AudioPlayer, Lecon
export function useOffline() {
  const [isOnline, setIsOnline]     = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)
  const [showReconnected, setShowReconnected] = useState(false)
  const reconnectTimerRef = useRef(null)

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true)
      // Afficher brièvement "Reconnecté" si on était offline
      if (wasOffline) {
        setShowReconnected(true)
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = setTimeout(() => {
          setShowReconnected(false)
          setWasOffline(false)
        }, 3000)
      }
    }

    const goOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
    }

    window.addEventListener('online',  goOnline,  { passive: true })
    window.addEventListener('offline', goOffline, { passive: true })

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      window.removeEventListener('online',  goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [wasOffline])

  return {
    isOnline,
    isOffline:      !isOnline,
    wasOffline,
    showReconnected,
  }
}

export default useOffline
