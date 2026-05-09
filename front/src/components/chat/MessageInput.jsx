import { useCallback, useEffect, useRef, useState } from 'react'
import EmojiPicker from './EmojiPicker'
import { buttonClass, cx } from '@utils/ui'

function MessageInput({ onSend, sending = false, disabled = false, canal = 'general', onTyping = null }) {
  const [texte, setTexte] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    const field = inputRef.current
    if (!field) return

    field.style.height = '0px'
    field.style.height = `${Math.min(field.scrollHeight, 168)}px`
  }, [texte])

  const handleSend = useCallback(() => {
    if (!texte.trim() || sending || disabled) return
    onSend(texte.trim())
    setTexte('')
    setShowEmoji(false)
    inputRef.current?.focus()
  }, [disabled, onSend, sending, texte])

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const handleEmoji = (emoji) => {
    setTexte((current) => `${current}${emoji}`)
    inputRef.current?.focus()
  }

  return (
    <div className="relative border-t border-brand-border/70 bg-white/92 px-4 py-4 backdrop-blur sm:px-5">
      {showEmoji ? (
        <div className="absolute bottom-[calc(100%+0.75rem)] left-4 z-30 sm:left-5">
          <EmojiPicker onSelect={handleEmoji} onClose={() => setShowEmoji(false)} />
        </div>
      ) : null}

      <div className="rounded-[1.7rem] border border-brand-border/70 bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
        <div className="flex items-end gap-3">
          <button
            type="button"
            className={cx(
              'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-brand-border bg-brand-sky text-xl transition hover:bg-brand-sky/80',
              showEmoji && 'border-brand-blue bg-brand-blue text-white'
            )}
            onClick={() => setShowEmoji((current) => !current)}
            aria-label="Choisir un emoji"
            disabled={disabled}
          >
            😊
          </button>

          <textarea
            ref={inputRef}
            className="min-h-[3.25rem] max-h-40 flex-1 resize-none border-0 bg-transparent px-0 py-2 text-sm leading-relaxed text-brand-text outline-none placeholder:text-brand-brown/45"
            value={texte}
            onChange={(event) => {
              setTexte(event.target.value)
              if (event.target.value.trim()) onTyping?.()
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Ecrire dans ${canal}...`}
            disabled={disabled || sending}
            rows={1}
            maxLength={1000}
            aria-label={`Message dans ${canal}`}
          />

          <button
            type="button"
            className={cx(
              buttonClass.primary,
              'h-12 w-12 shrink-0 rounded-2xl px-0',
              !texte.trim() && 'bg-brand-border text-white hover:translate-y-0 hover:bg-brand-border'
            )}
            onClick={handleSend}
            disabled={!texte.trim() || sending || disabled}
            aria-label="Envoyer le message"
          >
            {sending ? <span className="spinner h-4 w-4" /> : <span>➤</span>}
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-brown/70">
          <span>Enter pour envoyer · Shift+Enter pour une nouvelle ligne</span>
          <span>{texte.length > 850 ? `${texte.length}/1000` : 'max 1000'}</span>
        </div>
      </div>
    </div>
  )
}

export default MessageInput
