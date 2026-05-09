import { useCallback, useMemo, useState } from 'react'
import { useLang } from '@context/LangContext'
import Icon from '@components/ui/Icon'
import { buttonClass, cx } from '@utils/ui'

// AudioPlayer - Web Speech API (natif, gratuit, zero dependance)
function AudioPlayer({ texte, langue = 'de-DE', vitesse = 0.85, taille = 'md' }) {
  const { t } = useLang()
  const [playing, setPlaying] = useState(false)
  const supported = useMemo(() => typeof window !== 'undefined' && 'speechSynthesis' in window, [])

  const lire = useCallback(() => {
    if (!supported || !texte) return
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(texte)
    utterance.lang = langue
    utterance.rate = vitesse
    utterance.pitch = 1
    utterance.volume = 1

    const voices = window.speechSynthesis.getVoices()
    const voixAl = voices.find((v) => v.lang && v.lang.startsWith('de'))
    if (voixAl) utterance.voice = voixAl

    utterance.onstart = () => setPlaying(true)
    utterance.onend = () => setPlaying(false)
    utterance.onerror = () => setPlaying(false)

    window.speechSynthesis.speak(utterance)
  }, [texte, langue, vitesse, supported])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setPlaying(false)
  }, [])

  if (!supported) {
    return (
      <p className="text-sm text-amber-700">
        <Icon name="warning" size={16} className="icon" />{' '}
        {t("Audio tsy tohanana amin'ity navigateur ity", 'Audio non supporte sur ce navigateur')}
      </p>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <button
        className={cx(
          taille === 'sm' ? 'inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-blue/25 bg-white text-brand-blue shadow-sm transition hover:bg-brand-sky' : buttonClass.outline,
          playing && 'border-brand-green bg-emerald-50 text-brand-greenDeep'
        )}
        onClick={playing ? stop : lire}
        aria-label={playing ? t('Ajanony', 'Arreter') : `${t('Mihaino', 'Ecouter')}: ${texte}`}
        title={playing ? t('Ajanony', 'Arreter') : t('Ecouter la prononciation', 'Ecouter la prononciation')}
        type="button"
      >
        <span className="inline-flex items-center justify-center">
          {playing ? <Icon name="x" size={18} className="icon" /> : <Icon name="headphones" size={18} className="icon" />}
        </span>
        {taille !== 'sm' && (
          <span>
            {playing ? t('Mijanona', 'Stop') : t('Mihaino', 'Ecouter')}
          </span>
        )}
      </button>

      {playing && (
        <div className="flex items-end gap-1" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className="w-1 rounded-full bg-brand-blue/70 animate-pulse-soft"
              style={{ height: `${12 + i * 4}px`, animationDelay: `${i * 0.08}s` }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default AudioPlayer

