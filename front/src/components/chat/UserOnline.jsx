import { useState, useEffect } from 'react'
import { useSocketChat } from '@hooks/useSocketChat'

// ── UserOnline ─────────────────────────────────────────────
// Props :
//   canal   — identifiant du canal

function UserOnline({ canal }) {
  const [users, setUsers]   = useState([])
  const [count, setCount]   = useState(0)
  const [show, setShow]     = useState(false)

  const { onOnlineUsers, onUserJoined, onUserLeft } = useSocketChat()

  useEffect(() => {
    // Recevoir la liste initiale
    const unsubscribeOnline = onOnlineUsers(({ canalId, users: u, count: c }) => {
      if (canalId && canalId !== canal) return
      setUsers(u || [])
      setCount(c || 0)
    })

    // Utilisateur entre
    const unsubscribeJoined = onUserJoined(({ canalId, userId, prenom }) => {
      if (canalId && canalId !== canal) return
      setUsers(prev => [...prev.filter(u => u.userId !== userId), { userId, prenom }])
      setCount(prev => prev + 1)
    })

    // Utilisateur sort
    const unsubscribeLeft = onUserLeft(({ canalId, userId }) => {
      if (canalId && canalId !== canal) return
      setUsers(prev => prev.filter(u => u.userId !== userId))
      setCount(prev => Math.max(0, prev - 1))
    })

    return () => {
      unsubscribeOnline?.()
      unsubscribeJoined?.()
      unsubscribeLeft?.()
    }
  }, [canal, onOnlineUsers, onUserJoined, onUserLeft])

  return (
    <div className="relative">
      <button
        className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-white/90 px-3 py-2 text-sm font-semibold text-brand-text shadow-sm transition hover:bg-brand-sky/70"
        onClick={() => setShow(!show)}
        aria-label={`${count} utilisateurs en ligne`}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        <span>{count}</span>
        <span className="text-brand-brown">en ligne</span>
      </button>

      {show && users.length > 0 && (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-30 w-72 rounded-[1.6rem] border border-brand-border/80 bg-white/95 p-4 shadow-panel backdrop-blur">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-brand-blue">
            👥 Eo amin\'ny canal · En ligne
          </p>
          <div className="grid gap-2">
            {users.slice(0, 12).map((u, i) => (
              <div key={u.userId || i} className="flex items-center gap-3 rounded-[1.2rem] bg-brand-sky/50 px-3 py-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green/15 font-display font-semibold text-brand-greenDeep">
                  {u.prenom?.[0]?.toUpperCase() || '?'}
                </div>
                <span className="flex-1 font-medium text-brand-text">{u.prenom}</span>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>
            ))}
            {users.length > 12 && (
              <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-brand-brown">+{users.length - 12} hafa</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default UserOnline
