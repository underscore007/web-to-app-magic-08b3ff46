import { useMemo, useState } from 'react'
import { useLang } from '@context/LangContext'
import { normalizeAnswer } from '@utils/normalizeAnswer'
import AudioPlayer from './AudioPlayer'
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
  subText,
} from './exerciseUi'

// Exercice Traduction : DE/FR -> DE (réponse en allemand)
function ExerciceTraduction({ data, onValide }) {
  const { lang, t } = useLang()

  const [valeur, setValeur] = useState('')
  const [valide, setValide] = useState(false)
  const [correct, setCorrect] = useState(null)

  const sourceTxt = useMemo(() => {
    const de = data?.sourceDe
    const fr = data?.sourceFr
    if (lang === 'mix') return t(de, fr)
    if (lang === 'fr') return fr || de
    return de || fr
  }, [data?.sourceDe, data?.sourceFr, lang, t])

  const reponse = String(data?.reponse || '')

  const handleValider = () => {
    if (!valeur.trim() || valide) return

    const user = normalizeAnswer(valeur)
    const accepts = Array.isArray(data?.accepte) && data.accepte.length > 0
      ? data.accepte
      : [reponse]

    const ok = accepts.some((r) => normalizeAnswer(r) === user)

    setCorrect(ok)
    setValide(true)
    setTimeout(() => onValide(ok, {
      userAnswer: valeur,
      expectedAnswer: reponse,
      hintsUsed: 0,
    }), 900)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleValider()
  }

  return (
    <div className={exerciseShell}>
      <div className={exerciseBadge}>{t('Übersetzung', 'Traduction')}</div>

      <div className={questionCard}>
        <p className={questionText}>{sourceTxt}</p>
        <p className={subText}>
          {t('Auf Deutsch schreiben', 'Traduisez en allemand')}
        </p>
      </div>

      {!valide && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            className={cx(inputBase, 'sm:flex-1')}
            placeholder={t('Deutsch...', 'Allemand...')}
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

      {valide && (
        <>
          <div className={feedbackClass(correct)}>
            {correct
              ? `${t('Richtig!', 'Correct !')} "${valeur}"`
              : `${t('Richtige Antwort', 'Bonne réponse')}: "${reponse}"`}
          </div>

          {!correct && (
            <div className={explainBox}>
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-brand-blue">{t('Erklärung', 'Explication')}</div>
              <div className="space-y-2">
                <div>
                  <strong>{t('Bedeutung', 'Traduction')}:</strong> {reponse} = {t(data?.meaning?.de || data?.sourceDe, data?.meaning?.fr || data?.sourceFr)}
                </div>
                <div>
                  {t(
                    'Tipp: Achte auf die Rechtschreibung (z. B. ich / heiße) und füge keine zusätzlichen Wörter hinzu.',
                    "Conseil : vérifie l'orthographe et n'ajoute pas de mots en plus."
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="rounded-[1.4rem] bg-brand-sky/50 p-4">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-brown">{t('Aussprache anhören :', 'Écouter la prononciation :')}</p>
            <AudioPlayer texte={reponse} langue="de-DE" />
          </div>
        </>
      )}
    </div>
  )
}

export default ExerciceTraduction
