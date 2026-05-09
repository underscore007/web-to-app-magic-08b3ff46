import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@context/AuthContext'
import { chatAPI, withOfflineFallback } from '@services/api'
import { useSocketChat } from '@hooks/useSocketChat'
import MessageInput from './MessageInput'
import MessageList from './MessageList'

function mergeIncomingMessage(prevMessages, nextMessage, currentUserId) {
  if (prevMessages.some((item) => String(item.id) === String(nextMessage.id))) {
    return prevMessages
  }

  const optimisticIndex = prevMessages.findIndex((item) => (
    String(item.id).startsWith('optimistic-')
      && item.userId === nextMessage.userId
      && item.texte === nextMessage.texte
      && Math.abs(new Date(item.createdAt).getTime() - new Date(nextMessage.createdAt).getTime()) < 15000
  ))

  if (optimisticIndex >= 0) {
    const nextMessages = [...prevMessages]
    nextMessages[optimisticIndex] = {
      ...nextMessage,
      moi: nextMessage.userId === currentUserId,
    }
    return nextMessages
  }

  return [
    ...prevMessages,
    {
      ...nextMessage,
      moi: nextMessage.userId === currentUserId,
    },
  ]
}

function uniqueOlderMessages(olderMessages, currentMessages) {
  const seen = new Set(currentMessages.map((item) => String(item.id)))
  return olderMessages.filter((item) => !seen.has(String(item.id)))
}

function ChatRoom({
  mode = 'public',
  canal = 'general',
  recipient = null,
  recipientId = null,
  onPartnerLoaded = null,
  onConversationActivity = null,
}) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [sending, setSending] = useState(false)
  const [typingLabel, setTypingLabel] = useState('')
  const bottomRef = useRef(null)
  const scrollRef = useRef(null)
  const typingTimerRef = useRef(null)
  const cachedRecipientRef = useRef(recipient || null)
  const autoScrollRef = useRef(true)

  const directTargetId = recipient?.id || recipientId || null
  const roomLabel = useMemo(() => {
    if (mode === 'direct') {
      const partnerName = [recipient?.prenom, recipient?.nom].filter(Boolean).join(' ')
      return partnerName || 'message prive'
    }
    return `#${canal}`
  }, [canal, mode, recipient?.nom, recipient?.prenom])

  const emptyState = mode === 'direct'
    ? {
      title: 'Aucun message pour le moment',
      copy: 'Ecris un premier message pour lancer la conversation privee.',
    }
    : {
      title: 'Canal encore calme',
      copy: 'Partage une question ou une experience pour lancer le canal.',
    }

  const {
    joinCanal,
    leaveCanal,
    sendMessage,
    sendDirectMessage,
    sendTyping,
    sendDirectTyping,
    onMessage,
    onDirectMessage,
    onDirectTyping,
    onUserJoined,
    onUserLeft,
  } = useSocketChat()

  const isNearBottom = () => {
    const container = scrollRef.current
    if (!container) return true
    return container.scrollHeight - container.scrollTop - container.clientHeight < 120
  }

  useEffect(() => {
    if (recipient?.id === directTargetId && recipient) {
      cachedRecipientRef.current = recipient
    }
  }, [directTargetId, recipient])

  useEffect(() => {
    let active = true

    autoScrollRef.current = true
    setMessages([])
    setPage(1)
    setHasMore(true)
    setLoading(true)
    setTypingLabel('')

    const load = async () => {
      try {
        if (mode === 'direct') {
          if (!directTargetId) {
            if (active) {
              setMessages([])
              setHasMore(false)
              setLoading(false)
            }
            return
          }

          const data = await withOfflineFallback(
            () => chatAPI.getDirectMessages(directTargetId, 1),
            `eam_direct_${directTargetId}`,
            { messages: [], partner: cachedRecipientRef.current }
          )

          if (!active) return
          setMessages(data?.messages || [])
          setHasMore((data?.messages?.length || 0) >= 20)
          if (data?.partner) onPartnerLoaded?.(data.partner)
        } else {
          const data = await withOfflineFallback(
            () => chatAPI.getMessages(canal, 1),
            `eam_chat_${canal}`,
            { messages: MOCK_MESSAGES[canal] || MOCK_MESSAGES.general }
          )

          if (!active) return
          setMessages(data?.messages || MOCK_MESSAGES.general)
          setHasMore((data?.messages?.length || 0) >= 20)
        }
      } catch {
        if (!active) return
        setMessages(mode === 'direct' ? [] : (MOCK_MESSAGES[canal] || MOCK_MESSAGES.general))
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [canal, directTargetId, mode, onPartnerLoaded])

  useEffect(() => {
    if (mode !== 'public') return undefined

    joinCanal(canal)
    return () => leaveCanal(canal)
  }, [canal, joinCanal, leaveCanal, mode])

  useEffect(() => {
    const unsubscribeMessage = onMessage((msg) => {
      if (mode !== 'public') return
      if (msg?.canalId && msg.canalId !== canal) return

      autoScrollRef.current = isNearBottom()
      setMessages((prev) => mergeIncomingMessage(prev, msg, user?.id))
    })

    const unsubscribeJoined = onUserJoined((data) => {
      if (mode !== 'public' || data.canalId !== canal) return

      autoScrollRef.current = isNearBottom()
      setMessages((prev) => [...prev, {
        id: `system-join-${data.userId || Date.now()}`,
        type: 'system',
        texte: `${data.prenom} a rejoint le canal`,
        createdAt: new Date().toISOString(),
      }])
    })

    const unsubscribeLeft = onUserLeft((data) => {
      if (mode !== 'public' || data.canalId !== canal) return

      autoScrollRef.current = isNearBottom()
      setMessages((prev) => [...prev, {
        id: `system-left-${data.userId || Date.now()}`,
        type: 'system',
        texte: `${data.prenom} a quitte le canal`,
        createdAt: new Date().toISOString(),
      }])
    })

    const unsubscribeDirectMessage = onDirectMessage((msg) => {
      if (mode !== 'direct' || !directTargetId || !user?.id) return

      const belongsToThread = [msg.userId, msg.recipientId].includes(user.id)
        && [msg.userId, msg.recipientId].includes(directTargetId)

      if (!belongsToThread) return

      autoScrollRef.current = isNearBottom()
      setMessages((prev) => mergeIncomingMessage(prev, msg, user.id))
      onConversationActivity?.()
    })

    const unsubscribeDirectTyping = onDirectTyping((payload) => {
      if (mode !== 'direct' || !directTargetId || payload.userId !== directTargetId) return
      setTypingLabel(`${payload.prenom} est en train d'ecrire...`)
      clearTimeout(typingTimerRef.current)
      typingTimerRef.current = setTimeout(() => setTypingLabel(''), 1600)
    })

    return () => {
      unsubscribeMessage?.()
      unsubscribeJoined?.()
      unsubscribeLeft?.()
      unsubscribeDirectMessage?.()
      unsubscribeDirectTyping?.()
      clearTimeout(typingTimerRef.current)
    }
  }, [
    canal,
    directTargetId,
    mode,
    onConversationActivity,
    onDirectMessage,
    onDirectTyping,
    onMessage,
    onUserJoined,
    onUserLeft,
    user?.id,
  ])

  useEffect(() => {
    if (loading || !autoScrollRef.current) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [loading, messages])

  useEffect(() => {
    if (!typingLabel || !isNearBottom()) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [typingLabel])

  const handleSend = async (texte) => {
    if (!texte.trim() || sending) return
    if (mode === 'direct' && !directTargetId) return

    setSending(true)

    const optimisticMessage = {
      id: `optimistic-${Date.now()}`,
      texte: texte.trim(),
      userId: user?.id,
      recipientId: directTargetId || null,
      prenom: user?.prenom,
      nom: user?.nom,
      createdAt: new Date().toISOString(),
      type: 'message',
      scope: mode === 'direct' ? 'direct' : 'public',
      moi: true,
    }

    autoScrollRef.current = true
    setMessages((prev) => [...prev, optimisticMessage])
    onConversationActivity?.()

    try {
      if (mode === 'direct') {
        sendDirectMessage(directTargetId, texte.trim())
      } else {
        sendMessage(canal, texte.trim())
      }
    } catch {
      try {
        const response = mode === 'direct'
          ? await chatAPI.sendDirectMessage(directTargetId, texte.trim())
          : await chatAPI.sendMessage(canal, texte.trim())

        const persistedMessage = response?.data?.message
        const persistedPartner = response?.data?.partner

        if (persistedPartner) onPartnerLoaded?.(persistedPartner)
        if (persistedMessage?.id) {
          setMessages((prev) => prev.map((item) => (
            item.id === optimisticMessage.id ? { ...persistedMessage, moi: true } : item
          )))
        }
      } catch {
        setMessages((prev) => prev.filter((item) => item.id !== optimisticMessage.id))
      }
    } finally {
      setSending(false)
    }
  }

  const handleLoadMore = async () => {
    if (!hasMore || (mode === 'direct' && !directTargetId)) return

    const container = scrollRef.current
    const previousHeight = container?.scrollHeight || 0
    const previousTop = container?.scrollTop || 0

    try {
      const data = mode === 'direct'
        ? (await chatAPI.getDirectMessages(directTargetId, page + 1)).data
        : (await chatAPI.getMessages(canal, page + 1)).data

      if (mode === 'direct' && data?.partner) onPartnerLoaded?.(data.partner)

      if (data?.messages?.length) {
        autoScrollRef.current = false
        setMessages((prev) => [...uniqueOlderMessages(data.messages, prev), ...prev])
        setPage((current) => current + 1)
        setHasMore(data.messages.length >= 20)

        requestAnimationFrame(() => {
          const currentContainer = scrollRef.current
          if (!currentContainer) return
          currentContainer.scrollTop = previousTop + (currentContainer.scrollHeight - previousHeight)
        })
      } else {
        setHasMore(false)
      }
    } catch {
      setHasMore(false)
    }
  }

  const handleTyping = () => {
    if (mode === 'direct') {
      if (directTargetId) sendDirectTyping(directTargetId)
      return
    }

    sendTyping(canal)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MessageList
        messages={messages}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        currentUserId={user?.id}
        bottomRef={bottomRef}
        scrollRef={scrollRef}
        typingLabel={typingLabel}
        emptyTitle={emptyState.title}
        emptyCopy={emptyState.copy}
      />

      <MessageInput
        onSend={handleSend}
        onTyping={handleTyping}
        sending={sending}
        disabled={loading || (mode === 'direct' && !directTargetId)}
        canal={roomLabel}
      />
    </div>
  )
}

const MOCK_MESSAGES = {
  general: [
    { id: 1, type: 'message', prenom: 'Ravo', nom: 'R.', texte: 'Bonjour tout le monde 👋', createdAt: new Date(Date.now() - 300000).toISOString(), userId: 'u1' },
    { id: 2, type: 'message', prenom: 'Miora', nom: 'M.', texte: 'Tsara misaotra! Vao vita ny lesona A1-5 🎉', createdAt: new Date(Date.now() - 240000).toISOString(), userId: 'u2' },
    { id: 3, type: 'message', prenom: 'Haja', nom: 'H.', texte: 'Nahomby! Aho koa manomana ny Ausbildung any Hamburg 🏙️', createdAt: new Date(Date.now() - 180000).toISOString(), userId: 'u3' },
    { id: 4, type: 'message', prenom: 'Ravo', nom: 'R.', texte: 'Tsara be! Iza no efa manana B2?', createdAt: new Date(Date.now() - 120000).toISOString(), userId: 'u1' },
    { id: 5, type: 'system', texte: 'Miora a rejoint le canal', createdAt: new Date(Date.now() - 60000).toISOString() },
  ],
}

export default ChatRoom
