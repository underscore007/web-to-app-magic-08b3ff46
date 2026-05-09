import { useEffect, useMemo, useState } from 'react'
import { chatAPI, withOfflineFallback } from '@services/api'
import { cx, inputClass, levelBadgeClass } from '@utils/ui'

function getInitials(user) {
  const first = user?.prenom?.[0] || '?'
  const last = user?.nom?.[0] || ''
  return `${first}${last}`.trim().toUpperCase()
}

function formatPreview(item) {
  if (!item?.lastMessagePreview) return 'Demarrer une conversation privee.'
  const prefix = item.lastMessageFromSelf ? 'Vous: ' : ''
  const text = `${prefix}${item.lastMessagePreview}`
  return text.length > 74 ? `${text.slice(0, 71)}...` : text
}

function formatMeta(user) {
  return [user?.niveau, user?.objectif].filter(Boolean).join(' · ')
}

function getItemDate(item) {
  return item?.lastMessageAt || item?.updatedAt || item?.createdAt || null
}

function formatRelativeTime(value) {
  if (!value) return 'Nouveau'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Nouveau'

  const diff = Date.now() - date.getTime()
  if (diff < 60 * 1000) return 'maintenant'
  if (diff < 60 * 60 * 1000) return `${Math.max(1, Math.floor(diff / 60000))} min`

  const today = new Date()
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return 'hier'

  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString('fr-FR', { weekday: 'short' })
  }

  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

function ContactCard({ item, active, onClick }) {
  const user = item.user || item
  const isConversation = Object.prototype.hasOwnProperty.call(item, 'lastMessagePreview')
  const meta = formatMeta(user)

  return (
    <button
      type="button"
      className={cx(
        'w-full rounded-[1.45rem] border px-3 py-3 text-left transition',
        active
          ? 'border-brand-blue bg-brand-blue text-white shadow-soft'
          : 'border-transparent bg-white/75 text-brand-text hover:border-brand-blue/20 hover:bg-white'
      )}
      onClick={() => onClick(user)}
    >
      <div className="flex items-start gap-3">
        <div
          className={cx(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold',
            active ? 'bg-white/15 text-white' : 'bg-brand-green/15 text-brand-greenDeep'
          )}
        >
          {getInitials(user)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-semibold">{user?.prenom} {user?.nom}</p>
              <p className={cx('mt-1 truncate text-xs uppercase tracking-[0.16em]', active ? 'text-white/70' : 'text-brand-brown/80')}>
                {meta || 'Apprenant EAM'}
              </p>
            </div>

            <span className={cx('shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em]', active ? 'text-white/75' : 'text-brand-brown/70')}>
              {formatRelativeTime(getItemDate(item))}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            {user?.niveau ? (
              <span className={cx(levelBadgeClass(user.niveau), active && 'bg-white/15 text-white ring-white/20')}>
                {user.niveau}
              </span>
            ) : null}

            <p className={cx('min-w-0 flex-1 truncate text-sm leading-relaxed', active ? 'text-white/82' : 'text-brand-brown')}>
              {isConversation ? formatPreview(item) : meta || 'Demarrer une conversation privee.'}
            </p>
          </div>
        </div>
      </div>
    </button>
  )
}

function DirectInbox({ selectedUserId = null, onSelectUser, refreshToken = 0 }) {
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [users, setUsers] = useState([])
  const [conversations, setConversations] = useState([])

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const query = search.trim()
        const data = await withOfflineFallback(
          () => chatAPI.getDirectUsers(query),
          `eam_direct_users_${query.toLowerCase() || 'all'}`,
          { users: [], conversations: [] }
        )

        if (!active) return
        setUsers(Array.isArray(data?.users) ? data.users : [])
        setConversations(Array.isArray(data?.conversations) ? data.conversations : [])
      } catch {
        if (!active) return
        setUsers([])
        setConversations([])
        setError('Impossible de charger les messages prives.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [search, refreshToken])

  const visibleConversations = useMemo(() => (
    [...conversations].sort((left, right) => {
      const leftDate = new Date(getItemDate(left) || 0).getTime()
      const rightDate = new Date(getItemDate(right) || 0).getTime()
      return rightDate - leftDate
    })
  ), [conversations])

  const suggestedUsers = useMemo(() => {
    const conversationIds = new Set(conversations.map((item) => item.user?.id))
    return users.filter((item) => !conversationIds.has(item.id)).slice(0, 10)
  }, [conversations, users])

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="rounded-[1.55rem] border border-brand-border/70 bg-brand-sky/35 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-blue">Boite de reception</p>
            <p className="mt-2 text-sm leading-relaxed text-brand-brown">
              Recherche un membre ou reprends une conversation la ou tu l as laissee.
            </p>
          </div>

          <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-brown">
            {visibleConversations.length}
          </span>
        </div>

        <label className="mt-3 block">
          <span className="sr-only">Rechercher un membre</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={cx(inputClass, 'bg-white')}
            placeholder="Rechercher un prenom, un nom ou un niveau"
          />
        </label>
      </div>

      {error ? (
        <p className="mt-3 rounded-[1.1rem] bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      ) : null}

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
        {loading ? (
          <div className="grid gap-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-[1.35rem] bg-brand-border/55" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5">
            <div>
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-brown/70">
                  Conversations recentes
                </p>
                <span className="text-xs font-semibold text-brand-brown/70">
                  {visibleConversations.length}
                </span>
              </div>

              <div className="grid gap-2">
                {visibleConversations.length > 0 ? visibleConversations.map((item) => (
                  <ContactCard
                    key={item.user?.id || item.id}
                    item={item}
                    active={selectedUserId === item.user?.id}
                    onClick={onSelectUser}
                  />
                )) : (
                  <p className="rounded-[1.3rem] border border-dashed border-brand-border px-4 py-5 text-sm leading-relaxed text-brand-brown">
                    Aucune conversation privee pour le moment. Ouvre un contact pour lancer le premier message.
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-brown/70">
                  Nouveaux contacts
                </p>
                <span className="text-xs font-semibold text-brand-brown/70">
                  {suggestedUsers.length}
                </span>
              </div>

              <div className="grid gap-2">
                {suggestedUsers.length > 0 ? suggestedUsers.map((item) => (
                  <ContactCard
                    key={item.id}
                    item={item}
                    active={selectedUserId === item.id}
                    onClick={onSelectUser}
                  />
                )) : (
                  <p className="rounded-[1.3rem] border border-dashed border-brand-border px-4 py-5 text-sm leading-relaxed text-brand-brown">
                    Aucun autre membre ne correspond a cette recherche.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default DirectInbox
