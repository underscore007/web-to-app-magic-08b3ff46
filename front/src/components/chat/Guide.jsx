import { useParams, useNavigate } from 'react-router-dom'
import { cardClass, cx } from '@utils/ui'

// ── Sections du guide ──────────────────────────────────────
const SECTIONS = [
  {
    id: 'ausbildung',
    emoji: '🎓',
    titre: 'Ausbildung',
    sousTitre: 'Berufsausbildung in Deutschland · Formation professionnelle',
    couleur: 'var(--color-primary)',
    description: 'L\'Ausbildung est une formation professionnelle duale en Allemagne combinant théorie à l\'école et pratique en entreprise. Durée : 2 à 3 ans.',
    etapes: [
      { num: '01', titre: 'Niveau allemand requis', detail: 'B1 minimum, B2 recommandé. Certains employeurs acceptent A2 avec motivation.' },
      { num: '02', titre: 'Trouver une entreprise',  detail: 'Portails : Make it in Germany, Bundesagentur für Arbeit, Indeed.de, LinkedIn.' },
      { num: '03', titre: 'Préparer le dossier',     detail: 'CV (Lebenslauf), lettre de motivation (Bewerbungsschreiben), diplômes traduits, extrait de casier judiciaire.' },
      { num: '04', titre: 'Visa Ausbildung',          detail: 'Visa national D, catégorie formation. Rendez-vous à l\'ambassade d\'Allemagne à Antananarivo.' },
      { num: '05', titre: 'Arriver en Allemagne',     detail: 'Inscription à la mairie (Anmeldung), numéro de sécurité sociale, compte bancaire.' },
    ],
    docs: ['Passeport valide 6 mois', 'CV en allemand', 'Lettre de motivation en allemand', 'Diplômes + traduction assermentée', 'Contrat Ausbildung signé', 'Extrait casier judiciaire', 'Photos d\'identité', 'Formulaire de demande de visa'],
    salaire: '600€ - 900€/mois (brut selon secteur)',
    duree: '2 à 3 ans',
  },
  {
    id: 'aupair',
    emoji: '👶',
    titre: 'Au Pair',
    sousTitre: 'Familienaufenthalt · Séjour en famille',
    couleur: 'var(--color-b1)',
    description: 'Le programme Au Pair permet de vivre dans une famille allemande, garder les enfants et apprendre l\'allemand. Idéal pour les 18-26 ans.',
    etapes: [
      { num: '01', titre: 'Niveau allemand',    detail: 'A1 minimum. Certaines familles acceptent débutants complets.' },
      { num: '02', titre: 'Trouver une famille', detail: 'Agences : AuPairWorld, AuPairCare, Cultural Care. Profil complet avec photo.' },
      { num: '03', titre: 'Visa Au Pair',        detail: 'Visa Au Pair spécifique. Contrat Au Pair obligatoire signé des deux parties.' },
      { num: '04', titre: 'Vie en famille',      detail: 'Chambre + repas + argent de poche (260€/mois minimum). 30h de travail/semaine max.' },
      { num: '05', titre: 'Cours d\'allemand',   detail: 'Obligatoire : au moins 1 cours d\'allemand par semaine. Frais pris en charge partiellement.' },
    ],
    docs: ['Passeport valide', 'Contrat Au Pair signé', 'Lettre de motivation', 'Certificat médical', 'Casier judiciaire', 'Diplôme premiers secours', 'Photos d\'identité'],
    salaire: '260€ - 350€/mois (argent de poche)',
    duree: '6 à 12 mois (extensible à 24 mois)',
  },
  {
    id: 'fsj',
    emoji: '🤝',
    titre: 'FSJ — Freiwilliges Soziales Jahr',
    sousTitre: 'Freiwilliger sozialer Dienst · Service social volontaire',
    couleur: 'var(--color-b2)',
    description: 'Le FSJ est une année de service volontaire dans le secteur social, sanitaire, culturel ou écologique en Allemagne.',
    etapes: [
      { num: '01', titre: 'Niveau allemand',         detail: 'B1 minimum requis. La communication quotidienne doit être possible.' },
      { num: '02', titre: 'Trouver un organisme',    detail: 'Caritas, Diakonie, DRK (Croix-Rouge), Malteser, AWO, organisations écologiques.' },
      { num: '03', titre: 'Dossier candidature',     detail: 'CV, lettre de motivation, diplômes, certificats de bénévolat si disponibles.' },
      { num: '04', titre: 'Visa FSJ',                detail: 'Visa national D pour formation/service. Contrat FSJ obligatoire.' },
      { num: '05', titre: 'Séminaires obligatoires', detail: '25 jours de séminaires pédagogiques inclus dans l\'année de service.' },
    ],
    docs: ['Passeport valide', 'Contrat FSJ signé', 'CV + lettre de motivation', 'Diplômes traduits', 'Casier judiciaire', 'Certificat médical'],
    salaire: '150€ - 450€/mois (Taschengeld)',
    duree: '6 à 18 mois',
  },
  {
    id: 'visa',
    emoji: '✈️',
    titre: 'Visa & Démarches',
    sousTitre: 'Verfahren und Unterlagen · Procédures administratives',
    couleur: 'var(--color-secondary)',
    description: 'Guide complet des démarches administratives pour obtenir votre visa allemand depuis Madagascar.',
    etapes: [
      { num: '01', titre: 'Ambassade d\'Allemagne',   detail: 'Ambassade à Antananarivo. Prise de RDV obligatoire en ligne sur le site officiel.' },
      { num: '02', titre: 'Dossier complet',          detail: 'Chaque type de visa a sa liste de documents. Tout doit être en ordre le jour du RDV.' },
      { num: '03', titre: 'Entretien consulaire',     detail: 'Questions sur votre projet, niveau d\'allemand, ressources financières, hébergement.' },
      { num: '04', titre: 'Délai traitement',         detail: '4 à 12 semaines selon la période. Déposez votre dossier 3 mois avant le départ.' },
      { num: '05', titre: 'Anmeldung à l\'arrivée',   detail: 'Dans les 14 jours à la mairie (Einwohnermeldeamt). Obligatoire pour tout résident.' },
    ],
    docs: ['Passeport valide + copies', 'Formulaire de demande de visa', 'Photo biométrique', 'Assurance maladie internationale', 'Preuve hébergement', 'Ressources financières (3 derniers relevés)', 'Contrat de travail/formation/Au Pair'],
    salaire: null,
    duree: 'RDV 4-8 semaines à l\'avance',
  },
]

// ── Composant étape ────────────────────────────────────────
function Etape({ etape, couleur }) {
  return (
    <div className="flex gap-4 rounded-[1.5rem] border border-brand-border/70 bg-white/80 p-4 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-display text-sm font-semibold text-white" style={{ background: couleur }}>
        {etape.num}
      </div>
      <div>
        <p className="font-display text-xl font-semibold text-brand-text">{etape.titre}</p>
        <p className="mt-2 text-brand-brown">{etape.detail}</p>
      </div>
    </div>
  )
}

// ── Page Guide ─────────────────────────────────────────────
function Guide() {
  const { section: sectionParam } = useParams()
  const navigate   = useNavigate()

  const sectionActive = sectionParam || 'ausbildung'
  const section       = SECTIONS.find(s => s.id === sectionActive) || SECTIONS[0]

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[2.4rem] border border-white/70 bg-gradient-to-br from-brand-blue via-sky-500 to-brand-text p-6 text-white shadow-panel sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(111,166,122,0.18),transparent_24%)]" aria-hidden="true" />
        <div className="relative space-y-3">
          <h1 className="font-display text-4xl font-semibold tracking-tight">🗺️ Guide Allemagne</h1>
          <p className="text-white/80">
          Wege nach Deutschland · Toutes les voies pour partir en Allemagne
        </p>
      </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            className={cx(
              cardClass.soft,
              'flex items-center gap-3 p-4 text-left transition',
              sectionActive === s.id && 'border-brand-blue bg-brand-sky/80 shadow-soft'
            )}
            onClick={() => navigate(`/guide/${s.id}`)}
          >
            <span>{s.emoji}</span>
            <span>{s.titre}</span>
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-[2rem] p-6 text-white shadow-panel" style={{ background: `linear-gradient(135deg, ${section.couleur}, #4B9CD3)` }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_28%)]" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl">{section.emoji}</span>
              <div>
                <h2 className="font-display text-4xl font-semibold tracking-tight">{section.titre}</h2>
                <p className="mt-2 text-white/80">{section.sousTitre}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {section.salaire && (
                <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold">
                  💰 {section.salaire}
                </div>
              )}
              {section.duree && (
                <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold">
                  ⏳ {section.duree}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={cx(cardClass.base, 'p-6')}>
          <p className="text-lg leading-relaxed text-brand-brown">{section.description}</p>
        </div>

        <div className="space-y-4">
          <h3 className="section-title text-2xl">📋 Schritte · Étapes à suivre</h3>
          <div className="grid gap-4">
            {section.etapes.map(e => (
              <Etape key={e.num} etape={e} couleur={section.couleur} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="section-title text-2xl">📄 Unterlagen · Documents requis</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {section.docs.map((doc, i) => (
              <div key={i} className={cx(cardClass.soft, 'flex items-start gap-3 p-4')}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">✓</span>
                <span className="text-brand-brown">{doc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-brand-border/80 bg-gradient-to-br from-brand-sky to-white p-6 shadow-soft">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue text-xl text-white shadow-soft">💡</span>
            <div>
              <p className="section-kicker">EAM Tipp · Conseil EAM</p>
              <p className="mt-3 text-brand-brown">
                Maîtrisez l&apos;allemand avant de commencer vos démarches.
                Le niveau {section.id === 'aupair' ? 'A2' : 'B1'} est indispensable.
                Utilisez EAM pour l&apos;atteindre rapidement.
              </p>
              <p className="mt-3 text-sm text-brand-brown/80">
                Beherrschen Sie Deutsch, bevor Sie Ihre démarches lancent.
                Le niveau {section.id === 'aupair' ? 'A2' : 'B1'} est indispensable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Guide
