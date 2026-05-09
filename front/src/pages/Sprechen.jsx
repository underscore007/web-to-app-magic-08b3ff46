import { useMemo, useState } from 'react'
import { useAuth } from '@context/AuthContext'
import { useLang } from '@context/LangContext'
import MicrophoneRecorder from '@components/sprechen/MicrophoneRecorder'
import PartnerMatcher from '@components/sprechen/PartnerMatcher'
import SessionSprechen from '@components/sprechen/SessionSprechen'
import ScoreSprechen from '@components/sprechen/ScoreSprechen'
import { buttonClass, cardClass, cx, levelBadgeClass } from '@utils/ui'

const ETATS = {
  ACCUEIL:  'accueil',
  ATTENTE:  'attente',
  SESSION:  'session',
  RESULTAT: 'resultat',
}

const NIVEAUX_SPRECHEN = [
  { code: 'A1', emoji: '🌱', de: 'Anfänger',        fr: 'Débutant' },
  { code: 'A2', emoji: '🌿', de: 'Grundstufe',      fr: 'Élémentaire' },
  { code: 'B1', emoji: '🌳', de: 'Mittelstufe',     fr: 'Intermédiaire' },
  { code: 'B2', emoji: '⭐', de: 'Mittelstufe+',    fr: 'Intermédiaire+' },
  { code: 'C1', emoji: '🏆', de: 'Fortgeschritten', fr: 'Avancé' },
  { code: 'C2', emoji: '💎', de: 'Beherrschung',    fr: 'Maîtrise' },
]

const EXERCICES_ORAUX = [
  {
    id: 1, niveau: 'A1',
    consigneDe: 'Begrüßungen üben',
    consigneFr: 'Pratiquez les salutations',
    phrase: 'Wie geht es Ihnen heute?',
    aide: 'Comment allez-vous aujourd’hui ?',
    reponseAttendues: ['Mir geht es gut', 'Es geht mir gut', 'Danke, gut'],
  },
  {
    id: 2, niveau: 'A1',
    consigneDe: 'Sich vorstellen',
    consigneFr: 'Présentez-vous',
    phrase: 'Wie heißen Sie? Woher kommen Sie?',
    aide: 'Comment vous appelez-vous ? D’où venez-vous ?',
    reponseAttendues: ['Ich heiße', 'Mein Name ist', 'Ich komme aus Madagaskar'],
  },
  {
    id: 3, niveau: 'A2',
    consigneDe: 'Die Uhrzeit sagen',
    consigneFr: "Dites l'heure",
    phrase: 'Wie viel Uhr ist es?',
    aide: 'Quelle heure est-il ?',
    reponseAttendues: ['Es ist', 'Uhr', 'halb'],
  },
]

function Sprechen() {
  const { user } = useAuth()
  const { t } = useLang()

  const [etat, setEtat] = useState(ETATS.ACCUEIL)
  const [niveauChoisi, setNiveauChoisi] = useState((user?.niveau || 'A1').toUpperCase())
  const [partner, setPartner] = useState(null)
  const [sessionData, setSessionData] = useState(null)

  const exercicesNiveau = useMemo(() => {
    return EXERCICES_ORAUX.filter(e => e.niveau === niveauChoisi)
  }, [niveauChoisi])

  const handleChercher = () => {
    setPartner(null)
    setSessionData(null)
    setEtat(ETATS.ATTENTE)
  }

  return (
    <div className="shell space-y-6 pb-24 lg:pb-10">
      {etat === ETATS.ACCUEIL && (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-[2.4rem] border border-white/70 bg-gradient-to-br from-brand-text via-brand-blue to-sky-500 p-6 text-white shadow-panel sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(111,166,122,0.18),transparent_26%)]" aria-hidden="true" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-[1.8rem] bg-white/15 text-3xl shadow-soft" aria-hidden="true">🎤</span>
              <div>
                <h1 className="font-display text-4xl font-semibold tracking-tight">Sprechen</h1>
                <p className="mt-2 text-white/75">
                  {t('Deutsch sprechen üben', "Pratique de l'oral en allemand")}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
            <div className="grid gap-4">
              {[
                { emoji: '👥', de: 'Automatisches Matching', fr: 'Matching automatique', descDe: 'Trouvez un partenaire du même niveau.', descFr: 'Trouvez un partenaire du même niveau.' },
                { emoji: '🎤', de: 'Mündliche Praxis', fr: 'Pratique orale', descDe: "Parlez allemand avec quelqu'un.", descFr: "Parlez allemand avec quelqu'un." },
                { emoji: '✅', de: 'Korrektur', fr: 'Correction', descDe: 'Feedback immédiat.', descFr: 'Feedback immédiat.' },
              ].map((e) => (
                <div key={e.de} className={cx(cardClass.base, 'p-5')}>
                  <div>
                    <div className="mb-3 text-3xl" aria-hidden="true">{e.emoji}</div>
                    <p className="font-display text-2xl font-semibold text-brand-text">{t(e.de, e.fr)}</p>
                    <p className="mt-2 text-brand-brown">{t(e.descDe, e.descFr)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={cx(cardClass.base, 'p-5')}>
              <h2 className="section-title text-2xl">{t('Niveau wählen', 'Choisissez le niveau')}</h2>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {NIVEAUX_SPRECHEN.map(n => (
                  <button
                    key={n.code}
                    type="button"
                    className={cx(
                      cardClass.soft,
                      'flex flex-col items-center gap-3 p-4 text-center transition',
                      niveauChoisi === n.code && 'border-brand-blue bg-brand-sky/80 shadow-soft'
                    )}
                    onClick={() => setNiveauChoisi(n.code)}
                  >
                    <span className="text-2xl" aria-hidden="true">{n.emoji}</span>
                    <span className={levelBadgeClass(n.code)}>{n.code}</span>
                    <span className="text-sm font-semibold text-brand-text">{t(n.de, n.fr)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className={cx(cardClass.base, 'p-5')}>
              <h2 className="section-title text-2xl">🎯 {t('Allein üben', 'Pratiquer seul')}</h2>
              <div className="mt-5 grid gap-4">
                {exercicesNiveau.map(ex => (
                  <div key={ex.id} className={cx(cardClass.soft, 'space-y-4 p-5')}>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-blue">{t(ex.consigneDe, ex.consigneFr)}</p>
                    <div className="font-display text-2xl font-semibold tracking-tight text-brand-text">{ex.phrase}</div>
                    <p className="text-brand-brown">{ex.aide}</p>
                    <MicrophoneRecorder
                      langue="de-DE"
                      texteAttendu={ex.reponseAttendues?.[0] || null}
                      onResult={() => {}}
                    />
                  </div>
                ))}

                {exercicesNiveau.length === 0 && (
                  <p className="rounded-[1.5rem] border border-dashed border-brand-border bg-white/70 p-6 text-center text-brand-brown">
                    {t('Übungen bald verfügbar', 'Exercices bientôt disponibles')}
                  </p>
                )}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-brand-border/80 bg-panel-glow p-6 shadow-panel">
              <div className="absolute -right-8 top-0 h-40 w-40 rounded-full bg-brand-blue/15 blur-3xl" aria-hidden="true" />
              <div className="relative space-y-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue text-2xl text-white shadow-soft" aria-hidden="true">👥</span>
                <div>
                  <h3 className="font-display text-3xl font-semibold tracking-tight text-brand-text">
                    {t('Partner finden', 'Trouver un partenaire')}
                  </h3>
                  <p className="mt-2 text-brand-brown">
                    {t('Niveau', 'Niveau')} {niveauChoisi}
                  </p>
                </div>
                <button className={buttonClass.secondary} onClick={handleChercher}>
                  {t('Suchen', 'Chercher')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {etat === ETATS.ATTENTE && (
        <div className="py-6">
          <PartnerMatcher
            niveau={niveauChoisi}
            onMatch={(p) => {
              setPartner(p)
              setEtat(ETATS.SESSION)
            }}
            onCancel={() => setEtat(ETATS.ACCUEIL)}
          />
        </div>
      )}

      {etat === ETATS.SESSION && (
        <SessionSprechen
          partner={partner}
          niveau={niveauChoisi}
          onTerminee={(data) => {
            setSessionData(data)
            setEtat(ETATS.RESULTAT)
          }}
        />
      )}

      {etat === ETATS.RESULTAT && (
        <div className="py-6">
          <ScoreSprechen
            sessionData={sessionData}
            niveau={niveauChoisi}
            onRejouer={() => setEtat(ETATS.ACCUEIL)}
          />
        </div>
      )}

    </div>
  )
}

export default Sprechen

