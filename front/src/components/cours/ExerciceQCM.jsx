import { useCallback, useMemo, useState } from 'react'
import { useLang } from '@context/LangContext'
import { normalizeAnswer } from '@utils/normalizeAnswer'
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

// Exercice QCM - Choix multiple (DE/FR/MIX)
function ExerciceQCM({ data, onValide }) {
  const { lang, t } = useLang()

  const [choix, setChoix] = useState(null)
  const [valide, setValide] = useState(false)
  const [correct, setCorrect] = useState(null)

  const options = useMemo(() => (Array.isArray(data?.options) ? data.options : []), [data?.options])

  const getOptionLabel = useCallback((opt) => {
    if (opt && typeof opt === 'object') {
      if (lang === 'mix') return t(opt.de, opt.fr)
      return lang === 'fr' ? (opt.fr || opt.de) : (opt.de || opt.fr)
    }
    return String(opt ?? '')
  }, [lang, t])

  const questionTxt = useMemo(() => {
    const qDe = data?.questionDe || data?.question
    const qFr = data?.questionFr
    if (lang === 'mix') return t(qDe, qFr)
    if (lang === 'fr') return qFr || qDe
    return qDe || qFr
  }, [data?.question, data?.questionDe, data?.questionFr, lang, t])

  const correctIndex = useMemo(() => {
    if (typeof data?.reponse === 'number') return data.reponse

    // Compat: data.reponseTexte can be a MG/FR string; match against any option field.
    if (data?.reponseTexte) {
      const target = normalizeAnswer(data.reponseTexte)
      for (let i = 0; i < options.length; i++) {
        const opt = options[i]
        if (opt && typeof opt === 'object') {
          if (normalizeAnswer(opt.de) === target) return i
          if (normalizeAnswer(opt.fr) === target) return i
        }
        if (normalizeAnswer(getOptionLabel(opt)) === target) return i
      }
    }

    return null
  }, [data?.reponse, data?.reponseTexte, getOptionLabel, options])

  const handleValider = () => {
    if (choix === null || valide) return

    let ok = false
    if (typeof correctIndex === 'number') {
      ok = choix === correctIndex
    } else if (data?.reponseTexte) {
      const picked = options[choix]
      const target = normalizeAnswer(data.reponseTexte)
      if (picked && typeof picked === 'object') {
        ok = normalizeAnswer(picked.de) === target || normalizeAnswer(picked.fr) === target
      } else {
        ok = normalizeAnswer(getOptionLabel(picked)) === target
      }
    }

    setCorrect(ok)
    setValide(true)
    const pickedLabel = choix != null ? getOptionLabel(options[choix]) : null
    const expectedLabel = typeof correctIndex === 'number' ? getOptionLabel(options[correctIndex]) : null
    setTimeout(() => onValide(ok, {
      userAnswer: pickedLabel,
      expectedAnswer: expectedLabel,
      hintsUsed: 0,
    }), 900)
  }

  const feedbackTxt = useMemo(() => {
    if (!valide) return null
    if (correct) return t('Richtig!', 'Correct !')

    if (typeof correctIndex === 'number') {
      const label = getOptionLabel(options[correctIndex])
      return `${t('Falsch.', 'Faux.')} ${t('Antwort', 'Réponse')}: ${label}`
    }
    return t('Falsch.', 'Faux.')
  }, [correct, correctIndex, getOptionLabel, options, t, valide])

  return (
    <div className={exerciseShell}>
      <div className={exerciseBadge}>QCM</div>

      <div className={questionCard}>
        <p className={questionText}>{questionTxt}</p>
      </div>

      <div className="grid gap-3">
        {options.map((opt, i) => (
          <button
            key={i}
            className={cx(
              optionBase,
              choix === i && optionSelected,
              valide && typeof correctIndex === 'number' && i === correctIndex && optionCorrect,
              valide && typeof correctIndex === 'number' && choix === i && i !== correctIndex && optionWrong
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
            {feedbackTxt}
          </div>

          {!correct && (
            <div className={explainBox}>
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-brand-blue">{t('Erklärung', 'Explication')}</div>
              <div className="space-y-2">
                {data?.de && (
                  <div>
                    <strong>{t('Deutsches Wort', 'Mot allemand')}:</strong> {data.de}
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
                {typeof correctIndex === 'number' && (
                  <div>
                    <strong>{t('Richtige Antwort', 'Bonne réponse')}:</strong> {getOptionLabel(options[correctIndex])}
                  </div>
                )}
                <div>
                  {t(
                    'Tipp: Lies die Bedeutung des deutschen Wortes noch einmal und achte auf das Schlüsselwort.',
                    "Conseil : relis la signification du mot allemand et repère le mot-clé."
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

export default ExerciceQCM
