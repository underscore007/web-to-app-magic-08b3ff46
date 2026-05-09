import { useState } from 'react'
import { cx } from '@utils/ui'

// ── Emojis par catégorie ────────────────────────────────────
const CATEGORIES = [
  {
    id: 'frequent', label: '⭐', nom: 'Fréquent',
    emojis: ['😊','😂','❤️','👍','🙏','🎉','🔥','💯','✅','👏','😍','🤔','😅','💪','🎓'],
  },
  {
    id: 'visages', label: '😊', nom: 'Visages',
    emojis: ['😀','😃','😄','😁','😅','😂','🤣','😊','😇','🥰','😍','🤩','😘','😗','😙','😚','🙂','🤗','🤭','🤫','🤔','🤐','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤑','🤠','😎','🤓','🧐'],
  },
  {
    id: 'mains', label: '👋', nom: 'Mains',
    emojis: ['👋','🤚','✋','🖐','👌','🤌','🤏','✌️','🤞','🖖','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🙏','✍️','💪','🦾'],
  },
  {
    id: 'objets', label: '🎓', nom: 'Objets',
    emojis: ['🎓','📚','✏️','📝','📖','🖊️','📓','🗂️','📋','💡','🔍','🌐','💻','📱','🎤','🔊','📢','✈️','🏠','🏫','⏰','📅','🎯','🏆','⭐','🔥','💯','✅','❌','⚠️','💬','👁️','🇩🇪','🇲🇬','🌍'],
  },
  {
    id: 'nature', label: '🌿', nom: 'Nature',
    emojis: ['🌱','🌿','🌳','🌲','🌴','🌺','🌸','🌼','🌻','🌹','🍀','🍁','🍃','🌾','🎋','🎍','🌵','🌊','⭐','🌙','☀️','🌈','❄️','⛄','🔥','💧','🌊','🌬️','⛅','🌤️'],
  },
]

// ── EmojiPicker ────────────────────────────────────────────
// Léger, sans dépendance externe
// Props :
//   onSelect(emoji) — callback sélection
//   onClose()       — fermer le picker

function EmojiPicker({ onSelect, onClose }) {
  const [catActive, setCatActive] = useState('frequent')
  const [search, setSearch]       = useState('')

  const cat     = CATEGORIES.find(c => c.id === catActive) || CATEGORIES[0]
  const emojis  = search.trim()
    ? CATEGORIES.flatMap(c => c.emojis).filter(e => e.includes(search))
    : cat.emojis

  return (
    <div className="w-[19rem] rounded-[1.7rem] border border-brand-border/80 bg-white/95 p-4 shadow-panel backdrop-blur">
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          className="input-field h-11 flex-1 rounded-[1.1rem] py-2"
          placeholder="🔍 Suchen · Rechercher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
        <button className="inline-flex h-11 w-11 items-center justify-center rounded-[1.1rem] border border-brand-border bg-brand-sky text-brand-brown transition hover:bg-brand-sky/80" onClick={onClose} aria-label="Fermer">✕</button>
      </div>

      {!search && (
        <div className="mb-4 flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              className={cx(
                'inline-flex h-10 w-10 items-center justify-center rounded-full border transition',
                catActive === c.id ? 'border-brand-blue bg-brand-blue text-white' : 'border-brand-border bg-white text-brand-brown hover:bg-brand-sky'
              )}
              onClick={() => setCatActive(c.id)}
              title={c.nom}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid max-h-72 grid-cols-6 gap-2 overflow-y-auto pr-1">
        {emojis.map((emoji, i) => (
          <button
            key={i}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-sky/55 text-xl transition hover:bg-brand-sky"
            onClick={() => onSelect(emoji)}
            title={emoji}
          >
            {emoji}
          </button>
        ))}
        {emojis.length === 0 && (
          <p className="col-span-6 py-4 text-center text-sm font-medium text-brand-brown">Nicht gefunden · Introuvable</p>
        )}
      </div>
    </div>
  )
}

export default EmojiPicker
