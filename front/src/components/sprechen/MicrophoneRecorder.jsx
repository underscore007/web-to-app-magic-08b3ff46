import { useCallback, useMemo, useState } from 'react'
import { useLang } from '@context/LangContext'
import { normalizeAnswer } from '@utils/normalizeAnswer'
import { useSpeechRecognition } from '@hooks/useSpeechRecognition'
import Icon from '@components/ui/Icon'
import { cx } from '@utils/ui'

// MicrophoneRecorder
// Props:
// - onResult(texte): callback quand la parole est reconnue
// - langue: langue de reconnaissance (default: 'de-DE')
// - texteAttendu: pour la comparaison/correction (optionnel)
// - disabled: desactiver le micro
// - label: texte du bouton (optionnel)
function MicrophoneRecorder({
  onResult,
  langue = 'de-DE',
  texteAttendu = null,
  disabled = false,
  label = null,
}) {
  const { t } = useLang()

  const [resultat, setResultat] = useState('')
  const [correction, setCorrection] = useState(null) // null | 'correct' | 'partiel' | 'incorrect'

  const defaultLabel = useMemo(() => label || t('Sprechen', 'Parler'), [label, t])

  const handleResult = useCallback((texteReconnu) => {
    setResultat(texteReconnu)

    if (texteAttendu) {
      const reconnu = normalizeAnswer(texteReconnu)
      const attendu = normalizeAnswer(texteAttendu)

      if (reconnu && reconnu === attendu) {
        setCorrection('correct')
      } else if (attendu.split(' ').some((mot) => mot && reconnu.includes(mot))) {
        setCorrection('partiel')
      } else {
        setCorrection('incorrect')
      }
    }

    if (onResult) onResult(texteReconnu)
  }, [texteAttendu, onResult])

  const {
    isListening,
    isSupported,
    startListening,
    stopListening,
    error,
  } = useSpeechRecognition({ langue, onResult: handleResult })

  const handleToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      setResultat('')
      setCorrection(null)
      startListening()
    }
  }

  if (!isSupported) {
    return (
      <div className="rounded-[1.4rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        {t(
          'Ihr Browser unterstützt keine Spracherkennung.',
          "Votre navigateur ne supporte pas la reconnaissance vocale."
        )}
        <br />
        <small>{t('Verwenden Sie Chrome oder Edge', 'Utilisez Chrome ou Edge')}</small>
      </div>
    )
  }

  const micLabel = isListening
      ? t('Enregistrement...', 'Enregistrement...')
      : correction
        ? correction === 'correct'
        ? t('Sehr gut!', 'Parfait !')
        : correction === 'partiel'
          ? t('Fast richtig', 'Presque !')
          : t('Noch einmal', 'Réessayez')
      : defaultLabel

  const aria = isListening ? t('Stopp', 'Arrêter') : defaultLabel

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <button
          className={cx(
            'relative z-10 inline-flex h-20 w-20 items-center justify-center rounded-[2rem] border text-white shadow-panel transition',
            isListening && 'border-brand-blue bg-brand-blue',
            !isListening && !correction && 'border-brand-green bg-brand-green',
            correction === 'correct' && 'border-emerald-500 bg-emerald-500',
            correction === 'partiel' && 'border-amber-500 bg-amber-500',
            correction === 'incorrect' && 'border-rose-500 bg-rose-500'
          )}
          onClick={handleToggle}
          disabled={disabled}
          aria-label={aria}
          aria-pressed={isListening}
          type="button"
        >
          <span className="inline-flex">
            {isListening
              ? <Icon name="x" size={18} className="icon" />
              : correction
                ? correction === 'correct'
                  ? <Icon name="check" size={18} className="icon" />
                  : correction === 'partiel'
                    ? <Icon name="star" size={18} className="icon" />
                    : <Icon name="x" size={18} className="icon" />
                : <Icon name="mic" size={18} className="icon" />}
          </span>
        </button>

        {isListening && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <span className="absolute h-20 w-20 rounded-[2rem] border border-brand-blue/30 animate-ripple" />
            <span className="absolute h-20 w-20 rounded-[2rem] border border-brand-blue/20 animate-ripple [animation-delay:0.35s]" />
            <span className="absolute h-20 w-20 rounded-[2rem] border border-brand-blue/10 animate-ripple [animation-delay:0.7s]" />
          </div>
        )}
      </div>

      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-brown">{micLabel}</p>

      {resultat && (
        <div
          className={cx(
            'w-full rounded-[1.4rem] border px-4 py-3 text-sm shadow-sm',
            correction === 'correct' && 'border-emerald-200 bg-emerald-50 text-emerald-700',
            correction === 'incorrect' && 'border-rose-200 bg-rose-50 text-rose-700',
            correction === 'partiel' && 'border-amber-200 bg-amber-50 text-amber-700',
            !correction && 'border-brand-border bg-white text-brand-text'
          )}
        >
          <span className="inline-flex items-center gap-2"><Icon name="messageCircle" size={16} className="icon" /> {resultat}</span>
        </div>
      )}

      {texteAttendu && correction === 'incorrect' && (
        <p className="text-sm text-brand-brown">
          {t('Erwartet', 'Attendu')}: <strong>{texteAttendu}</strong>
        </p>
      )}

      {error && (
        <p className="rounded-[1.2rem] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"><Icon name="warning" size={16} className="icon" /> {error}</p>
      )}
    </div>
  )
}

export default MicrophoneRecorder
