import { useNavigate, useParams } from 'react-router-dom'
import { cx } from '@utils/ui'

// ── Canaux disponibles ─────────────────────────────────────
const CANAUX = [
  { id: 'general',     emoji: '💬', nom: 'General',         badge: 0 },
  { id: 'a1-a2',       emoji: '🌱', nom: 'A1 & A2',         badge: 0 },
  { id: 'b1-b2',       emoji: '🌳', nom: 'B1 & B2',         badge: 0 },
  { id: 'c1-c2',       emoji: '🏆', nom: 'C1 & C2',         badge: 0 },
  { id: 'ausbildung',  emoji: '🎓', nom: 'Ausbildung',       badge: 2 },
  { id: 'aupair',      emoji: '👶', nom: 'Au Pair',          badge: 0 },
  { id: 'fsj-bfd',     emoji: '🤝', nom: 'FSJ & BFD',        badge: 0 },
  { id: 'visa',        emoji: '✈️', nom: 'Visa & Démarches', badge: 1 },
  { id: 'temoignages', emoji: '⭐', nom: 'Témoignages',      badge: 0 },
]

// ── CanalSelector ─────────────────────────────────────────
// Version compacte utilisable en sidebar mobile ou dropdown
// Props :
//   onSelect(canalId) — callback sélection (optionnel, sinon navigate)
//   compact           — mode compact (moins de padding)

function CanalSelector({ onSelect, compact = false }) {
  const { canal: canalActif = 'general' } = useParams()
  const navigate = useNavigate()

  const handleSelect = (id) => {
    if (onSelect) {
      onSelect(id)
    } else {
      navigate(`/communaute/${id}`)
    }
  }

  return (
    <div className={cx('grid gap-2', compact && 'gap-1')}>
      {CANAUX.map(c => (
        <button
          key={c.id}
          className={cx(
            'flex items-center gap-3 rounded-[1.2rem] px-4 py-3 text-left transition',
            compact ? 'px-3 py-2.5 text-sm' : 'text-sm',
            canalActif === c.id ? 'bg-brand-blue text-white shadow-soft' : 'bg-white/75 text-brand-text hover:bg-brand-sky/65'
          )}
          onClick={() => handleSelect(c.id)}
          aria-current={canalActif === c.id ? 'page' : undefined}
        >
          <span>{c.emoji}</span>
          <span className="flex-1 font-semibold"># {c.nom}</span>
          {c.badge > 0 && (
            <span className={cx('rounded-full px-2 py-1 text-xs font-semibold', canalActif === c.id ? 'bg-white/15 text-white' : 'bg-brand-sky text-brand-brown')}>
              {c.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export default CanalSelector
