import { useState, useEffect } from 'react'
import { useSocketSprechen } from '@hooks/useSocketSprechen'
import { buttonClass, cardClass, cx, levelBadgeClass } from '@utils/ui'

// ── PartnerMatcher ─────────────────────────────────────────
// Gère la file d'attente et le matching de partenaire
// Props :
//   niveau          — niveau de l'utilisateur (ex: 'A1')
//   onMatch(partner)— callback quand un partenaire est trouvé
//   onCancel()      — callback pour annuler

function PartnerMatcher({ niveau = 'A1', onMatch, onCancel }) {
  const [secondes, setSecondes]   = useState(0)
  const [enAttente, setEnAttente] = useState(false)
  const [attente, setAttente]     = useState(0) // nb personnes en attente

  const { joinQueue, leaveQueue, onMatched, onQueueUpdate } = useSocketSprechen()

  // ── Rejoindre la file au montage ──
  useEffect(() => {
    setEnAttente(true)
    setSecondes(0)
    joinQueue(niveau)

    return () => {
      leaveQueue()
    }
  }, [joinQueue, leaveQueue, niveau])

  // ── Compteur de secondes ──
  useEffect(() => {
    if (!enAttente) return
    const timer = setInterval(() => setSecondes(s => s + 1), 1000)
    return () => clearInterval(timer)
  }, [enAttente])

  // ── Écouter le match ──
  useEffect(() => {
    const unsubscribeMatched = onMatched((partner) => {
      setEnAttente(false)
      if (onMatch) onMatch(partner)
    })

    const unsubscribeQueue = onQueueUpdate((count) => {
      setAttente(count)
    })
 
    return () => {
      unsubscribeMatched?.()
      unsubscribeQueue?.()
    }
  }, [onMatched, onQueueUpdate, onMatch])

  const formatTemps = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const handleAnnuler = () => {
    leaveQueue()
    if (onCancel) onCancel()
  }

  return (
    <div className={cx(cardClass.base, 'mx-auto max-w-2xl p-6 text-center sm:p-8')}>
      <div className="relative mx-auto mb-8 flex h-32 w-32 items-center justify-center">
        <span className="absolute h-24 w-24 rounded-full border border-brand-blue/25 animate-ripple" />
        <span className="absolute h-24 w-24 rounded-full border border-brand-blue/15 animate-ripple [animation-delay:0.4s]" />
        <span className="absolute h-24 w-24 rounded-full border border-brand-blue/10 animate-ripple [animation-delay:0.8s]" />
        <span className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-brand-blue text-3xl text-white shadow-panel">👥</span>
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-brand-text">Partner wird gesucht...</h2>
        <p className="text-brand-brown">Recherche d&apos;un partenaire...</p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <span className={levelBadgeClass(niveau)}>{niveau}</span>
        <span className="stat-chip">⏱️ {formatTemps(secondes)}</span>
      </div>

      {attente > 0 && (
        <p className="mt-4 text-sm font-semibold text-brand-brown">👥 {attente} Nutzer warten auf Niveau {niveau}</p>
      )}

      <div className="mt-8 rounded-[1.6rem] bg-brand-sky/55 p-5 text-left">
        <p className="section-kicker">Tipps während der Wartezeit</p>
        <p className="mt-3 text-brand-brown">
          {[
            'Letzte Lektion wiederholen · Révisez la dernière leçon',
            'Begrüßungen üben · Pratiquez les salutations',
            'Neue Wörter lernen · Apprenez de nouveaux mots',
          ][secondes % 3]}
        </p>
      </div>

      <button className={cx(buttonClass.ghost, 'mt-8')} onClick={handleAnnuler}>
        ✕ Abbrechen · Annuler
      </button>
    </div>
  )
}

export default PartnerMatcher
