import { useMemo, useState } from 'react'
import { useLang } from '@context/LangContext'
import { normalizeAnswer } from '@utils/normalizeAnswer'
import MicrophoneRecorder from '@components/sprechen/MicrophoneRecorder'
import {
  exerciseBadge,
  exerciseShell,
  explainBox,
  feedbackClass,
  questionCard,
  questionText,
  subText,
} from './exerciseUi'

// Exercice "Sprechen": dire une phrase au micro (allemand)
function ExerciceSprechen({ data, onValide }) {
  const { lang, t } = useLang()

  const attendu = String(data?.texteAttendu || '')
  const [done, setDone] = useState(false)
  const [ok, setOk] = useState(null)

  const promptTxt = useMemo(() => {
    const de = data?.promptDe || 'Sprich laut'
    const fr = data?.promptFr || 'Dis a voix haute'
    if (lang === 'mix') return t(de, fr)
    if (lang === 'fr') return fr || de
    return de || fr
  }, [data?.promptDe, data?.promptFr, lang, t])

  const handleResult = (texteReconnu) => {
    if (done) return
    const correct = normalizeAnswer(texteReconnu) === normalizeAnswer(attendu)
    setOk(correct)
    setDone(true)
    setTimeout(() => onValide(correct, {
      userAnswer: texteReconnu,
      expectedAnswer: attendu,
      hintsUsed: 0,
    }), 1100)
  }

  return (
    <div className={exerciseShell}>
      <div className={exerciseBadge}>Sprechen</div>

      <div className={questionCard}>
        <p className={questionText}>{promptTxt}</p>
        <p className={subText}>{attendu}</p>
      </div>

      <MicrophoneRecorder
        langue="de-DE"
        texteAttendu={attendu}
        onResult={handleResult}
        disabled={done}
        label={t('Sprechen', 'Parler')}
      />

      {done && (
        <>
          <div className={feedbackClass(ok)}>
            {ok ? t('Richtig!', 'Correct !') : `${t('Erwartet', 'Attendu')} : ${attendu}`}
          </div>

          {!ok && (
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
                    'Tipp: Sprich langsam, wiederhole si besoin et articule chaque mot.',
                    'Conseil : parle lentement, répète et articule chaque mot.'
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

export default ExerciceSprechen
