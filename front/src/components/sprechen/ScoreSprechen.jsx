import { useEffect, useMemo, useState } from 'react'
import { sprechenAPI } from '@services/api'
import { useLang } from '@context/LangContext'
import Icon from '@components/ui/Icon'
import { buttonClass, cardClass, cx, levelBadgeClass } from '@utils/ui'

function ScoreSprechen({ sessionData, onRejouer, niveau = 'A1' }) {
  const { t, lang } = useLang()
  const [saved, setSaved] = useState(false)
  const { scores = [], scoreTotal = 0, duree = 0, partner } = sessionData || {}

  const formatDuree = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}min ${sec}s` : `${sec}s`
  }

  const iconName = useMemo(() => {
    if (scoreTotal >= 90) return 'trophy'
    if (scoreTotal >= 70) return 'star'
    if (scoreTotal >= 50) return 'bolt'
    return 'book'
  }, [scoreTotal])

  const msg = useMemo(() => {
    if (scoreTotal >= 90) return { de: 'Ausgezeichnet!', fr: 'Excellent !' }
    if (scoreTotal >= 70) return { de: 'Sehr gut!', fr: 'Très bien !' }
    if (scoreTotal >= 50) return { de: 'Weiter so!', fr: 'Continuez !' }
    return { de: 'Noch einmal!', fr: 'Réessayez !' }
  }, [scoreTotal])

  const correctCount = scores.filter(Boolean).length

  useEffect(() => {
    if (!sessionData || saved) return
    const save = async () => {
      try {
        await sprechenAPI.saveSession({
          partnerId: partner?.userId || partner?.id || null,
          niveau,
          score: scoreTotal,
          duree,
          exercices: {
            scores,
            correctCount,
          },
        })
        setSaved(true)
      } catch {
        // noop
      }
    }
    save()
  }, [sessionData, saved, partner, niveau, scoreTotal, duree, scores, correctCount])

  return (
    <div className={cx(cardClass.base, 'mx-auto max-w-3xl p-6 text-center sm:p-8')}>
      <div className="space-y-3">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-sky text-brand-blue shadow-soft" aria-hidden="true">
          <Icon name={iconName} size={28} className="icon" />
        </span>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-brand-text">
          {lang === 'fr' ? msg.fr : lang === 'de' ? msg.de : `${msg.de} · ${msg.fr}`}
        </h2>
        <p className="text-brand-brown">{t(msg.de, msg.fr)}</p>
      </div>

      <div className="relative mx-auto mt-8 flex h-44 w-44 items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r="42" className="fill-none stroke-brand-border/70 stroke-[6]" />
          <circle
            cx="50"
            cy="50"
            r="42"
            className="fill-none stroke-brand-blue stroke-[6]"
            strokeDasharray={`${(scoreTotal / 100) * 264} 264`}
          />
        </svg>
        <div className="absolute text-center">
          <span className="block font-display text-4xl font-semibold text-brand-text">{scoreTotal}</span>
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-brown">/100</span>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.5rem] bg-brand-sky/55 p-5">
          <span className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700" aria-hidden="true">
            <Icon name="checkCircle" size={18} className="icon" />
          </span>
          <span className="block font-display text-2xl font-semibold text-brand-text">{correctCount}/{scores.length}</span>
          <span className="text-sm text-brand-brown">{t('Korrekte Übungen', 'Exercices corrects')}</span>
        </div>
        <div className="rounded-[1.5rem] bg-brand-sky/55 p-5">
          <span className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-blue" aria-hidden="true">
            <Icon name="clock" size={18} className="icon" />
          </span>
          <span className="block font-display text-2xl font-semibold text-brand-text">{formatDuree(duree)}</span>
          <span className="text-sm text-brand-brown">{t('Sitzungsdauer', 'Durée session')}</span>
        </div>
        {partner && (
          <div className="rounded-[1.5rem] bg-brand-sky/55 p-5">
            <span className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-blue" aria-hidden="true">
              <Icon name="users" size={18} className="icon" />
            </span>
            <span className="block font-display text-2xl font-semibold text-brand-text">{partner.prenom}</span>
            <span className="text-sm text-brand-brown">{t('Partner', 'Partenaire')}</span>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <span className={levelBadgeClass(niveau)}>{niveau}</span>
        <span className="text-sm font-semibold text-brand-brown">{t('Trainiertes Niveau', 'Niveau pratiqué')}</span>
      </div>

      <div className="mt-8 space-y-3">
        <button className={buttonClass.primary} onClick={onRejouer} type="button">
          <Icon name="refresh" size={18} className="icon" /> {t('Neuen Partner suchen', 'Chercher un nouveau partenaire')}
        </button>
        <p className="text-sm text-brand-brown">{t('Partner finden', 'Trouver un partenaire')}</p>
      </div>
    </div>
  )
}

export default ScoreSprechen

