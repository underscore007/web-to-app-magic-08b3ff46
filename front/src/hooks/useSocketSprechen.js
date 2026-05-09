import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '@context/AuthContext'
import { SOCKET_URL } from '@config/runtime'

// ── useSocketSprechen ──────────────────────────────────────
// Gère la connexion Socket.io pour le module Sprechen
// Utilisé par : PartnerMatcher, SessionSprechen

export function useSocketSprechen() {
  const { token }  = useAuth()
  const socketRef  = useRef(null)

  // ── Connexion au montage ──
  useEffect(() => {
    if (!token) return

    socketRef.current = io(`${SOCKET_URL}/sprechen`, {
      auth:         { token },
      transports:   ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay:    2000,
    })

    socketRef.current.on('connect', () => {
      console.log('[Sprechen Socket] Connecté')
    })

    socketRef.current.on('connect_error', (err) => {
      console.error('[Sprechen Socket] Erreur:', err.message)
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [token])

  // ── Rejoindre la file d'attente ──
  const joinQueue = useCallback((niveau) => {
    socketRef.current?.emit('sprechen:join_queue', { niveau })
  }, [])

  // ── Quitter la file ──
  const leaveQueue = useCallback(() => {
    socketRef.current?.emit('sprechen:leave_queue')
  }, [])

  // ── Envoyer un message dans la session ──
  const sendMessage = useCallback((data) => {
    socketRef.current?.emit('sprechen:message', data)
  }, [])

  // ── Signaler activité (typing) ──
  const sendActivity = useCallback(() => {
    socketRef.current?.emit('sprechen:activity')
  }, [])

  // ── Écouter un match trouvé ──
  const onMatched = useCallback((cb) => {
    socketRef.current?.on('sprechen:matched', cb)
    return () => socketRef.current?.off('sprechen:matched', cb)
  }, [])

  // ── Écouter les messages du partenaire ──
  const onMessage = useCallback((cb) => {
    socketRef.current?.on('sprechen:message', cb)
    return () => socketRef.current?.off('sprechen:message', cb)
  }, [])

  // ── Écouter l'activité du partenaire ──
  const onPartnerActivity = useCallback((cb) => {
    socketRef.current?.on('sprechen:partner_activity', cb)
    return () => socketRef.current?.off('sprechen:partner_activity', cb)
  }, [])

  // ── Écouter le nb de personnes en file ──
  const onQueueUpdate = useCallback((cb) => {
    socketRef.current?.on('sprechen:queue_update', cb)
    return () => socketRef.current?.off('sprechen:queue_update', cb)
  }, [])

  // ── Écouter déconnexion partenaire ──
  const onPartnerDisconnect = useCallback((cb) => {
    socketRef.current?.on('sprechen:partner_left', cb)
    return () => socketRef.current?.off('sprechen:partner_left', cb)
  }, [])

  return {
    joinQueue,
    leaveQueue,
    sendMessage,
    sendActivity,
    onMatched,
    onMessage,
    onPartnerActivity,
    onQueueUpdate,
    onPartnerDisconnect,
  }
}

export default useSocketSprechen
