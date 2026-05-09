// Small helper to compare user answers more reliably.
// - removes accents/diacritics
// - normalizes spaces
// - handles German ß vs ss
// - strips common punctuation
export function normalizeAnswer(input) {
  return String(input ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .toLowerCase()
    .trim()
    .replace(/[“”„]/g, '"')
    .replace(/[’‘]/g, "'")
    .replace(/[.,!?;:()[\]{}"]/g, '')
    .replace(/\s+/g, ' ')
}

