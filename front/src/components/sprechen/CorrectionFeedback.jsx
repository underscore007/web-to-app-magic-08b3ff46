import AudioPlayer from '@components/cours/AudioPlayer'
import { cx } from '@utils/ui'

// ── CorrectionFeedback ─────────────────────────────────────
// Affiche la correction après reconnaissance vocale
// Props :
//   texteReconnu  — ce que l'utilisateur a dit
//   texteAttendu  — ce qui était attendu
//   correct       — boolean

function CorrectionFeedback({ texteReconnu, texteAttendu, correct }) {
  // Comparer mot par mot pour surligner les erreurs
  const motsReconnus = texteReconnu?.split(' ') || []
  const motsAttendus = texteAttendu?.split(' ') || []

  return (
    <div className={cx('rounded-[1.6rem] border p-4', correct ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50')}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{correct ? '✅' : '❌'}</span>
        <p className="font-display text-xl font-semibold text-brand-text">
          {correct
            ? 'Sehr gut! · Parfait !'
            : 'Nicht ganz richtig · Pas tout à fait'}
        </p>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-blue">🎤 Sie haben gesagt · Vous avez dit :</p>
        <p className="flex flex-wrap gap-1 text-brand-brown">
          {motsReconnus.map((mot, i) => {
            const attenduMot = motsAttendus[i]?.toLowerCase()
            const ok = mot.toLowerCase() === attenduMot
            return (
              <span
                key={i}
                className={cx(
                  'rounded-full px-3 py-1 text-sm font-medium',
                  !correct ? (ok ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700') : 'bg-emerald-100 text-emerald-700'
                )}
              >
                {mot}{' '}
              </span>
            )
          })}
        </p>
      </div>

      {!correct && texteAttendu && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-blue">✅ Erwartet · Il fallait dire :</p>
          <p className="font-display text-lg text-brand-text">{texteAttendu}</p>
          <AudioPlayer texte={texteAttendu} langue="de-DE" taille="sm" />
        </div>
      )}
    </div>
  )
}

export default CorrectionFeedback
