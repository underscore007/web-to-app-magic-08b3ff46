import { useState, useEffect, useRef } from 'react'
import MicrophoneRecorder from './MicrophoneRecorder'
import CorrectionFeedback from './CorrectionFeedback'
import { useSocketSprechen } from '@hooks/useSocketSprechen'
import { cardClass, cx, levelBadgeClass } from '@utils/ui'

// ── Exercices de session (tirés du niveau) ─────────────────
const EXERCICES_SESSION = [
  { id: 1, type: 'repeter',  texte: 'Guten Morgen, wie geht es Ihnen?', aide: 'Bonjour, comment allez-vous ?' },
  { id: 2, type: 'repondre', texte: 'Wie heißen Sie?', aide: 'Comment vous appelez-vous ?' },
  { id: 3, type: 'repeter',  texte: 'Ich komme aus Madagaskar.', aide: 'Je viens de Madagascar.' },
  { id: 4, type: 'traduire', texte: 'Auf Wiedersehen · Au revoir', aide: 'Au revoir.' },
  { id: 5, type: 'repeter',  texte: 'Vielen Dank für das Gespräch!', aide: 'Merci beaucoup pour la conversation !' },
]

// ── SessionSprechen ────────────────────────────────────────
// Props :
//   partner           — données du partenaire trouvé
//   niveau            — niveau de la session
//   onTerminee(data)  — callback fin de session avec résultats

function SessionSprechen({ partner, niveau = 'A1', onTerminee }) {
  const [exIndex, setExIndex]       = useState(0)
  const [scores, setScores]         = useState([])
  const [correction, setCorrection] = useState(null)
  const [partnerTyping, setPartnerTyping] = useState(false)
  const [duree, setDuree]           = useState(0)
  const timerRef = useRef(null)

  const { sendMessage, onMessage, onPartnerActivity } = useSocketSprechen()

  // ── Timer session ──
  useEffect(() => {
    timerRef.current = setInterval(() => setDuree(d => d + 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  // ── Écouter messages du partenaire ──
  useEffect(() => {
    const unsubscribeMessage = onMessage(() => {
      setPartnerTyping(false)
    })
    const unsubscribeActivity = onPartnerActivity(() => setPartnerTyping(true))

    return () => {
      unsubscribeMessage?.()
      unsubscribeActivity?.()
    }
  }, [onMessage, onPartnerActivity])

  const exerciceActuel = EXERCICES_SESSION[exIndex]

  // ── Résultat micro reçu ──
  const handleMicResult = (texte) => {
    const attendu = exerciceActuel?.texte
    const norm = (t) => t?.toLowerCase().trim()
    const correct = norm(texte) === norm(attendu)
    const nextScores = [...scores, correct ? 1 : 0]

    setCorrection({ texte, correct, attendu })
    setScores(nextScores)

    // Envoyer au partenaire via socket
    sendMessage({ type: 'exercice_result', texte, correct, exId: exerciceActuel?.id })

    // Passer à l'exercice suivant après 1.5s
    setTimeout(() => {
      setCorrection(null)
      if (exIndex < EXERCICES_SESSION.length - 1) {
        setExIndex(exIndex + 1)
      } else {
        // Session terminée
        clearInterval(timerRef.current)
        const scoreTotal = Math.round((nextScores.filter(Boolean).length / EXERCICES_SESSION.length) * 100)
        if (onTerminee) onTerminee({ scores: nextScores, scoreTotal, duree, partner })
      }
    }, 1500)
  }

  const formatDuree = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`

  return (
    <div className={cx(cardClass.base, 'space-y-6 p-6')}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-green/15 font-display text-xl font-semibold text-brand-greenDeep">
            {partner?.prenom?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-display text-xl font-semibold text-brand-text">{partner?.prenom || 'Partenaire'}</p>
            <p className="mt-2">
              <span className={levelBadgeClass(niveau)}>{niveau}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-sm font-semibold text-brand-brown">
          <span className="stat-chip">⏱️ {formatDuree(duree)}</span>
          <span className="stat-chip">{exIndex + 1}/{EXERCICES_SESSION.length}</span>
        </div>
      </div>

      {exerciceActuel && (
        <div className="rounded-[1.8rem] bg-brand-sky/55 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-blue">
            {exerciceActuel.type === 'repeter'  ? '🔁 Wiederholen · Répétez' :
             exerciceActuel.type === 'repondre' ? '💬 Antworten · Répondez' :
             '🌐 Übersetzen · Traduisez'}
          </p>
          <div className="mt-3 font-display text-3xl font-semibold tracking-tight text-brand-text">{exerciceActuel.texte}</div>
          <p className="mt-2 text-brand-brown">{exerciceActuel.aide}</p>

          <div className="mt-6">
            <MicrophoneRecorder
              onResult={handleMicResult}
              langue="de-DE"
              texteAttendu={exerciceActuel.type !== 'repondre' ? exerciceActuel.texte : null}
              disabled={!!correction}
            />
          </div>

          {correction && (
            <div className="mt-6">
              <CorrectionFeedback
                texteReconnu={correction.texte}
                texteAttendu={correction.attendu}
                correct={correction.correct}
              />
            </div>
          )}
        </div>
      )}

      {partnerTyping && (
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-brand-brown shadow-sm">
          <span className="h-2 w-2 rounded-full bg-brand-blue animate-pulse" />
          <span className="h-2 w-2 rounded-full bg-brand-blue animate-pulse [animation-delay:0.2s]" />
          <span className="h-2 w-2 rounded-full bg-brand-blue animate-pulse [animation-delay:0.4s]" />
          <span>{partner?.prenom} spricht...</span>
        </div>
      )}

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${((exIndex) / EXERCICES_SESSION.length) * 100}%` }} />
      </div>
    </div>
  )
}

export default SessionSprechen
