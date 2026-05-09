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
  optionSelected,
  primaryButton,
  questionCard,
  questionText,
} from './exerciseUi'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Exercice "Relier" : allemand <-> traduction (DE/FR/MIX)
function ExerciceMatchPairs({ data, onValide }) {
  const { lang, t } = useLang()
  const pairs = useMemo(() => (Array.isArray(data?.pairs) ? data.pairs : []), [data?.pairs])

  const promptTxt = useMemo(() => {
    const de = data?.promptDe || 'Verbinde die Paare'
    const fr = data?.promptFr || 'Relie les paires'
    if (lang === 'mix') return t(de, fr)
    if (lang === 'fr') return fr || de
    return de || fr
  }, [data?.promptDe, data?.promptFr, lang, t])

  const left = useMemo(() => pairs.map((p) => p.de), [pairs])

  const right = useMemo(() => {
    return shuffle(
      pairs.map((p) => ({
        de: p.de,
        label: t(p.de, p.fr),
      }))
    )
  }, [pairs, t])

  const [selectedLeft, setSelectedLeft] = useState(null)
  const [matches, setMatches] = useState({}) // de -> label
  const [valide, setValide] = useState(false)
  const [score, setScore] = useState(null)

  const handlePickLeft = (de) => {
    if (valide) return
    setSelectedLeft(de)
  }

  const handlePickRight = (item) => {
    if (valide) return
    if (!selectedLeft) return
    setMatches((prev) => ({ ...prev, [selectedLeft]: item.label }))
    setSelectedLeft(null)
  }

  const handleValider = () => {
    if (valide) return
    if (Object.keys(matches).length !== pairs.length) return

    let okCount = 0
    for (const p of pairs) {
      const expected = t(p.de, p.fr)
      if (normalizeAnswer(matches[p.de]) === normalizeAnswer(expected)) okCount++
    }
    const pct = Math.round((okCount / pairs.length) * 100)
    setScore(pct)
    setValide(true)
    setTimeout(() => onValide(pct === 100, {
      userAnswer: JSON.stringify(matches),
      expectedAnswer: JSON.stringify(pairs),
      hintsUsed: 0,
    }), 900)
  }

  return (
    <div className={exerciseShell}>
      <div className={exerciseBadge}>{t('Relier', 'Relier')}</div>

      <div className={questionCard}>
        <p className={questionText}>{promptTxt}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          {left.map((de) => (
            <button
              key={de}
              type="button"
              className={cx(optionBase, 'justify-between', selectedLeft === de && optionSelected)}
              onClick={() => handlePickLeft(de)}
              disabled={valide}
            >
              <span>{de}</span>
              <span className="text-xs uppercase tracking-[0.2em] text-brand-brown/70">{matches[de] ? 'OK' : ''}</span>
            </button>
          ))}
        </div>

        <div>
          {right.map((r) => (
            <button
              key={`${r.de}-${r.label}`}
              type="button"
              className={optionBase}
              onClick={() => handlePickRight(r)}
              disabled={valide}
            >
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      {!valide && (
        <button
          className={cx(primaryButton, 'self-end')}
          onClick={handleValider}
          disabled={Object.keys(matches).length !== pairs.length}
          type="button"
        >
          {t('Prüfen', 'Valider')}
        </button>
      )}

      {valide && (
        <>
          <div className={feedbackClass(score === 100)}>
            {score === 100 ? t('Richtig!', 'Correct !') : `${t('Falsch.', 'Faux.')} ${score}%`}
          </div>

          {score !== 100 && (
            <div className={explainBox}>
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-brand-blue">{t('Erklärung', 'Explication')}</div>
              <div className="space-y-2">
                <div>
                  {t('Hier sind die richtigen associations :', 'Voici les bonnes correspondances :')}
                </div>
                {pairs.map((p) => {
                  const expected = t(p.de, p.fr)
                  const picked = matches[p.de]
                  const ok = normalizeAnswer(picked) === normalizeAnswer(expected)
                  if (ok) return null
                  return (
                    <div key={p.de}>
                      <strong>{p.de}</strong> → {expected}
                      {picked ? ` (${t('deine Wahl', 'tu as mis')} : ${picked})` : ''}
                    </div>
                  )
                })}
                <div>
                  {t(
                    'Tipp: Beginne mit den einfachen Wörtern (z. B. Danke, Hallo) et complète petit à petit.',
                    'Conseil : commence par les mots faciles (ex. Danke, Hallo), puis complète petit à petit.'
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

export default ExerciceMatchPairs
