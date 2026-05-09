import { useMemo, useRef, useState } from 'react'
import { useLang } from '@context/LangContext'
import { normalizeAnswer } from '@utils/normalizeAnswer'
import { cx } from '@utils/ui'
import {
  exerciseBadge,
  exerciseShell,
  explainBox,
  feedbackClass,
  inputBase,
  primaryButton,
  questionCard,
  questionText,
} from './exerciseUi'

// Exercice Completer (trou) - reponse = mot allemand attendu
function ExerciceFillBlank({ data, onValide }) {
  const { t } = useLang()

  const [valeur, setValeur] = useState('')
  const [valide, setValide] = useState(false)
  const [correct, setCorrect] = useState(null)
  const [showIndice, setShowIndice] = useState(false)
  const inputRef = useRef(null)

  const reponse = String(data?.reponse || '')

  const okLabel = useMemo(() => t('Richtig!', 'Correct !'), [t])
  const koLabel = useMemo(() => t('Falsch.', 'Faux.'), [t])

  const handleValider = () => {
    if (!valeur.trim() || valide) return
    const ok = normalizeAnswer(valeur) === normalizeAnswer(reponse)
    setCorrect(ok)
    setValide(true)
    setTimeout(() => onValide(ok, {
      userAnswer: valeur,
      expectedAnswer: reponse,
      hintsUsed: showIndice ? 1 : 0,
    }), 900)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleValider()
  }

  return (
    <div className={exerciseShell}>
      <div className={exerciseBadge}>{t('Ergänzen', 'Compléter')}</div>

      <div className={questionCard}>
        <p className={questionText}>
          <span>{data?.avant} </span>
          <span
            className={cx(
              'rounded-xl border px-3 py-1',
              valide ? (correct ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-rose-300 bg-rose-50 text-rose-700') : 'border-brand-border bg-white'
            )}
          >
            {valide ? valeur : '___'}
          </span>
          <span> {data?.apres}</span>
        </p>
      </div>

      {!valide && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            ref={inputRef}
            type="text"
            className={cx(inputBase, 'sm:flex-1')}
            placeholder={t('Hier schreiben...', 'Écris ici...')}
            value={valeur}
            onChange={(e) => setValeur(e.target.value)}
            onKeyDown={handleKey}
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button
            className={primaryButton}
            onClick={handleValider}
            disabled={!valeur.trim()}
            type="button"
          >
            OK
          </button>
        </div>
      )}

      {!valide && data?.indice && (
        <button
          className="w-fit rounded-full border border-brand-border bg-brand-sky/60 px-4 py-2 text-sm font-semibold text-brand-brown transition hover:bg-brand-sky"
          onClick={() => setShowIndice((p) => !p)}
          type="button"
        >
          {showIndice ? data.indice : `? ${t('Hinweis', 'Indice')}`}
        </button>
      )}

      {valide && (
        <>
          <div className={feedbackClass(correct)}>
            {correct ? okLabel : `${koLabel} ${t('Antwort', 'Réponse')}: ${reponse}`}
          </div>

          {!correct && (
            <div className={explainBox}>
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-brand-blue">{t('Erklärung', 'Explication')}</div>
              <div className="space-y-2">
                {data?.phraseDe && (
                  <div>
                    <strong>{t('Vollständiger Satz', 'Phrase complète')}:</strong> {data.phraseDe}
                  </div>
                )}
                {(data?.meaning?.de || data?.meaning?.fr) && (
                  <div>
                    <strong>{t('Bedeutung', 'Signifie')}:</strong> {t(data.meaning?.de, data.meaning?.fr)}
                  </div>
                )}
                <div>
                  {t(
                    'Tipp: Nutze die Wörter davor et danach (Guten/Ich/Wie...), um das fehlende Wort zu finden.',
                    'Conseil : regarde les mots autour (Guten/Ich/Wie...) pour deviner le mot manquant.'
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

export default ExerciceFillBlank
