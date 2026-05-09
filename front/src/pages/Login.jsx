import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { buttonClass, cardClass, cx, inputClass } from '@utils/ui'

// ── Messages d'erreur bilingues (allemand + français) ──────
const ERRORS = {
  required_email:   'E-Mail erforderlich · Email requis',
  invalid_email:    'Ungültige E-Mail · Email invalide',
  required_password:'Passwort erforderlich · Mot de passe requis',
  short_password:   'Mindestens 6 Zeichen · 6 caractères minimum',
  invalid_credentials: 'E-Mail oder Passwort falsch · Email ou mot de passe incorrect',
  server_error:     'Serverfehler, erneut versuchen · Erreur serveur, réessayez',
  network_error:    'Verbindung prüfen · Vérifiez votre connexion internet',
}

// ── Validation locale ──────────────────────────────────────
function validate(email, password) {
  const errs = {}
  if (!email.trim())                        errs.email    = ERRORS.required_email
  else if (!/\S+@\S+\.\S+/.test(email))    errs.email    = ERRORS.invalid_email
  if (!password)                            errs.password = ERRORS.required_password
  else if (password.length < 6)            errs.password = ERRORS.short_password
  return errs
}

// ── Composant Login ────────────────────────────────────────
function Login() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()

  // Redirection après login : page demandée ou dashboard
  const from = location.state?.from?.pathname || '/dashboard'

  const [form, setForm]       = useState({ email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  // ── Mise à jour champ ──
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Effacer l'erreur du champ modifié
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    if (apiError)     setApiError('')
  }

  // ── Soumission ──
  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')

    // Validation locale
    const errs = validate(form.email, form.password)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      // login() vient de AuthContext (fichier 9)
      // Il appelle POST /api/auth/login et stocke le JWT
      await login(form.email.trim().toLowerCase(), form.password)
      navigate(from, { replace: true })
    } catch (err) {
      if (err.response?.status === 401) {
        setApiError(ERRORS.invalid_credentials)
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
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative overflow-hidden rounded-[2.4rem] border border-white/70 bg-gradient-to-br from-brand-text via-brand-blue to-sky-500 p-8 text-white shadow-panel">
          <div className="absolute -left-10 top-8 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-brand-green/20 blur-3xl" />
          <div className="relative space-y-6">
            <span className="stat-chip bg-white/12 text-white">🇩🇪 Retour sur votre parcours</span>
            <div className="space-y-4">
              <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight">Willkommen zurück.</h2>
              <p className="max-w-md text-lg text-white/80">Retrouvez vos cours, votre progression et vos objectifs Allemagne dans une interface plus claire.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-3xl font-display font-semibold">2 400+</p>
                <p className="text-sm uppercase tracking-[0.24em] text-white/70">Apprenants actifs</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-3xl font-display font-semibold">180+</p>
                <p className="text-sm uppercase tracking-[0.24em] text-white/70">Lecons gratuites</p>
              </div>
            </div>
          </div>
        </section>

        <section className={cx(cardClass.base, 'p-6 sm:p-8')}>
          <div className="mb-8 space-y-3">
            <Link to="/" className="inline-flex items-center gap-3 rounded-full border border-brand-border/70 bg-brand-sky/60 px-4 py-2 text-sm font-semibold text-brand-text">
              🏫 <span className="font-display text-base">EAM</span>
            </Link>
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-text">Im Konto anmelden</h1>
              <p className="mt-2 text-brand-brown">Se connecter a votre compte</p>
            </div>
          </div>

          {apiError && (
            <div className="inline-alert-error mb-6" role="alert">
              ⚠️ {apiError}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="input-label">Adresse email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="nom@exemple.com"
                value={form.email}
                onChange={handleChange}
                className={cx(inputClass, errors.email && 'border-rose-300 focus:border-rose-400 focus:ring-rose-200')}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                disabled={loading}
              />
              {errors.email && <span id="email-error" className="text-sm text-rose-600" role="alert">{errors.email}</span>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="input-label">Passwort · Mot de passe</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className={cx(inputClass, 'pr-14', errors.password && 'border-rose-300 focus:border-rose-400 focus:ring-rose-200')}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-2 right-2 rounded-full bg-brand-sky px-3 text-sm font-medium text-brand-brown transition hover:bg-brand-sky/80"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <span id="password-error" className="text-sm text-rose-600" role="alert">{errors.password}</span>}
            </div>

            <div className="flex items-center justify-between gap-3 text-sm text-brand-brown">
              <span>Connexion securisee</span>
              <Link to="/forgot-password" className="font-semibold text-brand-blue hover:text-brand-blueDeep">
                Passwort vergessen ?
              </Link>
            </div>

            <button type="submit" className={cx(buttonClass.primary, 'w-full')} disabled={loading} aria-busy={loading}>
              {loading ? (
                <>
                  <span className="spinner h-[18px] w-[18px]" />
                  <span>Connexion...</span>
                </>
              ) : (
                '🚀 Anmelden · Se connecter'
              )}
            </button>
          </form>

          <div className="my-8 flex items-center gap-3 text-sm text-brand-brown/70">
            <span className="h-px flex-1 bg-brand-border" />
            oder · ou
            <span className="h-px flex-1 bg-brand-border" />
          </div>

          <div className="space-y-2 text-brand-brown">
            <p>
              Kein Konto ?{' '}
              <Link to="/register" className="font-semibold text-brand-blue hover:text-brand-blueDeep">
                Compte gratuit →
              </Link>
            </p>
            <p>
              Pas encore de compte ?{' '}
              <Link to="/register" className="font-semibold text-brand-blue hover:text-brand-blueDeep">
                Creer un compte gratuit
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Login
