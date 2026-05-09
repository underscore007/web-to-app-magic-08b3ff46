import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { useLang } from '@context/LangContext'
import { coursAPI, withOfflineFallback } from '@services/api'
import Icon from '@components/ui/Icon'
import { cardClass, cx, levelBadgeClass, levelTheme } from '@utils/ui'

const NIVEAUX = [
  { code: 'A1', nom: 'Anfänger', fr: 'Débutant', icon: 'bolt' },
  { code: 'A2', nom: 'Grundstufe', fr: 'Élémentaire', icon: 'star' },
  { code: 'B1', nom: 'Mittelstufe', fr: 'Intermédiaire', icon: 'book' },
  { code: 'B2', nom: 'Mittelstufe+', fr: 'Intermédiaire+', icon: 'star' },
  { code: 'C1', nom: 'Fortgeschritten', fr: 'Avancé', icon: 'trophy' },
  { code: 'C2', nom: 'Beherrschung', fr: 'Maîtrise', icon: 'gem' },
]

const MOCK_LECONS = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  numero: i + 1,
  titre: [
    'Begrüßungen · Les salutations',
    'Sich vorstellen · Se présenter',
    'Die Familie · La famille',
    'Zahlen und Tage · Chiffres et jours',
    'Essen · La nourriture',
    'Farben und formes · Couleurs et formes',
    'Berufe · Métiers',
    'Zeit · Le temps',
    'Das Haus · La maison',
    'Transport · Les transports',
  ][i % 10] + (i >= 10 ? ` (${Math.floor(i / 10) + 1})` : ''),
  duree: 15 + (i % 5) * 5,
  phrases: 10,
  exercices: 50,
  complete: false,
  score: null,
}))

function LeconCard({ lecon, niveau }) {
  const { t } = useLang()
  const isComplete = lecon.complete
  const isLocked = lecon.unlocked === false
  const theme = levelTheme(niveau)
  const cardContent = (
    <>
      <div className={cx(
        'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-sky font-display text-lg font-semibold text-brand-text',
        isLocked && 'bg-slate-200 text-slate-500'
      )}>
        {isComplete ? <Icon name="checkCircle" size={20} className="icon" /> : isLocked ? <Icon name="lock" size={18} className="icon" /> : lecon.numero}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-display text-xl font-semibold text-brand-text">
          {lecon?.titre && typeof lecon.titre === 'object' ? t(lecon.titre.de, lecon.titre.fr) : lecon.titre}
        </p>

        <div className="mt-3 flex flex-wrap gap-3 text-sm text-brand-brown">
          <span className="stat-chip">
            <Icon name="clock" size={16} className="icon" /> {lecon.duree}min
          </span>
          <span className="stat-chip">
            <Icon name="messageCircle" size={16} className="icon" /> {lecon.phrases} {t('Sätze', 'phrases')}
          </span>
          <span className="stat-chip">
            <Icon name="edit" size={16} className="icon" /> {lecon.exercices} {t('Übungen', 'exercices')}
          </span>
          <span className="stat-chip">XP {lecon.xpEarned || 0}/{lecon.xpRequired || 100}</span>
          <span className="stat-chip">{lecon.masteryScore || 0}%</span>
          {lecon.revisionRequired ? <span className="stat-chip">Revision</span> : null}
        </div>
        {isLocked && lecon.lockedReason ? (
          <p className="mt-3 text-sm text-slate-500">{lecon.lockedReason}</p>
        ) : null}
      </div>

      {isComplete && lecon.score ? (
        <div className="rounded-[1.4rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
          <span className="block font-display text-2xl font-semibold text-emerald-700">{lecon.score}</span>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">pts</span>
        </div>
      ) : null}

      <span className={cx('self-center text-brand-blue', isLocked && 'text-slate-400')} aria-hidden="true">
        <Icon name={isLocked ? 'lock' : 'arrowRight'} size={20} className="icon" />
      </span>
    </>
  )

  if (isLocked) {
    return (
      <div className={cx(cardClass.base, 'flex cursor-not-allowed flex-col gap-4 border-brand-border/70 bg-slate-50 p-5 opacity-80 sm:flex-row sm:items-center')}>
        {cardContent}
      </div>
    )
  }

  return (
    <Link
      to={`/cours/${niveau}/lecon/${lecon.id}`}
      className={cx(cardClass.interactive, 'flex flex-col gap-4 p-5 sm:flex-row sm:items-center', isComplete && theme.tint)}
    >
      {cardContent}
    </Link>
  )
}

function Cours() {
  const { niveau: niveauParam } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { lang, t } = useLang()

  const niveauActif = niveauParam?.toUpperCase() || user?.niveau || 'A1'
  const [lecons, setLecons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const raw = await withOfflineFallback(
          () => coursAPI.getLecons(niveauActif),
          `eam_lecons_${niveauActif}`,
          MOCK_LECONS
        )
        const list = Array.isArray(raw) ? raw : raw?.lecons
        setLecons(Array.isArray(list) ? list : MOCK_LECONS)
      } catch {
        setLecons(MOCK_LECONS)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [niveauActif])

  const niveauInfo = NIVEAUX.find((n) => n.code === niveauActif) || NIVEAUX[0]
  const leconsList = Array.isArray(lecons) ? lecons : []
  const leconsFaites = leconsList.filter((l) => l.complete).length
  const pct = leconsList.length > 0 ? Math.round((leconsFaites / leconsList.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="section-title inline-flex items-center gap-3">
          <Icon name="book" size={22} className="icon" /> {t('Kurse', 'Cours')}
        </h1>
        <p className="section-copy">{t('Niveau wählen', 'Choisissez votre niveau')}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {NIVEAUX.map((n) => (
          <button
            key={n.code}
            className={cx(
              cardClass.soft,
              'flex items-center gap-3 p-4 text-left transition',
              niveauActif === n.code && 'border-brand-blue bg-brand-sky/80 shadow-soft'
            )}
            onClick={() => navigate(`/cours/${n.code}`)}
            type="button"
          >
            <Icon name={n.icon} size={18} className="icon" />
            <span className={levelBadgeClass(n.code)}>{n.code}</span>
            <span className="text-sm font-semibold text-brand-text">
              {lang === 'mix' ? `${n.nom} · ${n.fr}` : t(n.nom, n.fr)}
            </span>
          </button>
        ))}
      </div>

      <div className={cx(cardClass.base, 'flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between', levelTheme(niveauActif).tint)}>
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-blue shadow-soft">
            <Icon name={niveauInfo.icon} size={22} className="icon" />
          </span>
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-brand-text">
              {t('Niveau', 'Niveau')} {niveauActif}
            </h2>
            <p className="mt-1 text-brand-brown">
              {lang === 'mix' ? `${niveauInfo.nom} · ${niveauInfo.fr}` : t(niveauInfo.nom, niveauInfo.fr)}
            </p>
          </div>
        </div>
        <div className="w-full max-w-sm space-y-3">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          <p className="text-sm font-semibold text-brand-brown">
            {leconsFaites}/{leconsList.length} {t('Lektionen', 'leçons')} · {pct}%
            </p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-[1.5rem] bg-brand-border/60" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          <Link
            to={`/cours/${niveauActif}/lecon/adaptive`}
            className={cx(cardClass.interactive, 'flex flex-col gap-4 border-brand-blue/40 bg-brand-sky/60 p-5 sm:flex-row sm:items-center')}
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-blue text-white">
              <Icon name="bolt" size={20} className="icon" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-xl font-semibold text-brand-text">
                {t('Adaptive Lektion', 'Lecon adaptative')}
              </p>
              <p className="mt-2 text-sm text-brand-brown">
                {t(
                  'Dynamische Uebungen basierend auf deinen Fehlern und deinem Ziel.',
                  'Exercices dynamiques selon tes erreurs et ton objectif.'
                )}
              </p>
            </div>
            <span className="self-center text-brand-blue" aria-hidden="true">
              <Icon name="arrowRight" size={20} className="icon" />
            </span>
          </Link>

          {leconsList.map((lecon) => (
            <LeconCard key={lecon.id} lecon={lecon} niveau={niveauActif} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Cours

