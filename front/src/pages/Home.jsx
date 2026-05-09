import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { buttonClass, cardClass, cx, levelBadgeClass } from '@utils/ui'

// ── Données statiques ──────────────────────────────────────

const STATS = [
  { valeur: '2 400+', label: 'Aktive Lernende', sublabel: 'Apprenants actifs' },
  { valeur: 'A1→C2', label: '6 Niveaus', sublabel: '6 niveaux complets' },
  { valeur: '180+',  label: 'Lektionen', sublabel: 'Leçons disponibles' },
  { valeur: '94%',   label: 'Erfolgsquote', sublabel: 'Taux de réussite' },
]

const NIVEAUX = [
  { code: 'A1', nom: 'Anfänger', fr: 'Débutant', lecons: 30, emoji: '🌱' },
  { code: 'A2', nom: 'Grundstufe', fr: 'Élémentaire', lecons: 30, emoji: '🌿' },
  { code: 'B1', nom: 'Mittelstufe', fr: 'Intermédiaire', lecons: 30, emoji: '🌳' },
  { code: 'B2', nom: 'Mittelstufe+', fr:'Intermédiaire+', lecons: 30, emoji: '⭐' },
  { code: 'C1', nom: 'Fortgeschritten', fr: 'Avancé', lecons: 30, emoji: '🏆' },
  { code: 'C2', nom: 'Beherrschung', fr: 'Maîtrise', lecons: 30, emoji: '💎' },
]

const RAISONS = [
  {
    emoji: '🇲🇬',
    titre: 'Erklärungen klar et simples',
    fr: 'Explications claires',
    desc: 'Les leçons restent compréhensibles et directes, avec une explication simple pour apprendre vite.',
  },
  {
    emoji: '🎯',
    titre: 'Bereit für Deutschland',
    fr: 'Préparation Allemagne',
    desc: 'Ausbildung, Au Pair, FSJ, BFD — préparation ciblée pour partir en Allemagne.',
  },
  {
    emoji: '🎤',
    titre: 'Sprechen — Oral',
    fr: 'Pratique orale',
    desc: 'Pratiquez l’allemand à l’oral avec d’autres apprenants et un feedback immédiat.',
  },
  {
    emoji: '👥',
    titre: 'Lerncommunity',
    fr: 'Communauté active',
    desc: 'Vous n’êtes pas seul. Une communauté vivante progresse avec le même objectif.',
  },
  {
    emoji: '📱',
    titre: 'Auch mit wenig Internet',
    fr: 'Offline disponible',
    desc: 'Connexion instable ? L’expérience reste pensée pour mobile et faible réseau.',
  },
  {
    emoji: '🆓',
    titre: 'Kostenlos',
    fr: 'Gratuit',
    desc: 'Une grande partie d’EAM reste accessible gratuitement pour aider au départ en Allemagne.',
  },
]

const TEMOIGNAGES = [
  {
    nom: 'Ravo Rakoto',
    lieu: 'Antananarivo → München',
    programme: 'Ausbildung Informatik',
    texte: 'Grâce à EAM, j’ai atteint le niveau B2 en 8 mois. La structure des leçons a tout simplifié.',
    avatar: 'R',
    couleur: '#C8373B',
  },
  {
    nom: 'Miora Randria',
    lieu: 'Fianarantsoa → Berlin',
    programme: 'Au Pair',
    texte: 'Le mode Sprechen a été décisif. J’ai trouvé un partenaire et j’ai gagné en confiance avant mon départ.',
    avatar: 'M',
    couleur: '#1A3A5C',
  },
  {
    nom: 'Haja Rasolofo',
    lieu: 'Toamasina → Hamburg',
    programme: 'FSJ Gesundheit',
    texte: 'Les leçons sur l’Ausbildung et le visa m’ont beaucoup aidé. Je savais quoi préparer avant de partir.',
    avatar: 'H',
    couleur: '#2E7D32',
  },
]

// ── Hook compteur animé ────────────────────────────────────
function useCountUp(target, duration = 1500, active = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    const num = parseInt(target.replace(/\D/g, ''))
    if (!num) return
    const step = Math.ceil(num / (duration / 16))
    let current = 0
    const timer = setInterval(() => {
      current = Math.min(current + step, num)
      setCount(current)
      if (current >= num) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [active, target, duration])
  return count
}

// ── Composant carte stat ───────────────────────────────────
function StatCard({ valeur, label, sublabel, active }) {
  const num     = parseInt(valeur.replace(/\D/g, ''))
  const suffix  = valeur.replace(/[\d]/g, '')
  const counted = useCountUp(valeur, 1500, active)
  const display = num ? `${counted}${suffix}` : valeur

  return (
    <div className={cx(cardClass.soft, 'flex flex-col gap-2 p-5 text-center sm:p-6')}>
      <span className="font-display text-3xl font-semibold tracking-tight text-brand-text">{display}</span>
      <span className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-blue">{label}</span>
      <span className="text-sm text-brand-brown">{sublabel}</span>
    </div>
  )
}

// ── Composant principal Home ───────────────────────────────
function Home() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const statsRef  = useRef(null)
  const [statsVisible, setStatsVisible] = useState(false)

  // Intersection Observer pour déclencher les compteurs
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  // Si connecté → aller au dashboard
  const handleCTA = () => navigate(user ? '/dashboard' : '/register')

  return (
    <div className="space-y-12 pb-8 sm:space-y-16">
      <section className="shell">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-hero-mesh px-6 py-10 shadow-panel sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-brand-blue/20 blur-3xl" />
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-brand-green/15 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-white/90 blur-2xl" />
          </div>

          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-7">
              <div className="stat-chip">
                <span>🇲🇬</span>
                <span>Concu pour apprendre l&apos;allemand avec un vrai objectif Allemagne</span>
                <span>🇩🇪</span>
              </div>

              <div className="space-y-4">
                <p className="section-kicker">Nouveau design clair premium</p>
                <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight text-brand-text sm:text-5xl lg:text-6xl">
                  Apprenez l&apos;allemand
                  <span className="block text-brand-blue">avec une methode concrete, mobile et efficace.</span>
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-brand-brown sm:text-xl">
                  EAM relie les lecons, la pratique orale et les demarches Allemagne dans une interface plus claire,
                  plus rapide et mieux adaptee au mobile.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button className={buttonClass.primary} onClick={handleCTA}>
                  🚀 {user ? 'Reprendre depuis le dashboard' : 'Commencer gratuitement'}
                </button>
                <Link to="/guide" className={buttonClass.outline}>
                  📋 Guide Allemagne
                </Link>
              </div>

              <div className="flex flex-wrap gap-2 text-sm text-brand-brown">
                <span className="stat-chip">Acces rapide</span>
                <span className="stat-chip">Design mobile-first</span>
                <span className="stat-chip">A1 a C2</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className={cx(cardClass.base, 'space-y-4 p-6')}>
                <p className="section-kicker">Parcours</p>
                <div className="grid gap-3">
                  {[
                    'Lecons et exercices utiles',
                    'Pratique orale guidee',
                    'Guide Allemagne concret',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-[1.25rem] bg-brand-sky/55 px-4 py-3 text-sm font-medium text-brand-text">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-blue shadow-sm">✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className={cx(cardClass.soft, 'grid gap-4 p-6')}>
                {['🇩🇪', '🎓', '✈️', '🎤'].map((flag, index) => (
                  <div key={flag} className="flex items-center justify-between rounded-[1.5rem] border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
                    <span className="text-2xl">{flag}</span>
                    <span className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-brown">
                      {['Oral', 'Objectif', 'Visa', 'Cours'][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section" ref={statsRef}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STATS.map((s) => (
            <StatCard key={s.valeur} {...s} active={statsVisible} />
          ))}
        </div>
      </section>

      <section className="page-section space-y-8">
        <div className="space-y-3">
          <p className="section-kicker">Niveaux</p>
          <h2 className="section-title">Voie complete de debutant a maitrise</h2>
          <p className="section-copy">180 lecons organisees en 6 niveaux, avec une lecture visuelle plus nette et plus utile.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {NIVEAUX.map((n) => (
            <Link
              key={n.code}
              to={user ? `/cours/${n.code}` : '/register'}
              className={cx(cardClass.interactive, 'group relative overflow-hidden p-6')}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-blue to-brand-green opacity-60" />
              <div className="mb-6 flex items-start justify-between">
                <span className="text-3xl">{n.emoji}</span>
                <span className={levelBadgeClass(n.code)}>{n.code}</span>
              </div>
              <h3 className="font-display text-2xl font-semibold text-brand-text">{n.nom}</h3>
              <p className="mt-2 text-brand-brown">{n.fr}</p>
              <div className="mt-6 flex items-center justify-between text-sm font-semibold text-brand-brown">
                <span>{n.lecons} lecons</span>
                <span className="text-brand-blue transition group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-section space-y-8">
        <div className="space-y-3">
          <p className="section-kicker">Pourquoi EAM</p>
          <h2 className="section-title">Une plateforme orientee resultat, pas simple decor</h2>
          <p className="section-copy">Le nouveau style soutient une promesse simple: apprendre, pratiquer et avancer vers l&apos;Allemagne.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {RAISONS.map((r) => (
            <div key={r.titre} className={cx(cardClass.base, 'flex h-full flex-col gap-4 p-6')}>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-sky text-2xl shadow-sm">{r.emoji}</span>
              <div>
                <h3 className="font-display text-xl font-semibold text-brand-text">{r.titre}</h3>
                <p className="mt-1 text-sm uppercase tracking-[0.24em] text-brand-blue">{r.fr}</p>
              </div>
              <p className="text-base leading-relaxed text-brand-brown">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-section space-y-8">
        <div className="space-y-3">
          <p className="section-kicker">Temoignages</p>
          <h2 className="section-title">Ils sont deja en Allemagne</h2>
          <p className="section-copy">Des apprenants passes par EAM et partis avec un objectif concret.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {TEMOIGNAGES.map((temoin) => (
            <div key={temoin.nom} className={cx(cardClass.base, 'flex h-full flex-col gap-5 p-6')}>
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-display font-semibold text-white shadow-soft"
                  style={{ backgroundColor: temoin.couleur }}
                >
                  {temoin.avatar}
                </div>
                <div>
                  <p className="font-display text-xl font-semibold text-brand-text">{temoin.nom}</p>
                  <p className="text-sm text-brand-brown">{temoin.lieu}</p>
                  <p className="text-sm font-semibold text-brand-blue">{temoin.programme}</p>
                </div>
              </div>
              <p className="text-base leading-relaxed text-brand-brown">&quot;{temoin.texte}&quot;</p>
            </div>
          ))}
        </div>
      </section>

      <section className="shell">
        <div className="overflow-hidden rounded-[2.5rem] border border-brand-border/80 bg-gradient-to-br from-brand-text to-brand-blue px-6 py-10 text-white shadow-panel sm:px-10 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-4">
              <p className="section-kicker text-white/75">Dernier appel</p>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Pret pour l&apos;Allemagne ?</h2>
              <p className="max-w-2xl text-lg text-white/80">
                Une interface plus claire ne vaut que si elle aide a avancer. C&apos;est exactement le but de cette nouvelle version.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <button className={buttonClass.secondary} onClick={handleCTA}>
                🚀 {user ? 'Retour aux cours' : 'Commencer maintenant'}
              </button>
              {!user && (
                <Link to="/login" className="inline-flex items-center justify-center rounded-full border border-white/25 px-5 py-3 font-semibold text-white/90 transition hover:bg-white/10">
                  Deja un compte ? Se connecter
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
