import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { useGamification } from '@context/GamificationContext'
import { useLang } from '@context/LangContext'
import { userAPI, withOfflineFallback } from '@services/api'
import XPBar from '@components/dashboard/XPBar'
import { buttonClass, cardClass, cx, levelBadgeClass, levelTheme } from '@utils/ui'

// ── Données mock (utilisées si backend pas encore dispo) ───
const MOCK_DASHBOARD = {
  progression: [
    { niveau: 'A1', leconsFaites: 18, leconsTotal: 30, score: 87 },
    { niveau: 'A2', leconsFaites: 5,  leconsTotal: 30, score: 72 },
    { niveau: 'B1', leconsFaites: 0,  leconsTotal: 30, score: 0  },
    { niveau: 'B2', leconsFaites: 0,  leconsTotal: 30, score: 0  },
    { niveau: 'C1', leconsFaites: 0,  leconsTotal: 30, score: 0  },
    { niveau: 'C2', leconsFaites: 0,  leconsTotal: 30, score: 0  },
  ],
  derniereLecon: {
    id: 6,
    titre: 'Les salutations formelles',
    niveau: 'A2',
    numero: 5,
  },
  stats: {
    joursSuite:   7,
    leconsTotales: 23,
    motsAppris:   340,
    minutesTotal: 420,
  },
  prochainObjectif: {
    label: 'Finir A2',
    progression: 17,
    total: 30,
  },
  adaptiveRecommendation: {
    weakConcepts: [
      { conceptTag: 'article_omission', masteryScore: 52, skill: 'ECRIRE' },
      { conceptTag: 'word_order_v2', masteryScore: 61, skill: 'PARLER' },
    ],
    targetSkills: ['ECRIRE', 'PARLER'],
    dueReviews: [],
    suggestedSession: {
      niveau: 'A2',
      objectif: 'MIXTE',
      dureeMinutes: 30,
      focusConcepts: ['article_omission', 'word_order_v2'],
    },
  },
  activeErrors: [
    { errorTag: 'article_omission', count: 4, isFrequent: true },
    { errorTag: 'word_order_v2', count: 2, isFrequent: false },
  ],
  reviewSummary: {
    activeCount: 2,
    dueCount: 0,
  },
}

// ── Config niveaux ─────────────────────────────────────────
const NIVEAU_CONFIG = {
  A1: { emoji: '🌱', nom: 'Anfänger' },
  A2: { emoji: '🌿', nom: 'Grundstufe' },
  B1: { emoji: '🌳', nom: 'Mittelstufe' },
  B2: { emoji: '⭐', nom: 'Mittelstufe +' },
  C1: { emoji: '🏆', nom: 'Fortgeschritten' },
  C2: { emoji: '💎', nom: 'Beherrschung' },
}

// ── Labels objectifs ───────────────────────────────────────
const OBJECTIF_LABELS = {
  ausbildung: '🎓 Ausbildung',
  aupair:     '👶 Au Pair',
  fsj:        '🤝 FSJ',
  bfd:        '🌍 BFD',
  etudes:     '📚 Études',
  autre:      '✨ Autre',
}

// ── Composant carte progression niveau ────────────────────
function NiveauCard({ niveau, leconsFaites, leconsTotal, score }) {
  const { t } = useLang()
  const config  = NIVEAU_CONFIG[niveau]
  const theme = levelTheme(niveau)
  const pct     = leconsTotal > 0 ? Math.round((leconsFaites / leconsTotal) * 100) : 0
  const started = leconsFaites > 0

  return (
    <Link
      to={`/cours/${niveau}`}
      className={cx(
        cardClass.interactive,
        'flex h-full flex-col gap-4 p-5',
        started ? theme.tint : 'border-brand-border/70 bg-white/72'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-3xl">{config.emoji}</span>
        <span className={levelBadgeClass(niveau)}>{niveau}</span>
      </div>
      <p className="font-display text-2xl font-semibold text-brand-text">{config.nom}</p>
      <p className="text-sm text-brand-brown">
        {leconsFaites}/{leconsTotal} {t('Lektionen', 'leçons')}
      </p>

      <div className="mt-auto progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-sm font-semibold text-brand-brown">{pct}%</p>

      {score > 0 && (
        <p className={cx('text-sm font-semibold', theme.text)}>⭐ {score}{t('Pkte', 'pts')}</p>
      )}
    </Link>
  )
}

// ── Composant skeleton card ────────────────────────────────
function SkeletonCard({ height = 120 }) {
  return (
    <div
      className="skeleton"
      style={{ height, borderRadius: 'var(--radius-xl)' }}
    />
  )
}

// ── Dashboard principal ────────────────────────────────────
function Dashboard() {
  const { user } = useAuth()
  const { data: gamificationData, checkStreak } = useGamification()
  const { t } = useLang()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const displayText = (value) => {
    if (value == null) return ''
    if (typeof value === 'string' || typeof value === 'number') return value
    if (typeof value === 'object') {
      return t(value.de || value.mg || '', value.fr || value.mg || '')
    }
    return String(value)
  }

  // Heure de salutation
  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return t('Guten Morgen', 'Bonjour')
    if (h < 18) return t('Guten Tag', 'Bonjour')
    return t('Guten Abend', 'Bonsoir')
  }

  // ── Chargement des données dashboard ──
  useEffect(() => {
    if (user) checkStreak().catch(() => {})
  }, [checkStreak, user])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!user?.id) {
        setData(MOCK_DASHBOARD)
        setLoading(false)
        return
      }

      try {
        const result = await withOfflineFallback(
          () => userAPI.getDashboard(),
          `eam_dashboard_${user.id}`,
          MOCK_DASHBOARD
        )
        if (!cancelled) {
          setData(result || MOCK_DASHBOARD)
          setError(null)
        }
      } catch {
        // Fallback sur mock si erreur réseau
        if (!cancelled) {
          setData(MOCK_DASHBOARD)
          setError('offline')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    setLoading(true)
    load()

    return () => {
      cancelled = true
    }
  }, [user?.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="h-10 w-72 animate-pulse rounded-2xl bg-brand-border/70" />
          <div className="h-5 w-44 animate-pulse rounded-2xl bg-brand-border/60" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} height={120} />)}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} height={180} />)}
        </div>
      </div>
    )
  }

  const {
    progression,
    derniereLecon,
    stats,
    prochainObjectif,
    adaptiveRecommendation,
    activeErrors,
    reviewSummary,
  } = data

  return (
    <div className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className={cx(cardClass.base, 'overflow-hidden p-6 sm:p-8')}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <p className="section-kicker">Dashboard</p>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-text sm:text-4xl">
                {getGreeting()}, <span className="text-brand-blue">{user?.prenom || 'Apprenant'}</span> 👋
              </h1>
              <p className="text-brand-brown">
                {OBJECTIF_LABELS[user?.objectif] || '✨ Objectif'} · Niveau actuel :{' '}
                <span className={levelBadgeClass(user?.niveau || 'A1')}>{user?.niveau || 'A1'}</span>
              </p>
              {error && (
                <div className="rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Mode hors ligne actif. Les donnees affichent un fallback local.
                </div>
              )}
            </div>
            <div className="rounded-[1.8rem] border border-brand-border/80 bg-brand-sky/70 px-5 py-4 text-center shadow-soft">
              <p className="text-3xl font-display font-semibold text-brand-text">
                {gamificationData?.stats?.streakCurrent ?? stats.joursSuite}
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-brown">Serie</p>
              <p className="mt-1 text-sm text-brand-brown">jours de suite</p>
            </div>
          </div>
        </div>

        <div className={cx(cardClass.soft, 'p-6')}>
          <p className="section-kicker">Objectif actuel</p>
              <p className="mt-3 font-display text-2xl font-semibold text-brand-text">
                {displayText(OBJECTIF_LABELS[user?.objectif]) || 'Projet Allemagne'}
              </p>
          <p className="mt-2 text-brand-brown">Chaque carte de progression pointe maintenant vers une action claire.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/cours" className={buttonClass.outline}>Cours</Link>
            <Link to="/guide" className={buttonClass.ghost}>Guide</Link>
          </div>
        </div>
      </div>

      <XPBar />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className={cx(cardClass.base, 'space-y-4 p-6')}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-kicker">Adaptive</p>
              <h2 className="section-title">Priorites pedagogiques</h2>
            </div>
            <Link to={`/cours/${adaptiveRecommendation?.suggestedSession?.niveau || user?.niveau || 'A1'}/lecon/adaptive`} className={buttonClass.outline}>
              Session adaptative
            </Link>
          </div>

          {adaptiveRecommendation?.weakConcepts?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {adaptiveRecommendation.weakConcepts.map((item) => (
                <span key={`${item.conceptTag}-${item.skill}`} className="stat-chip">
                  {item.conceptTag} · {item.masteryScore}%
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-brand-brown">Aucune faiblesse prioritaire detectee.</p>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <div className={cx(cardClass.soft, 'p-4')}>
              <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-brand-blue">Active</span>
              <span className="mt-2 block font-display text-3xl font-semibold text-brand-text">{reviewSummary?.activeCount || 0}</span>
            </div>
            <div className={cx(cardClass.soft, 'p-4')}>
              <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-brand-blue">Review due</span>
              <span className="mt-2 block font-display text-3xl font-semibold text-brand-text">{reviewSummary?.dueCount || 0}</span>
            </div>
            <div className={cx(cardClass.soft, 'p-4')}>
              <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-brand-blue">Skills</span>
              <span className="mt-2 block text-sm font-semibold text-brand-text">
                {(adaptiveRecommendation?.targetSkills || []).join(' · ') || 'MIXTE'}
              </span>
            </div>
          </div>
        </div>

        <div className={cx(cardClass.base, 'space-y-4 p-6')}>
          <div>
            <p className="section-kicker">Erreurs</p>
            <h2 className="section-title">A revoir maintenant</h2>
          </div>
          {activeErrors?.length > 0 ? (
            <div className="space-y-3">
              {activeErrors.slice(0, 5).map((item) => (
                <div key={`${item.errorTag}-${item.count}`} className={cx(cardClass.soft, 'flex items-center justify-between gap-3 p-4')}>
                  <div>
                    <p className="font-semibold text-brand-text">{item.errorTag}</p>
                    <p className="mt-1 text-sm text-brand-brown">
                      {item.isFrequent ? 'Erreur frequente' : 'Erreur recente'}
                    </p>
                  </div>
                  <span className="stat-chip">x{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-brand-brown">Aucune erreur active pour le moment.</p>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          REPRENDRE LA DERNIÈRE LEÇON
      ══════════════════════════════════════ */}
      {derniereLecon && (
        <Link
          to={`/cours/${derniereLecon.niveau}/lecon/${derniereLecon.id}`}
          className={cx(cardClass.interactive, 'flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between')}
        >
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue text-2xl text-white shadow-soft">▶️</span>
            <div>
              <p className="section-kicker">Weitermachen · Reprendre</p>
              <p className="mt-2 text-lg text-brand-brown">
                {displayText(derniereLecon.niveau)} — Leçon {derniereLecon.numero} :{' '}
                <strong className="text-brand-text">{displayText(derniereLecon.titre)}</strong>
              </p>
            </div>
          </div>
          <span className="text-2xl font-semibold text-brand-blue">→</span>
        </Link>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { val: stats.leconsTotales, label: 'Lektionen abgeschlossen', fr: 'Leçons terminées', emoji: '📚' },
          { val: stats.motsAppris,    label: 'Gelernte Wörter', fr: 'Mots appris',       emoji: '💬' },
          { val: `${Math.round(stats.minutesTotal / 60)}h`,
                                      label: 'Lernzeit',fr: 'Temps d\'étude',   emoji: '⏱️' },
          { val: `${stats.joursSuite}j`,
                                      label: 'Aktuelle série',fr: 'Streak actuel',   emoji: '🔥' },
        ].map(s => (
          <div key={s.label} className={cx(cardClass.base, 'flex flex-col gap-2 p-5')}>
            <span className="text-2xl">{s.emoji}</span>
            <span className="font-display text-3xl font-semibold text-brand-text">{s.val}</span>
            <span className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-blue">{s.label}</span>
            <span className="text-sm text-brand-brown">{s.fr}</span>
          </div>
        ))}
      </div>

      <div className={cx(cardClass.base, 'p-6')}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">🎯 Nächstes Ziel · Prochain objectif</p>
            <p className="mt-2 font-display text-2xl font-semibold text-brand-text">
              {displayText(prochainObjectif.label)}
            </p>
          </div>
          <p className="text-sm font-semibold text-brand-brown">
            {prochainObjectif.progression}/{prochainObjectif.total} leçons
          </p>
        </div>
        <div className="mt-5 space-y-3">
          <div className="progress-track h-3">
            <div
              className="progress-fill"
              style={{
                width: `${Math.round((prochainObjectif.progression / prochainObjectif.total) * 100)}%`
              }}
            />
          </div>
          <p className="text-sm text-brand-brown">
            {Math.round((prochainObjectif.progression / prochainObjectif.total) * 100)}% atteint
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">📊 Progression</p>
            <h2 className="section-title">Lernfortschritt · Progression par niveau</h2>
          </div>
          <Link to="/cours" className="text-sm font-semibold text-brand-blue hover:text-brand-blueDeep">
            Voir tous les cours →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {progression.map(p => (
            <NiveauCard key={p.niveau} {...p} />
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <h2 className="section-title">⚡ Schnellzugriff · Accès rapide</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { to: '/sprechen', emoji: '🎤', label: 'Sprechen', fr: 'Pratiquer l oral', tone: 'from-brand-blue to-sky-400' },
            { to: '/communaute', emoji: '💬', label: 'Community', fr: 'Rejoindre la communaute', tone: 'from-brand-text to-brand-blue' },
            { to: '/guide', emoji: '🗺️', label: 'Guide Allemagne', fr: 'Ausbildung / Au Pair', tone: 'from-brand-brown to-amber-500' },
            { to: '/cours', emoji: '📚', label: 'Alle Kurse', fr: 'Tous les cours', tone: 'from-brand-green to-emerald-400' },
          ].map(q => (
            <Link
              key={q.to}
              to={q.to}
              className={cx(cardClass.interactive, 'overflow-hidden p-5')}
            >
              <div className={cx('mb-4 h-2 rounded-full bg-gradient-to-r', q.tone)} />
              <span className="text-2xl">{q.emoji}</span>
              <p className="mt-4 font-display text-xl font-semibold text-brand-text">{q.label}</p>
              <p className="mt-2 text-sm text-brand-brown">{q.fr}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
