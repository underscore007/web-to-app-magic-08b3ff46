import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '@context/AuthContext'
import { SOCKET_URL } from '@config/runtime'

// ── useSocketChat ──────────────────────────────────────────
// Gère la connexion Socket.io pour le chat communauté
// Namespace : /chat

export function useSocketChat() {
  const { token } = useAuth()
  const socketRef = useRef(null)

  // ── Connexion au montage ──
  useEffect(() => {
    if (!token) return

    socketRef.current = io(`${SOCKET_URL}/chat`, {
      auth:         { token },
      transports:   ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay:    2000,
    })

    socketRef.current.on('connect', () => {
      console.log('[Chat Socket] Connecté')
    })

    socketRef.current.on('connect_error', (err) => {
      console.error('[Chat Socket] Erreur:', err.message)
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [token])

  // ── Rejoindre un canal ──
  const joinCanal = useCallback((canalId) => {
    socketRef.current?.emit('chat:join', { canalId })
  }, [])

  // ── Quitter un canal ──
  const leaveCanal = useCallback((canalId) => {
    socketRef.current?.emit('chat:leave', { canalId })
  }, [])

  // ── Envoyer un message ──
  const sendMessage = useCallback((canalId, texte) => {
    if (!socketRef.current?.connected) throw new Error('Chat socket indisponible')
    socketRef.current.emit('chat:message', { canalId, texte })
  }, [])

  const sendDirectMessage = useCallback((recipientId, texte) => {
    if (!socketRef.current?.connected) throw new Error('Chat socket indisponible')
    socketRef.current.emit('chat:direct_message', { recipientId, texte })
  }, [])

  // ── Signaler que l'utilisateur tape ──
  const sendTyping = useCallback((canalId) => {
    socketRef.current?.emit('chat:typing', { canalId })
  }, [])

  const sendDirectTyping = useCallback((recipientId) => {
    socketRef.current?.emit('chat:direct_typing', { recipientId })
  }, [])

  // ── Écouter les nouveaux messages ──
  const onMessage = useCallback((cb) => {
    socketRef.current?.on('chat:message', cb)
    return () => socketRef.current?.off('chat:message', cb)
  }, [])

  // ── Écouter les indicateurs de frappe ──
  const onTyping = useCallback((cb) => {
    socketRef.current?.on('chat:typing', cb)
    return () => socketRef.current?.off('chat:typing', cb)
  }, [])

  const onDirectMessage = useCallback((cb) => {
    socketRef.current?.on('chat:direct_message', cb)
    return () => socketRef.current?.off('chat:direct_message', cb)
  }, [])

  const onDirectTyping = useCallback((cb) => {
    socketRef.current?.on('chat:direct_typing', cb)
    return () => socketRef.current?.off('chat:direct_typing', cb)
  }, [])

  // ── Écouter les entrées dans le canal ──
  const onUserJoined = useCallback((cb) => {
    socketRef.current?.on('chat:user_joined', cb)
    return () => socketRef.current?.off('chat:user_joined', cb)
  }, [])

  // ── Écouter les sorties du canal ──
  const onUserLeft = useCallback((cb) => {
    socketRef.current?.on('chat:user_left', cb)
    return () => socketRef.current?.off('chat:user_left', cb)
  }, [])

  // ── Écouter la liste des utilisateurs en ligne ──
  const onOnlineUsers = useCallback((cb) => {
    socketRef.current?.on('chat:online_users', cb)
    return () => socketRef.current?.off('chat:online_users', cb)
  }, [])

  return {
    joinCanal,
    leaveCanal,
    sendMessage,
    sendDirectMessage,
    sendTyping,
    sendDirectTyping,
    onMessage,
    onTyping,
    onDirectMessage,
    onDirectTyping,
    onUserJoined,
    onUserLeft,
    onOnlineUsers,
  }
}

export default useSocketChat
