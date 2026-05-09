import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { buttonClass, cardClass, cx, inputClass, levelBadgeClass } from '@utils/ui'

// ── Messages d'erreur bilingues ────────────────────────────
const ERRORS = {
  required_prenom:   'Vorname erforderlich · Prénom requis',
  required_nom:      'Nom erforderlich · Nom requis',
  required_email:    'E-Mail erforderlich · Email requis',
  invalid_email:     'Ungültige E-Mail · Email invalide',
  required_password: 'Passwort erforderlich · Mot de passe requis',
  short_password:    'Mindestens 6 Zeichen · 6 caractères minimum',
  required_confirm:  'Passwort bestätigen · Confirmez le mot de passe',
  mismatch_confirm:  'Passwörter stimmen nicht überein · Les mots de passe ne correspondent pas',
  email_exists:      'E-Mail déjà utilisée · Email déjà utilisé',
  server_error:      'Serverfehler, réessayez · Erreur serveur, réessayez',
  network_error:     'Verbindung prüfen · Vérifiez votre connexion internet',
}

// ── Niveaux disponibles ────────────────────────────────────
const NIVEAUX = [
  { code: 'A1', label: 'A1 — Anfänger · Débutant complet', emoji: '🌱' },
  { code: 'A2', label: 'A2 — Grundstufe · Élémentaire', emoji: '🌿' },
  { code: 'B1', label: 'B1 — Mittelstufe · Intermédiaire', emoji: '🌳' },
  { code: 'B2', label: 'B2 — Mittelstufe+ · Intermédiaire+', emoji: '⭐' },
  { code: 'C1', label: 'C1 — Fortgeschritten · Avancé', emoji: '🏆' },
  { code: 'C2', label: 'C2 — Beherrschung · Maîtrise', emoji: '💎' },
]

// ── Objectifs disponibles ──────────────────────────────────
const OBJECTIFS = [
  { code: 'ausbildung', label: '🎓 Ausbildung — Formation pro', desc: 'Formation professionnelle en Allemagne' },
  { code: 'aupair',     label: '👶 Au Pair',                    desc: 'Séjour famille en Allemagne' },
  { code: 'fsj',        label: '🤝 FSJ — Service volontaire',   desc: 'Freiwilliges Soziales Jahr' },
  { code: 'bfd',        label: '🌍 BFD — Service civique',      desc: 'Bundesfreiwilligendienst' },
  { code: 'etudes',     label: '📚 Études — Universität',       desc: 'Université en Allemagne' },
  { code: 'autre',      label: '✨ Andere · Autre',             desc: 'Autre objectif' },
]

// ── Validation ─────────────────────────────────────────────
function validate(form) {
  const errs = {}
  if (!form.prenom.trim())                        errs.prenom   = ERRORS.required_prenom
  if (!form.nom.trim())                           errs.nom      = ERRORS.required_nom
  if (!form.email.trim())                         errs.email    = ERRORS.required_email
  else if (!/\S+@\S+\.\S+/.test(form.email))     errs.email    = ERRORS.invalid_email
  if (!form.password)                             errs.password = ERRORS.required_password
  else if (form.password.length < 6)             errs.password = ERRORS.short_password
  if (!form.confirm)                              errs.confirm  = ERRORS.required_confirm
  else if (form.confirm !== form.password)        errs.confirm  = ERRORS.mismatch_confirm
  return errs
}

// ── Indicateur force mot de passe ─────────────────────────
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 6)  score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score, label: 'Schwach · Faible', color: '#C62828' }
  if (score <= 3) return { score, label: 'Mittel · Moyen', color: '#E65100' }
  return           { score, label: 'Stark · Fort', color: '#2E7D32' }
}

// ── Composant Register ─────────────────────────────────────
function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()

  const [form, setForm] = useState({
    prenom:   '',
    nom:      '',
    email:    '',
    password: '',
    confirm:  '',
    niveau:   'A1',
    objectif: 'ausbildung',
  })
  const [errors, setErrors]     = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [step, setStep]         = useState(1) // Étape 1: infos perso | Étape 2: niveau + objectif

  const strength = getPasswordStrength(form.password)

  // ── Mise à jour champ ──
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    if (apiError)     setApiError('')
  }

  // ── Passer à l'étape 2 ──
  const handleNextStep = (e) => {
    e.preventDefault()
    // Valider seulement les champs de l'étape 1
    const stepErrs = {}
    if (!form.prenom.trim())                      stepErrs.prenom   = ERRORS.required_prenom
    if (!form.nom.trim())                         stepErrs.nom      = ERRORS.required_nom
    if (!form.email.trim())                       stepErrs.email    = ERRORS.required_email
    else if (!/\S+@\S+\.\S+/.test(form.email))   stepErrs.email    = ERRORS.invalid_email
    if (!form.password)                           stepErrs.password = ERRORS.required_password
    else if (form.password.length < 6)           stepErrs.password = ERRORS.short_password
    if (!form.confirm)                            stepErrs.confirm  = ERRORS.required_confirm
    else if (form.confirm !== form.password)      stepErrs.confirm  = ERRORS.mismatch_confirm

    if (Object.keys(stepErrs).length > 0) {
      setErrors(stepErrs)
      return
    }
    setStep(2)
  }

  // ── Soumission finale ──
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      await register({
        prenom:   form.prenom.trim(),
        nom:      form.nom.trim(),
        email:    form.email.trim().toLowerCase(),
        password: form.password,
        niveau:   form.niveau,
        objectif: form.objectif,
      })
      // Connexion automatique après register (dans AuthContext)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (err.response?.status === 409) {
        setApiError(ERRORS.email_exists)
        setStep(1) // Retourner à l'étape 1 pour corriger l'email
      } else if (err.code === 'ERR_NETWORK' || !navigator.onLine) {
        setApiError(ERRORS.network_error)
      } else {
        setApiError(ERRORS.server_error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="shell">
      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative overflow-hidden rounded-[2.4rem] border border-white/70 bg-gradient-to-br from-brand-blue via-sky-500 to-brand-green p-8 text-white shadow-panel">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_24%)]" />
          <div className="relative space-y-6">
            <span className="stat-chip bg-white/12 text-white">🚀 Nouveau depart</span>
            <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight">Starte deinen Weg.</h2>
            <p className="max-w-md text-lg text-white/80">Creez votre compte, choisissez votre niveau et reliez l&apos;apprentissage a un vrai projet Allemagne.</p>
            <div className="space-y-3">
              {[
                { num: '01', label: 'Konto erstellen', fr: 'Creer un compte' },
                { num: '02', label: 'Deutsch lernen', fr: 'Apprendre l allemand' },
                { num: '03', label: 'Nach Deutschland', fr: 'Partir en Allemagne' },
              ].map((item) => (
                <div key={item.num} className="flex items-center gap-4 rounded-[1.5rem] border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                  <span className="font-display text-xl font-semibold">{item.num}</span>
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-sm text-white/70">{item.fr}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={cx(cardClass.base, 'p-6 sm:p-8')}>
          <div className="mb-8 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 rounded-full border border-brand-border/70 bg-brand-sky/60 px-4 py-2 text-sm font-semibold text-brand-text">
              🏫 <span className="font-display text-base">EAM</span>
            </Link>
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-text">Konto erstellen</h1>
              <p className="mt-2 text-brand-brown">Creer un compte gratuit</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={cx('flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold', step >= 1 ? 'bg-brand-blue text-white' : 'bg-brand-sky text-brand-brown')}>1</div>
              <div className={cx('h-1 flex-1 rounded-full', step >= 2 ? 'bg-brand-green' : 'bg-brand-border')} />
              <div className={cx('flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold', step >= 2 ? 'bg-brand-green text-white' : 'bg-brand-sky text-brand-brown')}>2</div>
            </div>
            <p className="text-sm uppercase tracking-[0.24em] text-brand-brown">
              {step === 1 ? 'Persönliche Daten · Informations personnelles' : 'Niveau et objectif'}
            </p>
          </div>

          {apiError && (
            <div className="inline-alert-error mb-6" role="alert">
              ⚠️ {apiError}
            </div>
          )}

          {step === 1 && (
            <form className="space-y-5" onSubmit={handleNextStep} noValidate>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="prenom" className="input-label">Vorname · Prenom</label>
                  <input
                    id="prenom"
                    name="prenom"
                    type="text"
                    autoComplete="given-name"
                    autoFocus
                    placeholder="Ravo"
                    value={form.prenom}
                    onChange={handleChange}
                    className={cx(inputClass, errors.prenom && 'border-rose-300 focus:border-rose-400 focus:ring-rose-200')}
                    aria-invalid={!!errors.prenom}
                  />
                  {errors.prenom && <span className="text-sm text-rose-600" role="alert">{errors.prenom}</span>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="nom" className="input-label">Nachname · Nom</label>
                  <input
                    id="nom"
                    name="nom"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Rakoto"
                    value={form.nom}
                    onChange={handleChange}
                    className={cx(inputClass, errors.nom && 'border-rose-300 focus:border-rose-400 focus:ring-rose-200')}
                    aria-invalid={!!errors.nom}
                  />
                  {errors.nom && <span className="text-sm text-rose-600" role="alert">{errors.nom}</span>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="input-label">E-Mail · Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="ravo@exemple.com"
                  value={form.email}
                  onChange={handleChange}
                  className={cx(inputClass, errors.email && 'border-rose-300 focus:border-rose-400 focus:ring-rose-200')}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <span className="text-sm text-rose-600" role="alert">{errors.email}</span>}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="input-label">Passwort · Mot de passe</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className={cx(inputClass, 'pr-14', errors.password && 'border-rose-300 focus:border-rose-400 focus:ring-rose-200')}
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-2 right-2 rounded-full bg-brand-sky px-3 text-sm text-brand-brown transition hover:bg-brand-sky/80"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? 'Cacher' : 'Afficher'}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && <span className="text-sm text-rose-600" role="alert">{errors.password}</span>}
                {form.password && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((index) => (
                        <div key={index} className="h-2 rounded-full bg-brand-border" style={{ backgroundColor: index <= strength.score ? strength.color : undefined }} />
                      ))}
                    </div>
                    <span className="text-sm font-semibold" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm" className="input-label">Bestätigen · Confirmer le mot de passe</label>
                <div className="relative">
                  <input
                    id="confirm"
                    name="confirm"
                    type={showConf ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={handleChange}
                    className={cx(inputClass, 'pr-14', errors.confirm && 'border-rose-300 focus:border-rose-400 focus:ring-rose-200')}
                    aria-invalid={!!errors.confirm}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-2 right-2 rounded-full bg-brand-sky px-3 text-sm text-brand-brown transition hover:bg-brand-sky/80"
                    onClick={() => setShowConf(!showConf)}
                    aria-label={showConf ? 'Cacher' : 'Afficher'}
                  >
                    {showConf ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirm && <span className="text-sm text-rose-600" role="alert">{errors.confirm}</span>}
                {form.confirm && form.password && (
                  <span className={cx('text-sm font-semibold', form.confirm === form.password ? 'text-emerald-700' : 'text-rose-600')}>
                    {form.confirm === form.password ? '✅ Stimmt · Correspondent' : '❌ Different · Ne correspondent pas'}
                  </span>
                )}
              </div>

              <button type="submit" className={cx(buttonClass.primary, 'w-full')}>
                Weiter · Suivant →
              </button>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div className="space-y-3">
                <label className="input-label">Aktuelles Niveau · Votre niveau actuel</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {NIVEAUX.map((n) => (
                    <button
                      key={n.code}
                      type="button"
                      className={cx(
                        cardClass.soft,
                        'flex flex-col items-center gap-3 p-4 text-center transition',
                        form.niveau === n.code && 'border-brand-blue bg-brand-sky/80 shadow-soft'
                      )}
                      onClick={() => setForm((prev) => ({ ...prev, niveau: n.code }))}
                    >
                      <span className="text-2xl">{n.emoji}</span>
                      <span className={levelBadgeClass(n.code)}>{n.code}</span>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-brand-brown">{NIVEAUX.find((n) => n.code === form.niveau)?.label}</p>
              </div>

              <div className="space-y-3">
                <label className="input-label">Ziel · Votre objectif</label>
                <div className="grid gap-3">
                  {OBJECTIFS.map((objectif) => (
                    <button
                      key={objectif.code}
                      type="button"
                      className={cx(
                        cardClass.soft,
                        'flex flex-col items-start gap-1 p-4 text-left transition',
                        form.objectif === objectif.code && 'border-brand-green bg-emerald-50/70 shadow-soft'
                      )}
                      onClick={() => setForm((prev) => ({ ...prev, objectif: objectif.code }))}
                    >
                      <span className="font-semibold text-brand-text">{objectif.label}</span>
                      <span className="text-sm text-brand-brown">{objectif.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" className={cx(buttonClass.ghost, 'sm:flex-1')} onClick={() => setStep(1)} disabled={loading}>
                  ← Zurück · Retour
                </button>
                <button type="submit" className={cx(buttonClass.primary, 'sm:flex-1')} disabled={loading} aria-busy={loading}>
                  {loading ? (
                    <>
                      <span className="spinner h-[18px] w-[18px]" />
                      <span>Creation...</span>
                    </>
                  ) : (
                    '🚀 Creer le compte !'
                  )}
                </button>
              </div>

              <p className="text-sm leading-relaxed text-brand-brown">
                En creant un compte, vous acceptez les{' '}
                <Link to="/cgu" className="font-semibold text-brand-blue hover:text-brand-blueDeep">
                  conditions d&apos;utilisation
                </Link>{' '}
                et le fait qu&apos;EAM reste pense pour un usage simple, mobile et progressif.
              </p>
            </form>
          )}

          <p className="mt-8 text-brand-brown">
            Deja un compte ?{' '}
            <Link to="/login" className="font-semibold text-brand-blue hover:text-brand-blueDeep">
              Se connecter →
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}

export default Register
