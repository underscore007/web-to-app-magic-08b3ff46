import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adaptiveCoursAPI, coursAPI, withOfflineFallback } from '@services/api'
import { useProgression } from '@hooks/useProgression'
import { useAuth } from '@context/AuthContext'
import { useGamification } from '@context/GamificationContext'
import { useLang } from '@context/LangContext'
import AudioPlayer from '@components/cours/AudioPlayer'
import ExerciceQCM from '@components/cours/ExerciceQCM'
import ExerciceFillBlank from '@components/cours/ExerciceFillBlank'
import ExerciceTraduction from '@components/cours/ExerciceTraduction'
import ExerciceMatchPairs from '@components/cours/ExerciceMatchPairs'
import ExerciceBuildPhrase from '@components/cours/ExerciceBuildPhrase'
import ExerciceSprechen from '@components/cours/ExerciceSprechen'
import ExerciceHoren from '@components/cours/ExerciceHoren'
import Icon from '@components/ui/Icon'
import { buttonClass, cardClass, cx, levelBadgeClass, levelTheme } from '@utils/ui'

const ETAPES = ['intro', 'phrases', 'exercices', 'resultat']

const STAGE_LABELS = {
  intro: { de: 'Einfuhrung', fr: 'Intro' },
  phrases: { de: 'Satze', fr: 'Phrases' },
  exercices: { de: 'Ubungen', fr: 'Exercices' },
  resultat: { de: 'Ergebnis', fr: 'Resultat' },
}

const FALLBACK_TITLES = [
  'Begruessungen · Les salutations',
  'Sich vorstellen · Se presenter',
  'Die Familie · La famille',
  'Zahlen und Tage · Chiffres et jours',
  'Essen · La nourriture',
  'Farben und Formen · Couleurs et formes',
  'Berufe · Metiers',
  'Zeit · Le temps',
  'Das Haus · La maison',
  'Transport · Les transports',
]

const MOCK_LECON = {
  id: 'a1-mock',
  numero: 1,
  titre: 'Begruessungen - Les salutations',
  niveau: 'A1',
  description: 'Lernen Sie Basisformeln fuer den Alltag.',
  duree: 15,
  phrases: [
    { id: 1, alemana: 'Guten Morgen!', traductionDe: 'Guten Morgen!', frantsay: 'Bonjour (matin)', audio: 'Guten Morgen!' },
    { id: 2, alemana: 'Wie geht es dir?', traductionDe: 'Wie geht es dir?', frantsay: 'Comment ca va ?', audio: 'Wie geht es dir?' },
    { id: 3, alemana: 'Danke schoen.', traductionDe: 'Danke schoen.', frantsay: 'Merci beaucoup.', audio: 'Danke schoen.' },
  ],
  exercices: [
    {
      id: 'mock-ex-1',
      type: 'qcm',
      questionDe: 'Welche Uebersetzung passt zu "Danke"?',
      questionFr: 'Quelle traduction correspond a "Danke" ?',
      options: [
        { de: 'Merci', fr: 'Merci' },
        { de: 'Bonjour', fr: 'Bonjour' },
        { de: 'Au revoir', fr: 'Au revoir' },
        { de: 'Pardon', fr: 'Pardon' },
      ],
      reponse: 0,
    },
    {
      id: 'mock-ex-2',
      type: 'fill',
      avant: 'Guten',
      apres: '(soir)',
      reponse: 'Abend',
      indice: 'Ab...',
    },
    {
      id: 'mock-ex-3',
      type: 'traduction',
      sourceFr: 'Je m appelle Ravo.',
      sourceDe: 'Ich heisse Ravo.',
      reponse: 'Ich heisse Ravo.',
      accepte: ['Ich heisse Ravo.', 'ich heisse ravo'],
    },
  ],
}

function buildFallbackLessons(level = 'A1') {
  return Array.from({ length: 30 }, (_, index) => ({
    id: index + 1,
    numero: index + 1,
    niveau: level,
    titre: FALLBACK_TITLES[index % FALLBACK_TITLES.length] + (index >= 10 ? ` (${Math.floor(index / 10) + 1})` : ''),
    duree: 15 + (index % 5) * 5,
    phrases: 10,
    exercices: 50,
    complete: false,
    score: null,
  }))
}

function resolveLessonText(value, lang, t) {
  if (!value) return ''
  if (typeof value === 'object') {
    const de = value.de || value.fr || ''
    const fr = value.fr || value.de || ''
    return lang === 'mix' ? `${de} · ${fr}` : t(de, fr)
  }
  return value
}

function getLessonKey(item) {
  return String(item?.id ?? item?.numero ?? '')
}

function matchesLesson(item, routeLessonId, currentLesson) {
  const itemKey = getLessonKey(item)
  const routeKey = String(routeLessonId ?? '')
  const currentKey = String(currentLesson?.id ?? '')

  if (itemKey && routeKey && itemKey === routeKey) return true
  if (itemKey && currentKey && itemKey === currentKey) return true

  const itemNumero = item?.numero == null ? '' : String(item.numero)
  const currentNumero = currentLesson?.numero == null ? '' : String(currentLesson.numero)

  if (itemNumero && routeKey && itemNumero === routeKey) return true
  if (itemNumero && currentNumero && itemNumero === currentNumero) return true

  return false
}

function expectedAnswerFromExercise(exercice) {
  if (!exercice) return null
  switch (exercice.type) {
    case 'qcm':
      return String(exercice.reponse ?? '')
    case 'horen':
      return String(exercice.correct ?? '')
    case 'fill':
      return exercice.reponse || null
    case 'traduction':
      return exercice.reponse || null
    case 'match':
      return JSON.stringify(exercice.pairs || [])
    case 'build':
      return exercice.answer || null
    case 'sprechen':
      return exercice.texteAttendu || null
    default:
      return null
  }
}

function SidebarLessonItem({ lesson, niveau, isActive, isLocked, t, lang, onSelect }) {
  const title = resolveLessonText(lesson.titre, lang, t)
  const canOpen = !isLocked || isActive
  const sharedClassName = cx(
    'group flex w-full items-center gap-3 rounded-[1.4rem] border px-3.5 py-3 text-left transition duration-300',
    isActive
      ? 'border-brand-blue/30 bg-white text-brand-text shadow-soft'
      : isLocked
        ? 'border-transparent bg-slate-100/90 text-slate-400'
        : 'border-transparent bg-white/72 text-brand-text hover:border-white/80 hover:bg-white hover:shadow-soft'
  )
  const statusClassName = cx(
    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]',
    isActive
      ? 'bg-brand-blue/10 text-brand-blueDeep'
      : lesson.complete
        ? 'bg-emerald-50 text-emerald-700'
        : isLocked
          ? 'bg-slate-200 text-slate-500'
          : 'bg-brand-sky/80 text-brand-brown'
  )

  const statusLabel = isActive
    ? t('Aktiv', 'Active')
    : lesson.complete
      ? t('Fertig', 'Terminee')
      : isLocked
        ? t('Gesperrt', 'Verrouillee')
        : t('Bereit', 'Disponible')

  const content = (
    <>
      <div
        className={cx(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border text-sm font-semibold transition',
          isActive
            ? 'border-brand-blue/20 bg-brand-blue text-white'
            : lesson.complete
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : isLocked
                ? 'border-slate-200 bg-slate-200/80 text-slate-500'
                : 'border-white/80 bg-brand-sky/80 text-brand-blueDeep'
        )}
        aria-hidden="true"
      >
        {lesson.complete ? (
          <Icon name="checkCircle" size={18} className="icon" />
        ) : isLocked ? (
          <Icon name="lock" size={16} className="icon" />
        ) : (
          <span className="font-display text-base font-semibold">{lesson.numero}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={statusClassName}>{statusLabel}</span>
          <span className="text-xs text-brand-brown/75">{lesson.duree || 0} min</span>
          {lesson.xpEarned != null ? (
            <span className="text-xs text-brand-brown/75">
              XP {lesson.xpEarned}/{lesson.xpRequired || 100}
            </span>
          ) : null}
          {lesson.masteryScore ? (
            <span className="text-xs text-brand-brown/75">{lesson.masteryScore}%</span>
          ) : null}
          {lesson.complete && lesson.score ? (
            <span className="text-xs font-semibold text-emerald-700">{lesson.score}/100</span>
          ) : null}
        </div>
        {isLocked && !isActive && lesson.lockedReason ? (
          <p className="mt-2 text-xs text-slate-500">{lesson.lockedReason}</p>
        ) : null}
      </div>

      <span
        className={cx(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition',
          isLocked && !isActive
            ? 'bg-slate-200/90 text-slate-500'
            : isActive
              ? 'bg-brand-sky/90 text-brand-blueDeep'
              : 'bg-white/85 text-brand-brown group-hover:bg-brand-sky/90 group-hover:text-brand-blueDeep'
        )}
        aria-hidden="true"
      >
        <Icon name={isLocked && !isActive ? 'lock' : 'arrowRight'} size={16} className="icon" />
      </span>
    </>
  )

  if (!canOpen) {
    return (
      <div className={sharedClassName} aria-disabled="true">
        {content}
      </div>
    )
  }

  return (
    <Link to={`/cours/${niveau}/lecon/${lesson.id}`} className={sharedClassName} onClick={onSelect}>
      {content}
    </Link>
  )
}

function LessonJumpCard({ lesson, niveau, label, description, disabled, t, lang }) {
  const className = cx(
    cardClass.soft,
    'flex items-center justify-between gap-3 p-4 transition duration-300',
    disabled
      ? 'cursor-not-allowed bg-slate-100/90 text-slate-400'
      : 'hover:-translate-y-0.5 hover:border-brand-blue/30 hover:bg-white/90'
  )

  const content = (
    <>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-brown/70">{label}</p>
        <p className="mt-2 truncate font-semibold">{lesson ? resolveLessonText(lesson.titre, lang, t) : description}</p>
      </div>
      <span
        className={cx(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          disabled ? 'bg-slate-200/80 text-slate-500' : 'bg-brand-sky/85 text-brand-blueDeep'
        )}
        aria-hidden="true"
      >
        <Icon name={disabled ? 'lock' : 'arrowRight'} size={18} className="icon" />
      </span>
    </>
  )

  if (!lesson || disabled) {
    return <div className={className}>{content}</div>
  }

  return (
    <Link to={`/cours/${niveau}/lecon/${lesson.id}`} className={className}>
      {content}
    </Link>
  )
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function mergeLessonPayload(baseLesson, sessionLesson) {
  if (!baseLesson) return sessionLesson
  if (!sessionLesson) return baseLesson

  return {
    ...baseLesson,
    ...sessionLesson,
    id: sessionLesson.id || baseLesson.id,
    numero: sessionLesson.numero ?? baseLesson.numero,
    titre: sessionLesson.titre || baseLesson.titre,
    description: sessionLesson.description || baseLesson.description,
    phrases: Array.isArray(sessionLesson.phrases) && sessionLesson.phrases.length > 0
      ? sessionLesson.phrases
      : baseLesson.phrases,
    exercices: Array.isArray(sessionLesson.exercices) ? sessionLesson.exercices : baseLesson.exercices,
    phrasesCount: sessionLesson.phrasesCount ?? baseLesson.phrasesCount,
    exercicesCount: sessionLesson.exercicesCount ?? baseLesson.exercicesCount,
    adaptiveMeta: sessionLesson.adaptiveMeta || null,
  }
}

function Lecon() {
  const { niveau, leconId } = useParams()
  const { user } = useAuth()
  const { marquerComplete, estComplete, getScore } = useProgression()
  const { refresh: refreshGamification } = useGamification()
  const { t, lang } = useLang()

  const isAdaptiveMode = String(leconId || '').toLowerCase() === 'adaptive'
  const theme = levelTheme(niveau)

  const [lecon, setLecon] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lessonCatalog, setLessonCatalog] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [reloadTick, setReloadTick] = useState(0)

  const [etape, setEtape] = useState('intro')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [exIndex, setExIndex] = useState(0)
  const [scores, setScores] = useState([])
  const [exerciseStartedAt, setExerciseStartedAt] = useState(Date.now())
  const [mobileLessonsOpen, setMobileLessonsOpen] = useState(false)

  const [adaptiveSessionId, setAdaptiveSessionId] = useState(null)
  const [adaptiveScore, setAdaptiveScore] = useState(null)
  const [adaptiveMetrics, setAdaptiveMetrics] = useState({
    userPowerScore: null,
    complexityIndex200: null,
  })
  const [lessonState, setLessonState] = useState(null)
  const [unlockStatus, setUnlockStatus] = useState(null)
  const [activeErrors, setActiveErrors] = useState([])
  const [lastXpGain, setLastXpGain] = useState(0)
  const [nextRecommendation, setNextRecommendation] = useState(null)
  const [lessonError, setLessonError] = useState(null)

  useEffect(() => {
    const loadLesson = async () => {
      setLoading(true)
      setAdaptiveSessionId(null)
      setAdaptiveScore(null)
      setAdaptiveMetrics({ userPowerScore: null, complexityIndex200: null })
      setLessonState(null)
      setUnlockStatus(null)
      setActiveErrors([])
      setLastXpGain(0)
      setNextRecommendation(null)
      setLessonError(null)
      setEtape('intro')
      setPhraseIndex(0)
      setExIndex(0)
      setScores([])

      try {
        if (isAdaptiveMode) {
          const response = await adaptiveCoursAPI.startSession({
            niveau,
            mode: 'free',
            objectif: user?.objectif || undefined,
            dureeMinutes: 45,
          })
          const lesson = response?.data?.lesson || MOCK_LECON
          setLecon(lesson)
          setAdaptiveSessionId(response?.data?.sessionId || null)
          setLessonState(response?.data?.lessonState || null)
          setUnlockStatus(response?.data?.unlockStatus || null)
          setActiveErrors(Array.isArray(response?.data?.activeErrors) ? response.data.activeErrors : [])
          setAdaptiveMetrics({
            userPowerScore: response?.data?.userPowerScore ?? null,
            complexityIndex200: response?.data?.complexityIndex200 ?? null,
          })
        } else {
          const data = await withOfflineFallback(
            () => coursAPI.getLecon(leconId),
            `eam_lecon_${leconId}`,
            MOCK_LECON
          )
          const baseLesson = data?.lecon || data || MOCK_LECON
          const response = await adaptiveCoursAPI.startSession({
            niveau,
            lessonId: leconId,
            mode: 'lesson',
            objectif: user?.objectif || undefined,
            dureeMinutes: baseLesson?.duree || 45,
          })
          setLecon(mergeLessonPayload(baseLesson, response?.data?.lesson || null))
          setAdaptiveSessionId(response?.data?.sessionId || null)
          setLessonState(response?.data?.lessonState || null)
          setUnlockStatus(response?.data?.unlockStatus || null)
          setActiveErrors(Array.isArray(response?.data?.activeErrors) ? response.data.activeErrors : [])
          setAdaptiveMetrics({
            userPowerScore: response?.data?.userPowerScore ?? null,
            complexityIndex200: response?.data?.complexityIndex200 ?? null,
          })
        }
      } catch (error) {
        setLessonError(error?.response?.data?.error || error?.message || 'Lecon indisponible')
        if (!isAdaptiveMode) {
          try {
            const data = await withOfflineFallback(
              () => coursAPI.getLecon(leconId),
              `eam_lecon_${leconId}`,
              MOCK_LECON
            )
            setLecon(data?.lecon || data || MOCK_LECON)
          } catch {
            setLecon(MOCK_LECON)
          }
        } else {
          setLecon(MOCK_LECON)
        }
      } finally {
        setLoading(false)
      }
    }

    loadLesson()
  }, [isAdaptiveMode, leconId, niveau, reloadTick, user?.objectif])

  useEffect(() => {
    const loadCatalog = async () => {
      setCatalogLoading(true)
      try {
        const raw = await withOfflineFallback(
          () => coursAPI.getLecons(niveau),
          `eam_lecons_${niveau}`,
          buildFallbackLessons(niveau)
        )
        const list = Array.isArray(raw) ? raw : raw?.lecons
        setLessonCatalog(Array.isArray(list) ? list : buildFallbackLessons(niveau))
      } catch {
        setLessonCatalog(buildFallbackLessons(niveau))
      } finally {
        setCatalogLoading(false)
      }
    }

    loadCatalog()
  }, [niveau, reloadTick])

  useEffect(() => {
    setExerciseStartedAt(Date.now())
  }, [etape, exIndex, lecon?.id])

  useEffect(() => {
    setMobileLessonsOpen(false)
  }, [niveau, leconId])

  useEffect(() => {
    if (!mobileLessonsOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMobileLessonsOpen(false)
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileLessonsOpen])

  const safePhrases = Array.isArray(lecon?.phrases) ? lecon.phrases : []
  const safeExercices = Array.isArray(lecon?.exercices) ? lecon.exercices : []
  const activeExercise = safeExercices[exIndex] || null
  const activeExerciseKey = activeExercise ? `${activeExercise.type}-${activeExercise.id ?? exIndex}` : `exercise-${exIndex}`
  const scoreTotal = useMemo(() => {
    if (adaptiveScore != null) return adaptiveScore
    if (scores.length === 0) return 0
    return Math.round((scores.reduce((sum, value) => sum + value, 0) / scores.length) * 100)
  }, [adaptiveScore, scores])

  const sidebarLessons = useMemo(() => {
    const source = Array.isArray(lessonCatalog) ? [...lessonCatalog] : []

    if (!isAdaptiveMode && lecon && !source.some((item) => matchesLesson(item, leconId, lecon))) {
      source.unshift({
        id: lecon.id ?? leconId,
        numero: lecon.numero ?? 1,
        niveau,
        titre: lecon.titre,
        duree: lecon.duree ?? 0,
      })
    }

    const normalized = source.map((item, index) => {
      const id = item?.id ?? item?.numero ?? index + 1
      const complete = Boolean(item?.complete || estComplete(id))
      const score = item?.score ?? getScore(id)

      return {
        ...item,
        id,
        numero: item?.numero ?? index + 1,
        duree: item?.duree ?? 0,
        complete,
        score,
        xpEarned: Number(item?.xpEarned) || 0,
        xpRequired: Number(item?.xpRequired) || 100,
        masteryScore: Number(item?.masteryScore) || 0,
        errorRate: Number(item?.errorRate) || 0,
        revisionRequired: Boolean(item?.revisionRequired),
        unlocked: typeof item?.unlocked === 'boolean' ? item.unlocked : undefined,
        lockedReason: item?.lockedReason || null,
        active: !isAdaptiveMode && matchesLesson(item, leconId, lecon),
      }
    })

    if (normalized.some((item) => typeof item.unlocked === 'boolean')) {
      return normalized.map((item) => ({
        ...item,
        unlocked: item.active ? true : Boolean(item.unlocked),
        locked: item.active ? false : item.unlocked === false,
      }))
    }

    let contiguousProgressUnlocked = true

    return normalized.map((item) => {
      const unlocked = contiguousProgressUnlocked || item.active
      if (!item.complete) contiguousProgressUnlocked = false

      return {
        ...item,
        unlocked,
        locked: !unlocked,
      }
    })
  }, [estComplete, getScore, isAdaptiveMode, lecon, leconId, lessonCatalog, niveau])

  const currentLessonIndex = isAdaptiveMode ? -1 : sidebarLessons.findIndex((item) => item.active)
  const previousLesson = currentLessonIndex > 0 ? sidebarLessons[currentLessonIndex - 1] : null
  const nextLesson = currentLessonIndex >= 0 ? sidebarLessons[currentLessonIndex + 1] || null : null
  const completedLessonsCount = sidebarLessons.filter((item) => item.complete).length
  const levelProgressPct = sidebarLessons.length > 0 ? Math.round((completedLessonsCount / sidebarLessons.length) * 100) : 0
  const currentStageIndex = Math.max(ETAPES.indexOf(etape), 0)
  const lessonPositionLabel = !isAdaptiveMode && currentLessonIndex >= 0
    ? `${currentLessonIndex + 1} / ${sidebarLessons.length}`
    : t('Adaptive Lektion', 'Lecon adaptative')

  const phraseNext = () => {
    if (phraseIndex < safePhrases.length - 1) {
      setPhraseIndex((prev) => prev + 1)
      return
    }
    setEtape('exercices')
    setExIndex(0)
  }

  const phrasePrev = () => {
    if (phraseIndex > 0) setPhraseIndex((prev) => prev - 1)
  }

  const gotoNextExerciseOrFinish = async (nextLessonState, newScores) => {
    const exercises = Array.isArray(nextLessonState?.exercices) ? nextLessonState.exercices : []
    if (exIndex < exercises.length - 1) {
      setTimeout(() => setExIndex((prev) => prev + 1), 350)
      return
    }

    if (adaptiveSessionId) {
      try {
        const finishResponse = await adaptiveCoursAPI.finishSession(adaptiveSessionId)
        const payload = finishResponse?.data || {}
        const finalScore = payload?.finalScore100
        if (typeof finalScore === 'number') setAdaptiveScore(finalScore)
        setLessonState(payload.lessonState || null)
        setUnlockStatus(payload.unlockStatus || null)
        setNextRecommendation(payload.nextRecommendation || null)
        setLessonCatalog((current) => current.map((item) => {
          if (String(item.id) === String(nextLessonState?.id)) {
            return {
              ...item,
              complete: true,
              score: payload?.lessonState?.score ?? finalScore ?? item.score,
              xpEarned: payload?.lessonState?.xpEarned ?? item.xpEarned,
              xpRequired: payload?.lessonState?.xpRequired ?? item.xpRequired,
              masteryScore: payload?.lessonState?.masteryScore ?? item.masteryScore,
              errorRate: payload?.lessonState?.errorRate ?? item.errorRate,
              revisionRequired: payload?.lessonState?.revisionRequired ?? item.revisionRequired,
            }
          }
          if (payload?.unlockStatus?.nextLessonId && String(item.id) === String(payload.unlockStatus.nextLessonId)) {
            return {
              ...item,
              unlocked: Boolean(payload.unlockStatus.nextLessonUnlocked),
              lockedReason: payload.unlockStatus.nextLockedReason || null,
            }
          }
          return item
        }))
        refreshGamification().catch(() => {})
      } catch {
        const fallbackScore = Math.round((newScores.reduce((sum, value) => sum + value, 0) / Math.max(1, newScores.length)) * 100)
        if (nextLessonState?.id) await marquerComplete(nextLessonState.id, fallbackScore)
      }
    } else {
      const scoreFinal = Math.round((newScores.reduce((sum, value) => sum + value, 0) / Math.max(1, newScores.length)) * 100)
      await marquerComplete(leconId, scoreFinal)
    }

    setTimeout(() => setEtape('resultat'), 300)
  }

  const handleExerciceValide = async (correct, meta = {}) => {
    const activeExercise = safeExercices[exIndex]
    const newScores = [...scores, correct ? 1 : 0]
    setScores(newScores)

    let nextLessonState = lecon

    if (adaptiveSessionId && activeExercise) {
      try {
        const responseTimeMs = clamp(Date.now() - exerciseStartedAt, 0, 600000)
        const attemptResponse = await adaptiveCoursAPI.submitAttempt(adaptiveSessionId, {
          exerciceId: activeExercise.id,
          correct,
          userAnswer: meta.userAnswer ?? null,
          expectedAnswer: meta.expectedAnswer ?? expectedAnswerFromExercise(activeExercise),
          responseTimeMs,
          hintsUsed: Number(meta.hintsUsed) || 0,
          confidence: meta.confidence == null ? null : Number(meta.confidence),
        })

        const payload = attemptResponse?.data || {}
        setAdaptiveMetrics({
          userPowerScore: payload.userPowerScore ?? null,
          complexityIndex200: payload.complexityIndex200 ?? null,
        })
        setLessonState(payload.lessonState || null)
        setUnlockStatus(payload.unlockStatus || null)
        setActiveErrors(Array.isArray(payload.activeErrors) ? payload.activeErrors : [])
        setLastXpGain(Number(payload.xpGained) || 0)

        let updatedExercises = [...safeExercices]

        if (Array.isArray(payload?.remediation?.exercises) && payload.remediation.exercises.length > 0) {
          const knownIds = new Set(updatedExercises.map((item) => String(item.id)))
          const injected = payload.remediation.exercises.filter((item) => {
            const id = String(item?.id || '')
            if (!id || knownIds.has(id)) return false
            knownIds.add(id)
            return true
          })

          if (injected.length > 0) {
            updatedExercises = [
              ...updatedExercises.slice(0, exIndex + 1),
              ...injected,
              ...updatedExercises.slice(exIndex + 1),
            ]
          }
        }

        if (payload.nextExercice) {
          const exists = updatedExercises.some((item) => String(item.id) === String(payload.nextExercice.id))
          if (!exists) updatedExercises = [...updatedExercises, payload.nextExercice]
        }

        if (updatedExercises.length !== safeExercices.length) {
          nextLessonState = {
            ...lecon,
            exercices: updatedExercises,
            exercicesCount: updatedExercises.length,
          }
          setLecon(nextLessonState)
        }
      } catch {
        // Silent fallback: continue local flow
      }
    }

    await gotoNextExerciseOrFinish(nextLessonState, newScores)
  }

  const handleRestart = () => {
    if (isAdaptiveMode || adaptiveSessionId) {
      setReloadTick((prev) => prev + 1)
      return
    }

    setEtape('intro')
    setPhraseIndex(0)
    setExIndex(0)
    setScores([])
    setAdaptiveScore(null)
  }

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[25%_75%]">
        <div className="hidden lg:block">
          <div className="h-[calc(100vh-12rem)] animate-pulse rounded-[2rem] bg-brand-border/60" />
        </div>
        <div className="space-y-4">
          <div className="h-28 animate-pulse rounded-[2rem] bg-brand-border/70" />
          <div className="h-[28rem] animate-pulse rounded-[2rem] bg-brand-border/60" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        className={cx(
          'pointer-events-none fixed inset-0 z-[55] bg-slate-950/35 opacity-0 transition lg:hidden',
          mobileLessonsOpen && 'pointer-events-auto opacity-100'
        )}
        onClick={() => setMobileLessonsOpen(false)}
        aria-hidden="true"
      />

      <div
        className={cx(
          'fixed inset-x-4 bottom-4 top-24 z-[60] origin-top rounded-[2rem] border border-white/85 bg-white/95 p-4 shadow-[0_30px_70px_-36px_rgba(53,94,75,0.42)] backdrop-blur-2xl transition duration-300 lg:hidden',
          mobileLessonsOpen ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        )}
        aria-hidden={!mobileLessonsOpen}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-blue">
                {t('Lektionen', 'Lecons')}
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-brand-text">
                {t('Navigation im Kurs', 'Navigation du cours')}
              </h2>
            </div>
            <button className={buttonClass.ghost} type="button" onClick={() => setMobileLessonsOpen(false)}>
              <Icon name="x" size={18} className="icon" />
            </button>
          </div>

          <div className={cx(cardClass.soft, 'mb-4 p-4', theme.tint)}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-brand-text">
                  {completedLessonsCount}/{sidebarLessons.length} {t('Lektionen fertig', 'lecons terminees')}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-brand-brown">{levelProgressPct}%</p>
              </div>
              <span className={levelBadgeClass(niveau)}>{niveau}</span>
            </div>
            <div className="mt-3 progress-track">
              <div className="progress-fill" style={{ width: `${levelProgressPct}%` }} />
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            {catalogLoading
              ? Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="h-20 animate-pulse rounded-[1.4rem] bg-brand-border/60" />
                ))
              : sidebarLessons.map((lesson) => (
                  <SidebarLessonItem
                    key={getLessonKey(lesson)}
                    lesson={lesson}
                    niveau={niveau}
                    isActive={lesson.active}
                    isLocked={lesson.locked}
                    t={t}
                    lang={lang}
                    onSelect={() => setMobileLessonsOpen(false)}
                  />
                ))}

            <Link
              to={`/cours/${niveau}/lecon/adaptive`}
              onClick={() => setMobileLessonsOpen(false)}
              className={cx(
                cardClass.soft,
                'flex items-center gap-3 p-4 transition duration-300 hover:border-brand-blue/30 hover:bg-white/90',
                isAdaptiveMode && 'border-brand-blue/30 bg-brand-sky/70'
              )}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-brand-blue text-white">
                <Icon name="bolt" size={18} className="icon" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-brand-text">{t('Adaptive Lektion', 'Lecon adaptative')}</p>
                <p className="mt-1 text-xs text-brand-brown">{t('Dynamische Uebungen', 'Exercices dynamiques')}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:max-h-[calc(100vh-10rem)] lg:grid-cols-[25%_75%]">
        <aside className="hidden lg:block lg:min-h-0">
          <div className={cx(cardClass.base, 'sticky top-0 flex max-h-[calc(100vh-10rem)] min-h-0 flex-col overflow-hidden')}>
            <div className={cx('border-b border-brand-border/70 p-5', theme.tint)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-blue">
                    {t('Niveau', 'Niveau')}
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-brand-text">{niveau}</h2>
                </div>
                <span className={levelBadgeClass(niveau)}>{niveau}</span>
              </div>

              <p className="mt-4 text-sm text-brand-brown">
                {completedLessonsCount}/{sidebarLessons.length} {t('Lektionen fertig', 'lecons terminees')}
              </p>
              <div className="mt-3 progress-track">
                <div className="progress-fill" style={{ width: `${levelProgressPct}%` }} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/cours/${niveau}`} className={buttonClass.ghost}>
                  <Icon name="arrowLeft" size={18} className="icon" /> {t('Zur Liste', 'Retour aux lecons')}
                </Link>
                <Link
                  to={`/cours/${niveau}/lecon/adaptive`}
                  className={cx(buttonClass.outline, isAdaptiveMode && 'border-brand-blue bg-brand-sky/80')}
                >
                  <Icon name="bolt" size={18} className="icon" /> {t('Adaptive', 'Adaptive')}
                </Link>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
              {catalogLoading
                ? Array.from({ length: 7 }).map((_, index) => (
                    <div key={index} className="h-20 animate-pulse rounded-[1.4rem] bg-brand-border/60" />
                  ))
                : sidebarLessons.map((lesson) => (
                    <SidebarLessonItem
                      key={getLessonKey(lesson)}
                      lesson={lesson}
                      niveau={niveau}
                      isActive={lesson.active}
                      isLocked={lesson.locked}
                      t={t}
                      lang={lang}
                    />
                  ))}
            </div>
          </div>
        </aside>

        <section className="min-w-0 lg:min-h-0 lg:overflow-y-auto lg:pr-2">
          <div className="space-y-6">
            <div className={cx(cardClass.base, 'overflow-hidden p-4 sm:p-5', theme.tint)}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/cours/${niveau}`} className={buttonClass.ghost}>
                    <Icon name="arrowLeft" size={18} className="icon" /> {t('Lecons', 'Lecons')}
                  </Link>
                  <button className={cx(buttonClass.outline, 'lg:hidden')} type="button" onClick={() => setMobileLessonsOpen(true)}>
                    <Icon name="book" size={18} className="icon" /> {t('Lektionen', 'Lecons')}
                  </button>
                </div>
                <span className={levelBadgeClass(niveau)}>{niveau}</span>
              </div>

              <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-brand-blue">
                    {isAdaptiveMode ? t('Adaptive Lektion', 'Lecon adaptative') : `${t('Lektion', 'Lecon')} ${lessonPositionLabel}`}
                  </p>
                  <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-brand-text sm:text-4xl">
                    {resolveLessonText(lecon?.titre, lang, t)}
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-brand-brown sm:text-base">
                    {resolveLessonText(lecon?.description, lang, t) || t('Strukturiertes Lernen mit klarer Progression.', 'Apprentissage structure avec progression claire.')}
                  </p>
                </div>

                <div className="w-full max-w-sm rounded-[1.6rem] border border-white/85 bg-white/80 p-4 shadow-soft">
                  <div className="flex items-center justify-between gap-3 text-sm text-brand-brown">
                    <span>{t(STAGE_LABELS[etape].de, STAGE_LABELS[etape].fr)}</span>
                    <span>{currentStageIndex + 1}/{ETAPES.length}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {ETAPES.map((step, index) => (
                      <div
                        key={step}
                        className={cx(
                          'h-2.5 flex-1 rounded-full transition',
                          etape === step ? 'bg-brand-blue' : index < currentStageIndex ? 'bg-brand-green' : 'bg-brand-border'
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {lessonError ? (
              <div className="rounded-[1.6rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                {lessonError}
              </div>
            ) : null}

            {lessonState ? (
              <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div className={cx(cardClass.base, 'space-y-4 p-5')}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-blue">
                        {t('Lektionsstatus', 'Etat pedagogique')}
                      </p>
                      <p className="mt-1 text-sm text-brand-brown">
                        {unlockStatus?.eligibleToUnlockNext
                          ? t('Diese Lektion kann die naechste freischalten.', 'Cette lecon peut debloquer la suivante.')
                          : t('Diese Lektion braucht noch Verstarkung.', 'Cette lecon demande encore du renforcement.')}
                      </p>
                    </div>
                    {lastXpGain > 0 ? (
                      <span className="stat-chip">+{lastXpGain} XP</span>
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className={cx(cardClass.soft, 'p-4')}>
                      <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-brand-blue">XP</span>
                      <span className="mt-2 block font-display text-3xl font-semibold text-brand-text">
                        {lessonState.xpEarned}/{lessonState.xpRequired}
                      </span>
                    </div>
                    <div className={cx(cardClass.soft, 'p-4')}>
                      <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-brand-blue">
                        {t('Maitrise', 'Maîtrise')}
                      </span>
                      <span className="mt-2 block font-display text-3xl font-semibold text-brand-text">
                        {lessonState.masteryScore}%
                      </span>
                    </div>
                    <div className={cx(cardClass.soft, 'p-4')}>
                      <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-brand-blue">
                        {t('Fehlerquote', 'Taux erreur')}
                      </span>
                      <span className="mt-2 block font-display text-3xl font-semibold text-brand-text">
                        {lessonState.errorRate}%
                      </span>
                    </div>
                  </div>

                  {unlockStatus?.lockedReason ? (
                    <div className="rounded-[1.2rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      {unlockStatus.lockedReason}
                    </div>
                  ) : null}
                  {lessonState.revisionRequired ? (
                    <div className="rounded-[1.2rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {t(
                        'Mehr als 50% Fehler: Revision noetig, bevor die naechste Lektion freigeschaltet wird.',
                        'Plus de 50% d erreurs: revision requise avant de debloquer la prochaine lecon.'
                      )}
                    </div>
                  ) : null}
                </div>

                <div className={cx(cardClass.base, 'space-y-4 p-5')}>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-blue">
                      {t('Aktive Fehler', 'Erreurs actives')}
                    </p>
                    <p className="mt-1 text-sm text-brand-brown">
                      {t('Diese Themen werden priorisiert.', 'Ces themes sont prioritaires.')}
                    </p>
                  </div>
                  {activeErrors.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {activeErrors.slice(0, 6).map((item) => (
                        <span key={`${item.errorTag}-${item.lessonId}`} className="stat-chip">
                          {item.errorTag} · {item.count}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-brand-brown">
                      {t('Keine aktiven Fehlerprofile.', 'Aucune erreur active pour le moment.')}
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            {etape === 'intro' ? (
              <div className={cx(cardClass.base, 'space-y-6 p-6 text-center sm:p-10')}>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-brand-sky text-brand-blue shadow-soft">
                  <Icon name="book" size={34} className="icon" />
                </div>
                <h2 className="font-display text-4xl font-semibold tracking-tight text-brand-text">
                  {resolveLessonText(lecon?.titre, lang, t)}
                </h2>
                <p className="mx-auto max-w-3xl text-lg leading-relaxed text-brand-brown">
                  {resolveLessonText(lecon?.description, lang, t)}
                </p>
                {Array.isArray(lecon?.explications) && lecon.explications.length > 0 ? (
                  <div className="grid gap-3 text-left">
                    {lecon.explications.map((item, index) => (
                      <div key={`${index}-${item?.titleFr || item?.titleDe || 'exp'}`} className={cx(cardClass.soft, 'p-4')}>
                        <p className="font-display text-lg font-semibold text-brand-text">
                          {lang === 'fr'
                            ? item.titleFr || item.titleDe
                            : lang === 'mix'
                              ? `${item.titleDe || item.titleFr} · ${item.titleFr || item.titleDe}`
                              : item.titleDe || item.titleFr}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-brand-brown">
                          {lang === 'fr'
                            ? item.fr || item.de
                            : lang === 'mix'
                              ? `${item.de || item.fr} · ${item.fr || item.de}`
                              : item.de || item.fr}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className={cx(cardClass.soft, 'p-4')}>
                    <span className="block font-display text-3xl font-semibold text-brand-text">{safePhrases.length}</span>
                    <span className="text-sm text-brand-brown">{t('Satze', 'Phrases')}</span>
                  </div>
                  <div className={cx(cardClass.soft, 'p-4')}>
                    <span className="block font-display text-3xl font-semibold text-brand-text">{safeExercices.length}</span>
                    <span className="text-sm text-brand-brown">{t('Ubungen', 'Exercices')}</span>
                  </div>
                  <div className={cx(cardClass.soft, 'p-4')}>
                    <span className="block font-display text-3xl font-semibold text-brand-text">~{lecon?.duree || 45}min</span>
                    <span className="text-sm text-brand-brown">{t('Dauer', 'Duree')}</span>
                  </div>
                </div>

                {isAdaptiveMode ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className={cx(cardClass.soft, 'p-3 text-sm text-brand-brown')}>
                      UserPowerScore: <strong className="text-brand-text">{adaptiveMetrics.userPowerScore ?? '-'}</strong>
                    </div>
                    <div className={cx(cardClass.soft, 'p-3 text-sm text-brand-brown')}>
                      Complexity 200: <strong className="text-brand-text">{adaptiveMetrics.complexityIndex200 ?? '-'}</strong>
                    </div>
                    <div className={cx(cardClass.soft, 'p-3 text-sm text-brand-brown')}>
                      Stage: <strong className="text-brand-text">{lecon?.adaptiveMeta?.progressionStage || '-'}</strong>
                    </div>
                  </div>
                ) : null}

                <button className={buttonClass.primary} onClick={() => setEtape('phrases')}>
                  <Icon name="arrowRight" size={18} className="icon" /> {t('Starten', 'Commencer')}
                </button>
              </div>
            ) : null}

            {etape === 'phrases' && safePhrases[phraseIndex] ? (
              <div className="space-y-5">
                <div className={cx(cardClass.soft, 'space-y-2 p-4')}>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${((phraseIndex + 1) / Math.max(1, safePhrases.length)) * 100}%` }} />
                  </div>
                  <p className="text-sm font-semibold text-brand-brown">
                    {t('Satz', 'Phrase')} {phraseIndex + 1} / {safePhrases.length}
                  </p>
                </div>

                <div className={cx(cardClass.base, 'space-y-6 p-6')} key={phraseIndex}>
                  <div className="font-display text-4xl font-semibold tracking-tight text-brand-text">{safePhrases[phraseIndex].alemana}</div>
                  <AudioPlayer texte={safePhrases[phraseIndex].audio} langue="de-DE" />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className={cx(cardClass.soft, 'p-4')}>
                      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-blue">Deutsch</span>
                      <span className="mt-3 block text-lg text-brand-text">{safePhrases[phraseIndex].traductionDe}</span>
                    </div>
                    <div className={cx(cardClass.soft, 'p-4')}>
                      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-blue">Francais</span>
                      <span className="mt-3 block text-lg text-brand-text">{safePhrases[phraseIndex].frantsay}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <button className={buttonClass.ghost} onClick={phrasePrev} disabled={phraseIndex === 0}>
                    <Icon name="arrowLeft" size={18} className="icon" /> {t('Zuruck', 'Precedent')}
                  </button>
                  <button className={buttonClass.primary} onClick={phraseNext}>
                    {phraseIndex < safePhrases.length - 1 ? (
                      <>
                        {t('Weiter', 'Suivant')} <Icon name="arrowRight" size={18} className="icon" />
                      </>
                    ) : (
                      <>
                        <Icon name="edit" size={18} className="icon" /> {t('Ubungen', 'Exercices')} <Icon name="arrowRight" size={18} className="icon" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : null}

            {etape === 'exercices' && activeExercise ? (
              <div className="space-y-5">
                <div className={cx(cardClass.soft, 'space-y-2 p-4')}>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-brown">
                    {t('Ubung', 'Exercice')} {exIndex + 1} / {safeExercices.length}
                  </p>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${((exIndex + 1) / Math.max(1, safeExercices.length)) * 100}%` }} />
                  </div>
                </div>

                {activeExercise.type === 'qcm' ? <ExerciceQCM key={activeExerciseKey} data={activeExercise} onValide={handleExerciceValide} /> : null}
                {activeExercise.type === 'fill' ? <ExerciceFillBlank key={activeExerciseKey} data={activeExercise} onValide={handleExerciceValide} /> : null}
                {activeExercise.type === 'traduction' ? <ExerciceTraduction key={activeExerciseKey} data={activeExercise} onValide={handleExerciceValide} /> : null}
                {activeExercise.type === 'match' ? <ExerciceMatchPairs key={activeExerciseKey} data={activeExercise} onValide={handleExerciceValide} /> : null}
                {activeExercise.type === 'build' ? <ExerciceBuildPhrase key={activeExerciseKey} data={activeExercise} onValide={handleExerciceValide} /> : null}
                {activeExercise.type === 'horen' ? <ExerciceHoren key={activeExerciseKey} data={activeExercise} onValide={handleExerciceValide} /> : null}
                {activeExercise.type === 'sprechen' ? <ExerciceSprechen key={activeExerciseKey} data={activeExercise} onValide={handleExerciceValide} /> : null}
              </div>
            ) : null}

            {etape === 'resultat' ? (
              <div className={cx(cardClass.base, 'space-y-6 p-6 text-center sm:p-10')}>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-brand-sky text-brand-blue shadow-soft">
                  {scoreTotal >= 80 ? (
                    <Icon name="trophy" size={34} className="icon" />
                  ) : scoreTotal >= 50 ? (
                    <Icon name="star" size={32} className="icon" />
                  ) : (
                    <Icon name="bolt" size={32} className="icon" />
                  )}
                </div>
                <h2 className="font-display text-4xl font-semibold tracking-tight text-brand-text">
                  {scoreTotal >= 80
                    ? t('Ausgezeichnet!', 'Excellent !')
                    : scoreTotal >= 50
                      ? t('Gut gemacht!', 'Bien !')
                      : t('Weiter so!', 'Continuez !')}
                </h2>
                <div className="text-center">
                  <span className="font-display text-6xl font-semibold text-brand-blue">{scoreTotal}</span>
                  <span className="text-xl text-brand-brown">/ 100</span>
                </div>
                <p className="text-brand-brown">
                  {scores.filter(Boolean).length}/{scores.length} {t('richtige Ubungen', 'exercices corrects')}
                </p>

                {isAdaptiveMode ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className={cx(cardClass.soft, 'p-3 text-sm text-brand-brown')}>
                      UserPowerScore: <strong className="text-brand-text">{adaptiveMetrics.userPowerScore ?? '-'}</strong>
                    </div>
                    <div className={cx(cardClass.soft, 'p-3 text-sm text-brand-brown')}>
                      Complexity 200: <strong className="text-brand-text">{adaptiveMetrics.complexityIndex200 ?? '-'}</strong>
                    </div>
                  </div>
                ) : null}

                {nextRecommendation?.weakConcepts?.length > 0 ? (
                  <div className={cx(cardClass.soft, 'space-y-3 p-4 text-left')}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-blue">
                      {t('Naechste Prioritaet', 'Priorite suivante')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {nextRecommendation.weakConcepts.map((item) => (
                        <span key={`${item.conceptTag}-${item.skill}`} className="stat-chip">
                          {item.conceptTag} · {item.masteryScore}%
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button className={buttonClass.outline} onClick={handleRestart}>
                    <Icon name="refresh" size={18} className="icon" /> {t('Neu starten', 'Recommencer')}
                  </button>
                  {nextLesson && !nextLesson.locked ? (
                    <Link to={`/cours/${niveau}/lecon/${nextLesson.id}`} className={buttonClass.secondary}>
                      <Icon name="arrowRight" size={18} className="icon" /> {t('Naechste Lektion', 'Lecon suivante')}
                    </Link>
                  ) : null}
                  <Link to={`/cours/${niveau}`} className={buttonClass.primary}>
                    <Icon name="book" size={18} className="icon" /> {t('Kurse', 'Cours')} <Icon name="arrowRight" size={18} className="icon" />
                  </Link>
                </div>
              </div>
            ) : null}

            {!isAdaptiveMode ? (
              <div className={cx(cardClass.base, 'space-y-4 p-5')}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-blue">
                      {t('Lektionsnavigation', 'Navigation entre lecons')}
                    </p>
                    <p className="mt-1 text-sm text-brand-brown">
                      {t('Bleibe im gleichen Flow mit vorheriger und naechster Lektion.', 'Reste dans le meme flow avec la lecon precedente et suivante.')}
                    </p>
                  </div>
                  <span className={cx('text-sm font-semibold', theme.text)}>{lessonPositionLabel}</span>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <LessonJumpCard
                    lesson={previousLesson}
                    niveau={niveau}
                    label={t('Vorherige Lektion', 'Lecon precedente')}
                    description={t('Erste Lektion erreicht', 'Premiere lecon atteinte')}
                    disabled={!previousLesson}
                    t={t}
                    lang={lang}
                  />
                  <LessonJumpCard
                    lesson={nextLesson}
                    niveau={niveau}
                    label={t('Naechste Lektion', 'Lecon suivante')}
                    description={t('Noch keine weitere Lektion', 'Pas encore de lecon suivante')}
                    disabled={!nextLesson || nextLesson.locked}
                    t={t}
                    lang={lang}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Lecon
