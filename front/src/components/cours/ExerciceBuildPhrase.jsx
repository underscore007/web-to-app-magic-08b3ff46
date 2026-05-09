import { useMemo, useState } from 'react'
import { useLang } from '@context/LangContext'
import { normalizeAnswer } from '@utils/normalizeAnswer'
import { cx } from '@utils/ui'
import {
  exerciseBadge,
  exerciseShell,
  explainBox,
  feedbackClass,
  optionBase,
  outlineButton,
  primaryButton,
  questionCard,
  questionText,
  ghostButton,
} from './exerciseUi'

// Exercice "Construction de phrase" (allemand)
function ExerciceBuildPhrase({ data, onValide }) {
  const { lang, t } = useLang()

  const words = Array.isArray(data?.words) ? data.words : []
  const answer = String(data?.answer || '')

  const [chosen, setChosen] = useState([])
  const [remaining, setRemaining] = useState(words)
  const [valide, setValide] = useState(false)
  const [correct, setCorrect] = useState(null)

  const preview = useMemo(() => chosen.join(' '), [chosen])

  const promptTxt = useMemo(() => {
    const de = data?.promptDe || 'Bilde den Satz'
    const fr = data?.promptFr || 'Construis la phrase'
    if (lang === 'mix') return t(de, fr)
    if (lang === 'fr') return fr || de
    return de || fr
  }, [data?.promptDe, data?.promptFr, lang, t])

  const pick = (w, idx) => {
    if (valide) return
    setChosen((p) => [...p, w])
    setRemaining((p) => p.filter((_, i) => i !== idx))
  }

  const undo = () => {
    if (valide) return
    setChosen((p) => {
      const next = [...p]
      const w = next.pop()
      if (w) setRemaining((r) => [...r, w])
      return next
    })
  }

  const reset = () => {
    if (valide) return
    setChosen([])
    setRemaining(words)
  }

  const validate = () => {
    if (valide) return
    const ok = normalizeAnswer(preview) === normalizeAnswer(answer)
    setCorrect(ok)
    setValide(true)
    setTimeout(() => onValide(ok, {
      userAnswer: preview,
      expectedAnswer: answer,
      hintsUsed: 0,
    }), 900)
  }

  return (
    <div className={exerciseShell}>
      <div className={exerciseBadge}>{t('Satz', 'Phrase')}</div>

      <div className={questionCard}>
        <p className={questionText}>{promptTxt}</p>
      </div>

      <div className="rounded-[1.5rem] border border-brand-border/70 bg-white/75 p-4">
        <p className="min-h-[3rem] font-display text-xl text-brand-text">
          <span>{preview || '...'}</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {remaining.map((w, i) => (
          <button
            key={`${w}-${i}`}
            type="button"
            className={cx(optionBase, 'w-auto')}
            onClick={() => pick(w, i)}
            disabled={valide}
          >
            <span>{w}</span>
          </button>
        ))}
      </div>

      {!valide && (
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button className={ghostButton} onClick={undo} disabled={chosen.length === 0} type="button">
            {t('Zurück', 'Annuler')}
          </button>
          <button className={outlineButton} onClick={reset} disabled={chosen.length === 0} type="button">
            Reset
          </button>
          <button className={primaryButton} onClick={validate} disabled={chosen.length === 0} type="button">
            {t('Prüfen', 'Valider')}
          </button>
        </div>
      )}

      {valide && (
        <>
          <div className={feedbackClass(correct)}>
            {correct ? t('Richtig!', 'Correct !') : `${t('Falsch.', 'Faux.')} ${t('Antwort', 'Réponse')}: ${answer}`}
          </div>

          {!correct && (
            <div className={explainBox}>
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-brand-blue">{t('Erklärung', 'Explication')}</div>
              <div className="space-y-2">
                {(data?.meaning?.de || data?.meaning?.fr) && (
                  <div>
                    <strong>{t('Bedeutung', 'Signifie')}:</strong> {t(data.meaning?.de, data.meaning?.fr)}
                  </div>
                )}
                <div>
                  {t(
                    'Tipp: Im Deutschen steht das Verb oft an zweiter Stelle.',
                    'Conseil : en allemand, le verbe est souvent en 2e position.'
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

export default ExerciceBuildPhrase
