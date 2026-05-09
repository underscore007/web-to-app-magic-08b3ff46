import { cx } from '@utils/ui'

function formatHeure(iso) {
  const date = new Date(iso)
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso) {
  const date = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now - date) / 86400000)

  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Hier'

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}

function getInitials(message) {
  const first = message?.prenom?.[0] || '?'
  const last = message?.nom?.[0] || ''
  return `${first}${last}`.trim().toUpperCase()
}

function isGroupedWithPrevious(previous, current, currentUserId) {
  if (!previous || previous.type === 'system' || current.type === 'system') return false

  const previousMine = previous.moi || previous.userId === currentUserId
  const currentMine = current.moi || current.userId === currentUserId
  if (previousMine !== currentMine) return false

  const previousAuthor = previous.userId || `${previous.prenom}-${previous.nom}`
  const currentAuthor = current.userId || `${current.prenom}-${current.nom}`
  if (previousAuthor !== currentAuthor) return false

  const diff = Math.abs(new Date(current.createdAt).getTime() - new Date(previous.createdAt).getTime())
  return diff < 5 * 60 * 1000
}

function EmptyState({ title, copy }) {
  return (
    <div className="flex h-full min-h-[16rem] items-center justify-center">
      <div className="max-w-sm rounded-[1.8rem] border border-dashed border-brand-border bg-white/78 px-6 py-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-brand-blue">Messagerie</p>
        <h4 className="mt-3 font-display text-2xl font-semibold text-brand-text">{title}</h4>
        <p className="mt-3 text-sm leading-relaxed text-brand-brown">{copy}</p>
      </div>
    </div>
  )
}

function TypingIndicator({ label }) {
  return (
    <div className="mt-3 flex items-end gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green/15 font-display font-semibold text-brand-greenDeep">
        ...
      </div>

      <div className="rounded-[1.35rem] rounded-bl-md border border-brand-border/70 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-brown/50" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-brown/50 [animation-delay:120ms]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-brown/50 [animation-delay:240ms]" />
        </div>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-brown/70">{label}</p>
      </div>
    </div>
  )
}

function MessageBubble({ message, moi, compact }) {
  if (message.type === 'system') {
    return (
      <div className="my-5 flex justify-center">
        <span className="rounded-full border border-brand-border bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-brown/75 shadow-sm">
          {message.texte}
        </span>
      </div>
    )
  }

  return (
    <div className={cx('flex gap-3', compact ? 'mt-1.5' : 'mt-4', moi ? 'justify-end' : 'justify-start', !moi && compact && 'pl-[3.25rem]')}>
      {!moi && !compact ? (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green/15 font-display text-sm font-semibold text-brand-greenDeep">
          {getInitials(message)}
        </div>
      ) : null}

      <div className={cx('flex max-w-[84%] flex-col', moi ? 'items-end' : 'items-start')}>
        {!moi && !compact ? (
          <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-brown/80">
            {message.prenom}
          </p>
        ) : null}

        <div
          className={cx(
            'rounded-[1.45rem] px-4 py-3 text-sm leading-relaxed shadow-sm',
            moi
              ? 'rounded-br-md bg-brand-blue text-white'
              : 'rounded-bl-md border border-brand-border/70 bg-white text-brand-text'
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.texte}</p>
        </div>

        {!compact ? (
          <span className={cx('mt-1 px-1 text-[11px] font-semibold uppercase tracking-[0.18em]', moi ? 'text-brand-blue/70' : 'text-brand-brown/65')}>
            {formatHeure(message.createdAt)}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function SkeletonMessage({ align = 'left' }) {
  return (
    <div className={cx('mb-4 flex items-end gap-3', align === 'right' ? 'justify-end' : 'justify-start')}>
      {align === 'left' ? <div className="h-10 w-10 animate-pulse rounded-full bg-brand-border/70" /> : null}
      <div className="flex max-w-[70%] flex-1 flex-col gap-2">
        <div className="h-3 w-16 animate-pulse rounded-full bg-brand-border/60" />
        <div className="h-14 animate-pulse rounded-[1.2rem] bg-brand-border/60" />
      </div>
    </div>
  )
}

function MessageList({
  messages,
  loading,
  hasMore,
  onLoadMore,
  currentUserId,
  bottomRef,
  scrollRef,
  typingLabel = '',
  emptyTitle = 'Aucune conversation',
  emptyCopy = 'Ecris le premier message pour lancer la discussion.',
}) {
  const grouped = messages.reduce((acc, msg) => {
    const date = formatDate(msg.createdAt)
    if (!acc[date]) acc[date] = []
    acc[date].push(msg)
    return acc
  }, {})

  if (loading) {
    return (
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
        {[1, 2, 3, 4, 5].map((item) => (
          <SkeletonMessage key={item} align={item % 2 === 0 ? 'right' : 'left'} />
        ))}
      </div>
    )
  }

  if (!messages.length) {
    return (
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
        <EmptyState title={emptyTitle} copy={emptyCopy} />
        {typingLabel ? <TypingIndicator label={typingLabel} /> : null}
        <div ref={bottomRef} />
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
      {hasMore ? (
        <button
          type="button"
          className="mx-auto mb-5 flex rounded-full border border-brand-border bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-brown shadow-sm transition hover:bg-brand-sky/60"
          onClick={onLoadMore}
        >
          ↑ Messages precedents
        </button>
      ) : null}

      {Object.entries(grouped).map(([date, msgs]) => (
        <div key={date}>
          <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-brown/60">
            <span className="h-px flex-1 bg-brand-border" />
            <span>{date}</span>
            <span className="h-px flex-1 bg-brand-border" />
          </div>

          {msgs.map((msg, index) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              moi={msg.moi || msg.userId === currentUserId}
              compact={isGroupedWithPrevious(msgs[index - 1], msg, currentUserId)}
            />
          ))}
        </div>
      ))}

      {typingLabel ? <TypingIndicator label={typingLabel} /> : null}
      <div ref={bottomRef} />
    </div>
  )
}

export default MessageList
