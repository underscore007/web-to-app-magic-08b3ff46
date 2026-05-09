import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { useLang } from '@context/LangContext'
import Icon from '@components/ui/Icon'
import { buttonClass, cx } from '@utils/ui'

const NAV_PUBLIC = [
  {
    to: '/guide',
    label: { de: 'Deutschland Guide', fr: 'Guide Allemagne' },
    hint: { de: 'Praktische Ankunftstipps', fr: "Conseils d'arrivee" },
    icon: 'link',
  },
]

const NAV_PRIVATE = [
  {
    to: '/dashboard',
    label: { de: 'Dashboard', fr: 'Tableau de bord' },
    hint: { de: 'Ihre Lernubersicht', fr: 'Votre progression' },
    icon: 'home',
  },
  {
    to: '/cours',
    label: { de: 'Kurse', fr: 'Cours' },
    hint: { de: 'Lecons et exercices', fr: 'Lecons et exercices' },
    icon: 'book',
  },
  {
    to: '/sprechen',
    label: { de: 'Sprechen', fr: 'Sprechen' },
    hint: { de: 'Orale Praxis', fr: 'Pratique orale' },
    icon: 'mic',
  },
  {
    to: '/communaute',
    label: { de: 'Community', fr: 'Communaute' },
    hint: { de: 'Austausch mit anderen', fr: 'Echanger avec les autres' },
    icon: 'messageCircle',
  },
  {
    to: '/guide',
    label: { de: 'Deutschland Guide', fr: 'Guide Allemagne' },
    hint: { de: 'Papiere et integration', fr: 'Papiers et integration' },
    icon: 'link',
  },
]

const LANG_OPTIONS = [
  { code: 'de', label: 'DE' },
  { code: 'mix', label: 'MIX' },
  { code: 'fr', label: 'FR' },
]

function Navbar() {
  const { user, logout } = useAuth()
  const { lang, setLang, t } = useLang()
  const navigate = useNavigate()
  const location = useLocation()

  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [desktopHidden, setDesktopHidden] = useState(false)
  const menuRef = useRef(null)
  const lastScrollYRef = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY
      const delta = currentScrollY - lastScrollYRef.current

      setScrolled(currentScrollY > 10)

      if (currentScrollY <= 24) {
        setDesktopHidden(false)
        lastScrollYRef.current = currentScrollY
        return
      }

      if (Math.abs(delta) < 8) {
        return
      }

      if (delta > 0 && currentScrollY > 140) {
        setDesktopHidden(true)
      } else if (delta < 0) {
        setDesktopHidden(false)
      }

      lastScrollYRef.current = currentScrollY
    }

    lastScrollYRef.current = window.scrollY
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setDesktopHidden(false)
  }, [location.pathname])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!menuOpen) return

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const navLinks = user ? NAV_PRIVATE : NAV_PUBLIC
  const userInitial = user?.prenom?.[0]?.toUpperCase() || '?'
  const userLevel = user?.niveau ? String(user.niveau).toUpperCase() : null
  const navLinkBase =
    'group inline-flex items-center gap-3 rounded-[1.35rem] px-3.5 py-2.5 text-sm font-semibold transition duration-300 focus:outline-none focus:ring-4 focus:ring-brand-blue/15'
  const navIconBase =
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-[1rem] border transition duration-300'
  const langButton = (active) =>
    cx(
      'rounded-[1rem] px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition duration-300',
      active ? 'bg-brand-blue text-white shadow-soft' : 'text-brand-brown hover:bg-white/90 hover:text-brand-text'
    )

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-50 will-change-transform transition-[padding,transform] duration-300',
        scrolled ? 'pt-2' : 'pt-3',
        desktopHidden ? 'xl:-translate-y-[calc(100%+1rem)]' : 'translate-y-0'
      )}
      ref={menuRef}
    >
      <div className="shell">
        <div
          className={cx(
            'relative overflow-hidden rounded-[2.2rem] border px-4 py-3 md:px-6',
            scrolled
              ? 'border-white/80 bg-white/78 shadow-[0_28px_60px_-40px_rgba(53,94,75,0.38)] backdrop-blur-2xl'
              : 'border-white/65 bg-white/62 shadow-[0_18px_50px_-36px_rgba(75,156,211,0.32)] backdrop-blur-xl'
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(75,156,211,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(111,166,122,0.18),transparent_26%)]"
            aria-hidden="true"
          />

          <div className="relative flex items-center justify-between gap-4">
            <Link to="/" className="flex min-w-0 items-center gap-3" aria-label={t('EAM Startseite', 'EAM Accueil')}>
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.2rem] border border-white/80 bg-gradient-to-br from-brand-sky via-white to-brand-sand text-brand-blue shadow-sm"
                aria-hidden="true"
              >
                <Icon name="gem" size={20} className="icon" />
              </span>

              <span className="hidden min-w-0 sm:block">
                <span className="block font-display text-lg font-semibold tracking-tight text-brand-text">EAM</span>
                <span className="mt-1 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-brown/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-green" aria-hidden="true" />
                  {t('Deutsch fur Malagasy', 'Allemand pour Malgaches', { mixSep: ' / ' })}
                </span>
              </span>
            </Link>

            <div className="hidden flex-1 items-center justify-center xl:flex">
              <nav
                className="rounded-[1.75rem] border border-white/80 bg-white/52 p-1.5 shadow-inner shadow-white/50 backdrop-blur-sm"
                aria-label={t('Hauptnavigation', 'Navigation principale')}
              >
                <ul className="flex items-center gap-1.5">
                  {navLinks.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          cx(
                            navLinkBase,
                            isActive
                              ? 'bg-white text-brand-text shadow-soft'
                              : 'text-brand-brown/85 hover:bg-white/80 hover:text-brand-text'
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              className={cx(
                                navIconBase,
                                isActive
                                  ? 'border-brand-blue/15 bg-brand-blue text-white shadow-sm'
                                  : 'border-white/80 bg-white/80 text-brand-brown group-hover:border-brand-blue/20 group-hover:bg-brand-sky group-hover:text-brand-blueDeep'
                              )}
                              aria-hidden="true"
                            >
                              <Icon name={item.icon} size={18} className="icon" />
                            </span>

                            <span>{t(item.label)}</span>

                            <span
                              className={cx(
                                'h-2 w-2 rounded-full transition duration-300',
                                isActive ? 'bg-brand-green' : 'bg-brand-blue/0 group-hover:bg-brand-blue/35'
                              )}
                              aria-hidden="true"
                            />
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="hidden items-center gap-3 xl:flex">
              <div className="rounded-[1.5rem] border border-white/75 bg-white/70 p-1 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-1" role="group" aria-label={t('Sprache wechseln', 'Changer de langue')}>
                  {LANG_OPTIONS.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      className={langButton(lang === option.code)}
                      onClick={() => setLang(option.code)}
                      aria-pressed={lang === option.code}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {user ? (
                <div className="flex items-center gap-3 rounded-[1.6rem] border border-white/80 bg-white/78 p-2 pl-3 shadow-soft backdrop-blur-sm">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-gradient-to-br from-brand-green/15 via-white to-brand-sky font-display font-semibold text-brand-greenDeep ring-1 ring-brand-green/10"
                    aria-label={`${t('Angemeldet als', 'Connecte en tant que')} ${user.prenom}`}
                  >
                    {userInitial}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-brand-text">{user.prenom}</p>
                      {userLevel ? (
                        <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-greenDeep ring-1 ring-brand-green/15">
                          {userLevel}
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-xs text-brand-brown/75">{user.email}</p>
                  </div>

                  <button className={cx(buttonClass.ghost, 'px-4 py-2.5')} onClick={handleLogout} type="button">
                    {t('Abmelden', 'Se deconnecter')}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-[1.6rem] border border-white/75 bg-white/72 p-2 shadow-sm backdrop-blur-sm">
                  <Link to="/login" className={cx(buttonClass.outline, 'px-4 py-2.5')}>
                    {t('Anmelden', 'Se connecter')}
                  </Link>
                  <Link to="/register" className={cx(buttonClass.primary, 'px-4 py-2.5')}>
                    {t('Registrieren', "S'inscrire")}
                  </Link>
                </div>
              )}
            </div>

            <button
              className={cx(
                'inline-flex h-12 w-12 items-center justify-center rounded-[1.4rem] border border-white/80 bg-white/78 text-brand-text shadow-soft backdrop-blur-sm transition duration-300 hover:bg-white xl:hidden',
                menuOpen && 'border-brand-blue/15 bg-brand-blue text-white'
              )}
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? t('Menue schliessen', 'Fermer le menu') : t('Menue ouvrir', 'Ouvrir le menu')}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              type="button"
            >
              <div className="flex flex-col gap-1.5">
                <span className={cx('h-0.5 w-5 rounded-full bg-current transition', menuOpen && 'translate-y-2 rotate-45')} />
                <span className={cx('h-0.5 w-5 rounded-full bg-current transition', menuOpen && 'opacity-0')} />
                <span className={cx('h-0.5 w-5 rounded-full bg-current transition', menuOpen && '-translate-y-2 -rotate-45')} />
              </div>
            </button>
          </div>
        </div>
      </div>

      <div
        className={cx(
          'pointer-events-none fixed inset-0 z-40 bg-slate-950/30 opacity-0 transition xl:hidden',
          menuOpen && 'pointer-events-auto opacity-100'
        )}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <div
        id="mobile-menu"
        className={cx(
          'fixed inset-x-4 top-[5.75rem] z-50 origin-top rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_30px_70px_-40px_rgba(53,94,75,0.42)] backdrop-blur-2xl transition duration-300 xl:hidden',
          menuOpen ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        )}
        aria-hidden={!menuOpen}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(75,156,211,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(111,166,122,0.14),transparent_28%)]"
          aria-hidden="true"
        />

        <div className="relative">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-blue">
                {t('Navigation', 'Navigation')}
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-brand-text">
                {t('Schneller Zugriff', 'Acces rapide')}
              </h2>
            </div>

            {userLevel ? (
              <span className="rounded-full border border-brand-green/15 bg-brand-green/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-greenDeep">
                {userLevel}
              </span>
            ) : null}
          </div>

          <div className="mb-5 rounded-[1.6rem] border border-white/75 bg-white/72 p-1 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-1" role="group" aria-label={t('Sprache wechseln', 'Changer de langue')}>
              {LANG_OPTIONS.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  className={cx(langButton(lang === option.code), 'flex-1')}
                  onClick={() => setLang(option.code)}
                  aria-pressed={lang === option.code}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <nav aria-label={t('Navigation mobile', 'Navigation mobile')}>
            <ul className="grid gap-2.5">
              {navLinks.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cx(
                        'group flex items-center justify-between rounded-[1.6rem] border px-4 py-3.5 transition duration-300 focus:outline-none focus:ring-4 focus:ring-brand-blue/15',
                        isActive
                          ? 'border-brand-blue/20 bg-white text-brand-text shadow-soft'
                          : 'border-transparent bg-brand-sky/55 text-brand-text hover:border-white/70 hover:bg-white/85'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className="inline-flex min-w-0 items-center gap-3">
                          <span
                            className={cx(
                              'flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] border transition duration-300',
                              isActive
                                ? 'border-brand-blue/15 bg-brand-blue text-white shadow-soft'
                                : 'border-white/80 bg-white/75 text-brand-blueDeep group-hover:border-brand-blue/20 group-hover:bg-brand-sky'
                            )}
                            aria-hidden="true"
                          >
                            <Icon name={item.icon} size={18} className="icon" />
                          </span>

                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold">{t(item.label)}</span>
                            <span className="block truncate text-xs text-brand-brown/75">{t(item.hint)}</span>
                          </span>
                        </span>

                        <span
                          className={cx(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition duration-300',
                            isActive
                              ? 'bg-brand-sky/70 text-brand-blueDeep'
                              : 'bg-white/80 text-brand-brown group-hover:bg-brand-sky/80 group-hover:text-brand-blueDeep'
                          )}
                          aria-hidden="true"
                        >
                          <Icon name="arrowRight" size={18} className="icon" />
                        </span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-5 rounded-[1.7rem] border border-white/75 bg-white/82 p-4 shadow-soft backdrop-blur-sm">
            {user ? (
              <>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-gradient-to-br from-brand-green/15 via-white to-brand-sky font-display text-lg font-semibold text-brand-greenDeep ring-1 ring-brand-green/10">
                    {userInitial}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-brand-text">
                        {user.prenom} {user.nom}
                      </p>
                      {userLevel ? (
                        <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-greenDeep ring-1 ring-brand-green/15">
                          {userLevel}
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-sm text-brand-brown/70">{user.email}</p>
                  </div>
                </div>

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                  {t('Bereit zum Lernen', 'Pret a apprendre')}
                </div>

                <button className={cx(buttonClass.ghost, 'w-full')} onClick={handleLogout} type="button">
                  {t('Abmelden', 'Se deconnecter')}
                </button>
              </>
            ) : (
              <div className="grid gap-3">
                <Link to="/login" className={cx(buttonClass.outline, 'w-full')}>
                  {t('Anmelden', 'Se connecter')}
                </Link>
                <Link to="/register" className={cx(buttonClass.primary, 'w-full')}>
                  {t('Registrieren', "S'inscrire")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
