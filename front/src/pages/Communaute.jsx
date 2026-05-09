import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { useLang } from '@context/LangContext'
import ChatRoom from '@components/chat/ChatRoom'
import DirectInbox from '@components/chat/DirectInbox'
import UserOnline from '@components/chat/UserOnline'
import { cardClass, cx, levelBadgeClass } from '@utils/ui'

const CANAUX = [
  { id: 'general', emoji: '💬', nom: 'General', descDe: 'Allgemeine Diskussionen', descFr: 'Discussions generales' },
  { id: 'a1-a2', emoji: '🌱', nom: 'A1 & A2', descDe: 'Anfanger', descFr: 'Debutants' },
  { id: 'b1-b2', emoji: '🌳', nom: 'B1 & B2', descDe: 'Mittelstufe', descFr: 'Intermediaires' },
  { id: 'c1-c2', emoji: '🏆', nom: 'C1 & C2', descDe: 'Fortgeschritten', descFr: 'Avances' },
  { id: 'ausbildung', emoji: '🎓', nom: 'Ausbildung', descDe: 'Berufsausbildung in Deutschland', descFr: 'Formation pro en Allemagne' },
  { id: 'aupair', emoji: '👶', nom: 'Au Pair', descDe: 'Au Pair in Deutschland', descFr: 'Au pair en Allemagne' },
  { id: 'fsj-bfd', emoji: '🤝', nom: 'FSJ & BFD', descDe: 'Freiwilligendienst', descFr: 'Service volontaire' },
  { id: 'visa', emoji: '✈️', nom: 'Visa & Demarches', descDe: 'Verfahren und Dokumente', descFr: 'Procedures et documents' },
  { id: 'temoignages', emoji: '⭐', nom: 'Temoignages', descDe: 'Erfahrungen in Deutschland', descFr: 'Histoires des Malgaches en Allemagne' },
]

function getDirectEmoji(user) {
  if (!user?.niveau) return '✉️'
  if (user.niveau.startsWith('A')) return '🌱'
  if (user.niveau.startsWith('B')) return '🌳'
  return '🏆'
}

function getInitials(user) {
  const first = user?.prenom?.[0] || '?'
  const last = user?.nom?.[0] || ''
  return `${first}${last}`.trim().toUpperCase()
}

function formatDirectSubtitle(user) {
  return [user?.niveau, user?.objectif].filter(Boolean).join(' · ') || 'Conversation privee entre membres EAM'
}

function Communaute() {
  const { canal: canalParam } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLang()

  const [selectedDirectUser, setSelectedDirectUser] = useState(null)
  const [directRefreshToken, setDirectRefreshToken] = useState(0)
  const [sidebarView, setSidebarView] = useState('channels')
  const [mobilePanel, setMobilePanel] = useState('thread')

  const canalActif = (canalParam || 'general').toLowerCase()
  const canal = useMemo(() => CANAUX.find((item) => item.id === canalActif) || CANAUX[0], [canalActif])
  const isDirectMode = Boolean(selectedDirectUser?.id)

  useEffect(() => {
    if (canalParam) {
      setSelectedDirectUser(null)
      setSidebarView('channels')
    }
  }, [canalParam])

  const handleOpenCanal = (canalId) => {
    setSelectedDirectUser(null)
    setSidebarView('channels')
    setMobilePanel('thread')
    navigate(`/communaute/${canalId}`)
  }

  const handleOpenDirect = (member) => {
    setSelectedDirectUser(member)
    setSidebarView('direct')
    setMobilePanel('thread')
  }

  const handleReturnToCanal = () => {
    setSelectedDirectUser(null)
    setSidebarView('channels')
    setMobilePanel('thread')
  }

  const bumpDirectRefresh = () => {
    setDirectRefreshToken((current) => current + 1)
  }

  const headerVisual = isDirectMode
    ? {
      emoji: getDirectEmoji(selectedDirectUser),
      title: `${selectedDirectUser?.prenom || ''} ${selectedDirectUser?.nom || ''}`.trim() || 'Message prive',
      subtitle: formatDirectSubtitle(selectedDirectUser),
      typeLabel: 'Message prive',
    }
    : {
      emoji: canal.emoji,
      title: canal.nom,
      subtitle: t(canal.descDe, canal.descFr),
      typeLabel: 'Canal public',
    }

  return (
    <div className="shell pb-24 lg:pb-10">
      <div className="grid min-h-[calc(100vh-8rem)] gap-4 lg:grid-cols-[24rem_minmax(0,1fr)]">
        <aside
          className={cx(
            cardClass.base,
            mobilePanel === 'sidebar' ? 'flex' : 'hidden',
            'min-h-0 flex-col overflow-hidden lg:flex'
          )}
        >
          <div className="border-b border-brand-border/70 bg-[linear-gradient(135deg,rgba(234,244,255,0.94),rgba(255,255,255,0.9))] px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-blue">Messagerie EAM</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-brand-text">
                  {t('Community', 'Communaute')}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-brand-brown">
                  {sidebarView === 'direct'
                    ? 'Retrouve tes conversations privees et lance un nouveau message rapidement.'
                    : 'Passe d un canal a l autre comme dans une vraie boite de reception.'}
                </p>
              </div>

              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-border bg-white/90 text-lg text-brand-text shadow-sm lg:hidden"
                onClick={() => setMobilePanel('thread')}
                aria-label="Fermer la boite de reception"
              >
                ×
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 rounded-[1.4rem] bg-white/70 p-1">
              <button
                type="button"
                className={cx(
                  'rounded-[1.1rem] px-3 py-2 text-sm font-semibold transition',
                  sidebarView === 'channels'
                    ? 'bg-brand-blue text-white shadow-soft'
                    : 'text-brand-brown hover:bg-brand-sky/80'
                )}
                onClick={() => setSidebarView('channels')}
              >
                Canaux
              </button>
              <button
                type="button"
                className={cx(
                  'rounded-[1.1rem] px-3 py-2 text-sm font-semibold transition',
                  sidebarView === 'direct'
                    ? 'bg-brand-blue text-white shadow-soft'
                    : 'text-brand-brown hover:bg-brand-sky/80'
                )}
                onClick={() => setSidebarView('direct')}
              >
                Messages prives
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {sidebarView === 'direct' ? (
              <DirectInbox
                selectedUserId={selectedDirectUser?.id || null}
                onSelectUser={handleOpenDirect}
                refreshToken={directRefreshToken}
              />
            ) : (
              <nav className="grid gap-2" aria-label={t('Kanale', 'Canaux')}>
                {CANAUX.map((item) => {
                  const active = !isDirectMode && canalActif === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={cx(
                        'w-full rounded-[1.45rem] border px-4 py-3 text-left transition',
                        active
                          ? 'border-brand-blue bg-brand-blue text-white shadow-soft'
                          : 'border-transparent bg-white/78 text-brand-text hover:border-brand-blue/20 hover:bg-white'
                      )}
                      onClick={() => handleOpenCanal(item.id)}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={cx(
                            'flex h-11 w-11 items-center justify-center rounded-2xl text-xl',
                            active ? 'bg-white/15' : 'bg-brand-sky'
                          )}
                          aria-hidden="true"
                        >
                          {item.emoji}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate font-semibold">{item.nom}</p>
                            <span
                              className={cx(
                                'rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]',
                                active ? 'bg-white/15 text-white' : 'bg-brand-sky text-brand-brown'
                              )}
                            >
                              public
                            </span>
                          </div>

                          <p className={cx('mt-2 text-sm leading-relaxed', active ? 'text-white/78' : 'text-brand-brown')}>
                            {t(item.descDe, item.descFr)}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </nav>
            )}
          </div>

          <div className="border-t border-brand-border/70 bg-white/80 p-4">
            <div className="rounded-[1.55rem] border border-brand-border/70 bg-brand-sky/35 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-green/15 font-display text-base font-semibold text-brand-greenDeep">
                  {getInitials(user)}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-semibold text-brand-text">{user?.prenom} {user?.nom}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={levelBadgeClass(user?.niveau || 'A1')}>
                      {user?.niveau || 'A1'}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-brown">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      en ligne
                    </span>
                  </div>
                </div>
              </div>

              {user?.objectif ? (
                <p className="mt-3 text-sm leading-relaxed text-brand-brown">{user.objectif}</p>
              ) : null}
            </div>
          </div>
        </aside>

        <main
          className={cx(
            cardClass.base,
            mobilePanel === 'thread' ? 'flex' : 'hidden',
            'min-h-0 flex-col overflow-hidden lg:flex'
          )}
        >
          <div className="border-b border-brand-border/70 bg-white/82 px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-border bg-white/90 text-lg text-brand-text shadow-sm lg:hidden"
                  onClick={() => setMobilePanel('sidebar')}
                  aria-label="Ouvrir la boite de reception"
                >
                  ☰
                </button>

                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-sky text-2xl shadow-sm" aria-hidden="true">
                  {headerVisual.emoji}
                </span>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-display text-2xl font-semibold text-brand-text">{headerVisual.title}</h3>
                    <span className="rounded-full bg-brand-sky px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-brown">
                      {headerVisual.typeLabel}
                    </span>
                    {isDirectMode && selectedDirectUser?.niveau ? (
                      <span className={levelBadgeClass(selectedDirectUser.niveau)}>
                        {selectedDirectUser.niveau}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-brand-brown">{headerVisual.subtitle}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isDirectMode ? (
                  <button
                    type="button"
                    className="rounded-full border border-brand-border bg-white/90 px-4 py-2 text-sm font-semibold text-brand-text shadow-sm transition hover:bg-brand-sky/60"
                    onClick={handleReturnToCanal}
                  >
                    Retour au canal
                  </button>
                ) : (
                  <UserOnline canal={canalActif} />
                )}
              </div>
            </div>
          </div>

          {isDirectMode ? (
            <div className="border-b border-brand-border/60 bg-brand-sky/30 px-4 py-3 text-sm text-brand-brown sm:px-5">
              Conversation privee. Les messages ici sont visibles seulement par vous deux.
            </div>
          ) : (
            <div className="border-b border-brand-border/60 bg-brand-sky/25 px-4 py-3 text-sm text-brand-brown sm:px-5">
              Canal public #{canal.id}. Les membres peuvent lire et repondre en direct.
            </div>
          )}

          <div className="flex min-h-0 flex-1 bg-[linear-gradient(180deg,rgba(234,244,255,0.38),rgba(255,255,255,0.96))]">
            {isDirectMode ? (
              <ChatRoom
                mode="direct"
                recipient={selectedDirectUser}
                onPartnerLoaded={setSelectedDirectUser}
                onConversationActivity={bumpDirectRefresh}
              />
            ) : (
              <ChatRoom
                mode="public"
                canal={canalActif}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Communaute
