// ── Données statiques leçons A1 ───────────────────────────
// Utilisées en fallback offline et pour la démo sans backend
// 30 leçons A1 avec phrases et exercices

export const A1_LECONS = [
  {
    id: 'a1-1', numero: 1, niveau: 'A1',
    titre: 'Begrüßungen · Les salutations',
    duree: 15, phrases: 10, exercices: 3,
    mots: ['Hallo', 'Guten Morgen', 'Guten Tag', 'Guten Abend', 'Gute Nacht', 'Tschüss', 'Auf Wiedersehen', 'Wie geht es?', 'Danke', 'Bitte'],
  },
  {
    id: 'a1-2', numero: 2, niveau: 'A1',
    titre: 'Sich vorstellen · Se présenter',
    duree: 20, phrases: 10, exercices: 3,
    mots: ['Ich heiße', 'Mein Name ist', 'Ich bin', 'Woher kommen Sie?', 'Ich komme aus', 'Madagaskar', 'Wie alt sind Sie?', 'Ich bin ... Jahre alt', 'Beruf', 'Student'],
  },
  {
    id: 'a1-3', numero: 3, niveau: 'A1',
    titre: 'Die Familie · La famille',
    duree: 20, phrases: 10, exercices: 3,
    mots: ['Mutter', 'Vater', 'Bruder', 'Schwester', 'Großmutter', 'Großvater', 'Familie', 'Eltern', 'Kind', 'Geschwister'],
  },
  {
    id: 'a1-4', numero: 4, niveau: 'A1',
    titre: 'Zahlen · Les chiffres 1-20',
    duree: 15, phrases: 10, exercices: 3,
    mots: ['eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn'],
  },
  {
    id: 'a1-5', numero: 5, niveau: 'A1',
    titre: 'Wochentage · Les jours',
    duree: 15, phrases: 10, exercices: 3,
    mots: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag', 'heute', 'morgen', 'gestern'],
  },
  {
    id: 'a1-6', numero: 6, niveau: 'A1',
    titre: 'Monate und Jahre · Mois et années',
    duree: 15, phrases: 10, exercices: 3,
    mots: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober'],
  },
  {
    id: 'a1-7', numero: 7, niveau: 'A1',
    titre: 'Frühstück · Le petit-déjeuner',
    duree: 20, phrases: 10, exercices: 3,
    mots: ['Brot', 'Butter', 'Käse', 'Ei', 'Milch', 'Kaffee', 'Tee', 'Saft', 'Müsli', 'Marmelade'],
  },
  {
    id: 'a1-8', numero: 8, niveau: 'A1',
    titre: 'Farben · Les couleurs',
    duree: 15, phrases: 10, exercices: 3,
    mots: ['rot', 'blau', 'grün', 'gelb', 'weiß', 'schwarz', 'grau', 'braun', 'orange', 'lila'],
  },
  {
    id: 'a1-9', numero: 9, niveau: 'A1',
    titre: 'Haus und Zimmer · La maison',
    duree: 20, phrases: 10, exercices: 3,
    mots: ['Haus', 'Wohnung', 'Zimmer', 'Küche', 'Badezimmer', 'Schlafzimmer', 'Wohnzimmer', 'Fenster', 'Tür', 'Treppe'],
  },
  {
    id: 'a1-10', numero: 10, niveau: 'A1',
    titre: 'Uhrzeit · L\'heure',
    duree: 20, phrases: 10, exercices: 3,
    mots: ['Uhr', 'Stunde', 'Minute', 'Wie viel Uhr ist es?', 'Es ist', 'halb', 'Viertel', 'morgens', 'abends', 'mittags'],
  },
  // Leçons 11-30 simplifiées
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `a1-${i + 11}`, numero: i + 11, niveau: 'A1',
    titre: [
      'Wetter · La météo', 'Kleidung · Les vêtements', 'Körper · Le corps',
      'Tiere · Les animaux', 'Sport · Le sport', 'Musik · La musique',
      'Reisen · Voyager', 'Einkaufen · Faire les courses', 'Im Restaurant · Au restaurant',
      'Arzt · Chez le médecin', 'Post · La poste', 'Bank · La banque',
      'Schule · L\'école', 'Arbeit · Le travail', 'Freizeit · Les loisirs',
      'Natur · La nature', 'Stadt · La ville', 'Verkehr · Les transports',
      'Medien · Les médias', 'Feste · Les fêtes',
    ][i],
    duree: 15 + (i % 3) * 5,
    phrases: 10,
    exercices: 3,
    mots: [],
  })),
]

// ── Métadonnées du niveau A1 ───────────────────────────────
export const A1_META = {
  code:        'A1',
  nom:         'Anfang',
  nomFr:       'Débutant',
  description: 'Erste Stufe beim Deutschlernen. Première étape de l\'apprentissage de l\'allemand.',
  leconsTotal: 30,
  motsTotal:   300,
  dureeTotal:  '8h',
  emoji:       '🌱',
  couleur:     '#4CAF50',
}

export default A1_LECONS
