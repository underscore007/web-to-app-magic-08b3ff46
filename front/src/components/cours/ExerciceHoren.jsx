import { useMemo, useState } from 'react'
import { useLang } from '@context/LangContext'
import AudioPlayer from './AudioPlayer'
import { cx } from '@utils/ui'
import {
  exerciseBadge,
  exerciseShell,
  explainBox,
  feedbackClass,
  optionBase,
  optionCorrect,
  optionSelected,
  optionWrong,
  primaryButton,
  questionCard,
  questionText,
} from './exerciseUi'

// Exercice "Horen": ecoute (TTS) puis QCM
function ExerciceHoren({ data, onValide }) {
  const { lang, t } = useLang()

  const [choix, setChoix] = useState(null)
  const [valide, setValide] = useState(false)
  const [correct, setCorrect] = useState(null)

  const options = Array.isArray(data?.options) ? data.options : []
  const correctIndex = typeof data?.correct === 'number' ? data.correct : 0

  const promptTxt = useMemo(() => {
    const de = data?.promptDe || 'Höre zu und antworte'
    const fr = data?.promptFr || 'Ecoute puis reponds'
    if (lang === 'mix') return t(de, fr)
    if (lang === 'fr') return fr || de
    return de || fr
  }, [data?.promptDe, data?.promptFr, lang, t])

  const getOptionLabel = (opt) => {
    if (opt && typeof opt === 'object') {
      if (lang === 'mix') return t(opt.de, opt.fr)
      return lang === 'fr' ? (opt.fr || opt.de) : (opt.de || opt.fr)
    }
    return String(opt ?? '')
  }

  const handleValider = () => {
    if (valide || choix === null) return
    const ok = choix === correctIndex
    setCorrect(ok)
    setValide(true)
    setTimeout(() => onValide(ok, {
      userAnswer: choix == null ? null : getOptionLabel(options[choix]),
      expectedAnswer: getOptionLabel(options[correctIndex]),
      hintsUsed: 0,
    }), 900)
  }

  return (
    <div className={exerciseShell}>
      <div className={exerciseBadge}>Horen</div>

      <div className={questionCard}>
        <p className={questionText}>{promptTxt}</p>
      </div>

      <div className="rounded-[1.4rem] bg-brand-sky/50 p-4">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-brown">{t('Anhören :', 'Écoute :')} {data?.audioText}</p>
        <AudioPlayer texte={data?.audioText} langue="de-DE" />
      </div>

      <div className="grid gap-3">
        {options.map((opt, i) => (
          <button
            key={i}
            className={cx(
              optionBase,
              choix === i && optionSelected,
              valide && i === correctIndex && optionCorrect,
              valide && choix === i && i !== correctIndex && optionWrong
            )}
            onClick={() => !valide && setChoix(i)}
            disabled={valide}
            type="button"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-sky text-sm font-semibold text-brand-text">
              {['A', 'B', 'C', 'D'][i] || ''}
            </span>
            <span>{getOptionLabel(opt)}</span>
          </button>
        ))}
      </div>

      {!valide && (
        <button
          className={cx(primaryButton, 'self-end')}
          onClick={handleValider}
          disabled={choix === null}
          type="button"
        >
          {t('Prüfen', 'Valider')}
        </button>
      )}

      {valide && (
        <>
          <div className={feedbackClass(correct)}>
            {correct
              ? t('Richtig!', 'Correct !')
              : `${t('Falsch.', 'Faux.')} ${t('Antwort', 'Réponse')}: ${getOptionLabel(options[correctIndex])}`}
          </div>

          {!correct && (
            <div className={explainBox}>
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-brand-blue">{t('Erklärung', 'Explication')}</div>
              <div className="space-y-2">
                {data?.audioText && (
                  <div>
                    <strong>{t('Gehört', 'Entendu')}:</strong> {data.audioText}
                  </div>
                )}
                {(data?.meaning?.de || data?.meaning?.fr) && (
                  <div>
                    <strong>{t('Bedeutung', 'Signifie')}:</strong> {t(data.meaning?.de, data.meaning?.fr)}
                  </div>
                )}
                {typeof choix === 'number' && (
                  <div>
                    <strong>{t('Deine Wahl', 'Ton choix')}:</strong> {getOptionLabel(options[choix])}
                  </div>
                )}
                <div>
                  {t(
                    'Tipp: Höre noch einmal zu und achte auf Schlüsselwörter (Guten/Ich/Wie...), bevor du wählst.',
                    'Conseil : réécoute et repère les mots (Guten/Ich/Wie...) avant de choisir.'
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ExerciceHoren
