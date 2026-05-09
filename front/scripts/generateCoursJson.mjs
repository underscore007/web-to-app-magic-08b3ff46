import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { A1_LECONS } from '../src/data/cours/A1_lecons.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const OUT_DIR = path.join(__dirname, '..', 'backend', 'data', 'cours')
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const THEMES = {
  A2: [
    { mg: 'Fotoana sy fandaharam-potoana', fr: 'Temps et routine' },
    { mg: 'Fividianana', fr: 'Faire les courses' },
    { mg: 'Fitaterana', fr: 'Transports' },
    { mg: 'Ao an-trano', fr: 'A la maison' },
    { mg: 'Any am-piasana', fr: 'Au travail' },
    { mg: 'Any an-tsekoly', fr: "A l'ecole" },
    { mg: 'Miresaka momba ny toerana', fr: 'Parler des lieux' },
    { mg: 'Aminny trano fisakafoana', fr: 'Au restaurant' },
    { mg: 'Any aminny dokotera', fr: 'Chez le medecin' },
    { mg: 'Toetrandro', fr: 'La meteo' },
  ],
  B1: [
    { mg: 'Miresaka ny tena sy ny tanjona', fr: 'Se presenter et objectifs' },
    { mg: 'Asa sy fiofanana', fr: 'Travail et formation' },
    { mg: 'Miantso sy mandefa hafatra', fr: 'Telephone et messages' },
    { mg: 'Fomba fiainana', fr: 'Style de vie' },
    { mg: 'Fialam-boly', fr: 'Loisirs' },
    { mg: 'Fandehanana sy dian-tany', fr: 'Voyage' },
    { mg: 'Resaka vaovao', fr: 'Actualites simples' },
    { mg: 'Hevitra sy safidy', fr: 'Opinions et choix' },
    { mg: 'Olana sy vahaolana', fr: 'Problemes et solutions' },
    { mg: 'Fampiharana aminny resaka', fr: 'Mise en pratique' },
  ],
  B2: [
    { mg: 'Resaka ofisialy', fr: 'Communication formelle' },
    { mg: 'Adihevitra', fr: 'Debat' },
    { mg: 'Tatitry ny zavatra', fr: 'Raconter en detail' },
    { mg: 'Asa any Allemagne', fr: 'Travail en Allemagne' },
    { mg: 'Fampiharana CV', fr: 'CV et candidature' },
    { mg: 'Fanontaniana entretien', fr: 'Entretien' },
    { mg: 'Fifanarahana', fr: 'Contrats' },
    { mg: 'Olana aminny asa', fr: 'Conflits au travail' },
    { mg: 'Fampiasana teny matanjaka', fr: 'Vocabulaire avance' },
    { mg: 'Fandresen-dahatra', fr: 'Convaincre' },
  ],
  C1: [
    { mg: 'Lahatsoratra sy famintinana', fr: 'Resume et synthese' },
    { mg: 'Fampisehoana', fr: 'Presentation' },
    { mg: 'Fomba fiteny', fr: 'Registres de langue' },
    { mg: 'Resaka lalina', fr: 'Discussions approfondies' },
    { mg: 'Fampiharana aminny asa', fr: 'Communication pro' },
    { mg: 'Fanazavana sarotra', fr: 'Explications complexes' },
    { mg: 'Fomba fanoratra', fr: 'Ecriture' },
    { mg: 'Fampitahana hevitra', fr: 'Comparer des idees' },
    { mg: 'Fifampiraharahana', fr: 'Negociation' },
    { mg: 'Fampiharana farany', fr: 'Entrainement final' },
  ],
  C2: [
    { mg: 'Fahaiza-miteny tonga lafatra', fr: 'Maitrise orale' },
    { mg: 'Fahaiza-manoratra', fr: 'Maitrise ecrite' },
    { mg: 'Fiteny mahazatra', fr: 'Nuances et idiomes' },
    { mg: 'Adihevitra sarotra', fr: 'Debat complexe' },
    { mg: 'Fifandraisana aminny asa', fr: 'Pro niveau expert' },
    { mg: 'Fampiharana interview', fr: 'Interview avancee' },
    { mg: 'Fampiharana ho anny examen', fr: 'Examen' },
    { mg: 'Fiteny ara-kolontsaina', fr: 'Culture' },
    { mg: 'Fifampiraharahana lehibe', fr: 'Negociation' },
    { mg: 'Famaranana', fr: 'Final' },
  ],
}

const pick = (arr, i) => arr[i % arr.length]

function splitTitre(titre) {
  if (!titre) return { mg: '', fr: '' }
  const parts = String(titre).split('·').map((s) => s.trim()).filter(Boolean)
  if (parts.length >= 2) return { mg: parts[0], fr: parts.slice(1).join(' · ') }
  return { mg: String(titre).trim(), fr: String(titre).trim() }
}

function shuffle(arr, seed) {
  const a = [...arr]
  let s = seed || 1
  const rand = () => {
    // xorshift32
    s ^= s << 13; s ^= s >> 17; s ^= s << 5
    return ((s >>> 0) % 1_000_000) / 1_000_000
  }
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function mkPhrases(lessonSeed) {
  const base = [
    { de: 'Guten Morgen!', mg: 'Maraina tsara!', fr: 'Bonjour !' },
    { de: 'Wie heisst du?', mg: 'Iza no anaranao?', fr: "Comment tu t'appelles ?" },
    { de: 'Ich heisse Ravo.', mg: 'Ravo no anarako.', fr: "Je m'appelle Ravo." },
    { de: 'Ich komme aus Madagaskar.', mg: 'Avy any Madagasikara aho.', fr: 'Je viens de Madagascar.' },
    { de: 'Entschuldigung.', mg: 'Azafady.', fr: 'Pardon.' },
    { de: 'Danke!', mg: 'Misaotra!', fr: 'Merci !' },
    { de: 'Bitte.', mg: 'Tsy misy fisaorana.', fr: 'De rien.' },
    { de: 'Ich lerne Deutsch.', mg: 'Mianatra alemana aho.', fr: "J'apprends l'allemand." },
    { de: 'Ich verstehe.', mg: 'Azoko.', fr: 'Je comprends.' },
    { de: 'Koennen Sie das bitte wiederholen?', mg: 'Azonao averina ve?', fr: 'Pouvez-vous repeter ?' },
  ]

  return shuffle(base, 1000 + lessonSeed).slice(0, 10).map((p, idx) => ({
    id: idx + 1,
    alemana: p.de,
    malagasy: p.mg,
    frantsay: p.fr,
    audio: p.de,
  }))
}

function mkExercises({ leconId, lessonSeed }) {
  const vocab = [
    { de: 'Hallo', mg: 'Salama', fr: 'Salut' },
    { de: 'Guten Morgen', mg: 'Maraina tsara', fr: 'Bonjour (matin)' },
    { de: 'Guten Tag', mg: 'Atoandro tsara', fr: 'Bonjour (journee)' },
    { de: 'Guten Abend', mg: 'Hariva tsara', fr: 'Bonsoir' },
    { de: 'Gute Nacht', mg: 'Alina tsara', fr: 'Bonne nuit' },
    { de: 'Danke', mg: 'Misaotra', fr: 'Merci' },
    { de: 'Bitte', mg: 'Azafady', fr: "S'il vous plait / De rien" },
    { de: 'Entschuldigung', mg: 'Azafady', fr: 'Pardon' },
    { de: 'Ich komme aus ...', mg: 'Avy any ... aho', fr: 'Je viens de ...' },
    { de: 'Ich heisse ...', mg: 'Ny anarako dia ...', fr: "Je m'appelle ..." },
    { de: 'Wie geht es dir?', mg: 'Manao ahoana?', fr: 'Comment ca va ?' },
    { de: 'Sehr gut', mg: 'Tsara be', fr: 'Tres bien' },
    { de: 'Bahnhof', mg: 'Gara', fr: 'Gare' },
    { de: 'Wasser', mg: 'Rano', fr: 'Eau' },
    { de: 'Essen', mg: 'Sakafo', fr: 'Nourriture' },
  ]

  const baseDe = [
    'Ich heisse Ravo.',
    'Ich komme aus Madagaskar.',
    'Guten Morgen!',
    'Ich lerne Deutsch.',
    'Wo ist der Bahnhof?',
  ]

  const SENT_MEANING = {
    'Ich heisse Ravo.': { mg: 'Ravo no anarako.', fr: "Je m'appelle Ravo." },
    'Ich komme aus Madagaskar.': { mg: 'Avy any Madagasikara aho.', fr: 'Je viens de Madagascar.' },
    'Guten Morgen!': { mg: 'Maraina tsara!', fr: 'Bonjour (matin) !' },
    'Ich lerne Deutsch.': { mg: 'Mianatra alemana aho.', fr: "J'apprends l'allemand." },
    'Wo ist der Bahnhof?': { mg: 'Aiza ny gara?', fr: 'Ou est la gare ?' },
    'Guten Tag!': { mg: 'Atoandro tsara!', fr: 'Bonjour !' },
    'Danke!': { mg: 'Misaotra!', fr: 'Merci !' },
    'Wie heisst du?': { mg: 'Iza no anaranao?', fr: "Comment tu t'appelles ?" },
  }

  const exercises = []
  let exId = 1
  const add = (ex) => exercises.push({ id: `${leconId}-ex-${String(exId++).padStart(3, '0')}`, ...ex })

  const pickDistinct = (seed, targetDe, n) => {
    const res = []
    let k = 0
    while (res.length < n && k < 500) {
      const cand = pick(vocab, seed + k)
      if (cand.de === targetDe) { k++; continue }
      if (res.some((r) => r.de === cand.de)) { k++; continue }
      res.push(cand)
      k++
    }
    return res
  }

  // 10 QCM (DE -> traduction MG/FR)
  for (let i = 0; i < 10; i++) {
    const v = pick(vocab, lessonSeed + i)
    const distractors = pickDistinct(lessonSeed * 101 + i * 7, v.de, 3)
    const entries = shuffle([v, ...distractors], lessonSeed + i)
    add({
      type: 'qcm',
      question: `Inona no dikan'ny "${v.de}"?`,
      questionFr: `Que signifie "${v.de}" ?`,
      de: v.de,
      meaning: { mg: v.mg, fr: v.fr },
      options: entries.map((e) => ({ mg: e.mg, fr: e.fr })),
      reponse: entries.findIndex((e) => e.de === v.de),
    })
  }

  // 10 Traduction (MG/FR -> DE)
  for (let i = 0; i < 10; i++) {
    const v = pick(vocab, lessonSeed * 2 + i)
    add({
      type: 'traduction',
      source: v.mg,
      sourceFr: v.fr,
      reponse: v.de,
      meaning: { mg: v.mg, fr: v.fr },
      accepte: [v.de, v.de.toLowerCase()],
    })
  }

  // 10 Fill blank
  for (let i = 0; i < 10; i++) {
    const de = pick(baseDe, lessonSeed + i)
    const parts = de.split(' ')
    const hole = parts[Math.min(1, parts.length - 1)]
    const avant = parts[0]
    const apres = parts.slice(2).join(' ') || '...'
    add({
      type: 'fill',
      phraseDe: de,
      meaning: SENT_MEANING[de] || { mg: '', fr: '' },
      avant,
      trou: '___',
      apres,
      reponse: hole,
      indice: hole.slice(0, Math.min(3, hole.length)) + '...',
    })
  }

  // 10 Match pairs (DE <-> MG/FR)
  for (let i = 0; i < 10; i++) {
    const pairs = shuffle(vocab, lessonSeed + i).slice(0, 4)
    add({
      type: 'match',
      promptMg: 'Ampifandraiso (Alemanina <-> dika)',
      promptFr: 'Relie (Allemand <-> traduction)',
      pairs: pairs.map((p) => ({ de: p.de, mg: p.mg, fr: p.fr })),
    })
  }

  // 5 Construction de phrase
  for (let i = 0; i < 5; i++) {
    const sentence = pick([
      'Ich komme aus Madagaskar.',
      'Ich heisse Ravo.',
      'Wie heisst du?',
      'Guten Morgen!',
      'Ich lerne Deutsch.',
    ], lessonSeed + i)
    const words = shuffle(sentence.replace(/[.!?]/g, '').split(' '), lessonSeed * 3 + i)
    add({
      type: 'build',
      promptMg: 'Ataovy ny fehezanteny (Alemanina)',
      promptFr: 'Construis la phrase (Allemand)',
      words,
      answer: sentence,
      meaning: SENT_MEANING[sentence] || { mg: '', fr: '' },
    })
  }

  // 3 Horen (ecoute + QCM) - options bilingues
  for (let i = 0; i < 3; i++) {
    const v = pick(vocab, lessonSeed + 40 + i)
    const distractors = pickDistinct(lessonSeed * 303 + i * 11, v.de, 3)
    const entries = shuffle([v, ...distractors], lessonSeed + 90 + i)
    add({
      type: 'horen',
      promptMg: 'Henoy dia fidio ny dika',
      promptFr: 'Ecoute puis choisis la bonne traduction',
      audioText: v.de,
      de: v.de,
      meaning: { mg: v.mg, fr: v.fr },
      options: entries.map((e) => ({ mg: e.mg, fr: e.fr })),
      correct: entries.findIndex((e) => e.de === v.de),
    })
  }

  // 2 Sprechen (micro)
  for (let i = 0; i < 2; i++) {
    const sentence = pick([
      'Guten Tag!',
      'Ich heisse Ravo.',
      'Ich komme aus Madagaskar.',
      'Danke!',
    ], lessonSeed + 120 + i)
    add({
      type: 'sprechen',
      promptMg: "Lazao amin'ny feo (Alemanina)",
      promptFr: 'Dis a voix haute (Allemand)',
      texteAttendu: sentence,
      meaning: SENT_MEANING[sentence] || { mg: '', fr: '' },
    })
  }

  if (exercises.length !== 50) throw new Error(`Expected 50 exercises for ${leconId}, got ${exercises.length}`)
  return exercises
}

function normalizeLesson({ l, idx, niveau }) {
  const titreObj = typeof l.titre === 'string' ? splitTitre(l.titre) : (l.titre || { mg: '', fr: '' })
  const leconId = l.id || `${niveau.toLowerCase()}-${idx + 1}`
  const phrases = mkPhrases((idx + 1) + (niveau.charCodeAt(0) || 0))
  const exercices = mkExercises({ leconId, lessonSeed: idx + 1 })

  return {
    id: leconId,
    numero: l.numero || idx + 1,
    niveau,
    titre: titreObj,
    description: {
      mg: `Lesona momba ny: ${titreObj.mg || 'fampiharana'}.`,
      fr: `Lecon sur: ${titreObj.fr || 'mise en pratique'}.`,
    },
    duree: l.duree || 20,
    phrasesCount: l.phrases || phrases.length,
    exercicesCount: 50,
    mots: l.mots || [],
    phrases,
    exercices,
  }
}

function mkLevel(niveau) {
  if (niveau === 'A1') {
    return A1_LECONS.map((l, idx) => normalizeLesson({ l, idx, niveau }))
  }

  const themes = THEMES[niveau] || []
  const base = Array.from({ length: Math.max(10, themes.length || 10) }, (_, i) => {
    const th = themes[i] || { mg: `Lesona ${niveau} ${i + 1}`, fr: `Lecon ${niveau} ${i + 1}` }
    return {
      id: `${niveau.toLowerCase()}-${i + 1}`,
      numero: i + 1,
      niveau,
      titre: { mg: th.mg, fr: th.fr },
      duree: 20,
      phrases: 10,
      exercices: 50,
      mots: [],
    }
  })

  return base.map((l, idx) => normalizeLesson({ l, idx, niveau }))
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  for (const niveau of LEVELS) {
    const lecons = mkLevel(niveau)
    if (lecons.length < 10) throw new Error(`Niveau ${niveau} doit avoir au moins 10 lecons`)

    const out = {
      niveau,
      generatedAt: new Date().toISOString(),
      lecons,
    }

    fs.writeFileSync(path.join(OUT_DIR, `${niveau}.json`), JSON.stringify(out, null, 2), 'utf8')
    console.log(`[OK] ${niveau}: ${lecons.length} lecons -> ${path.join(OUT_DIR, `${niveau}.json`)}`)
  }
}

main()
