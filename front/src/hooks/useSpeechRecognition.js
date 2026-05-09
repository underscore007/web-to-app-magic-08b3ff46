import { useState, useRef, useCallback, useEffect } from 'react'

// ── useSpeechRecognition ───────────────────────────────────
// Encapsule l'API Web Speech Recognition (natif navigateur)
// Compatible Chrome, Edge — Firefox non supporté

const ERRORS_FR = {
  'not-allowed':    'Accès micro refusé · Autorisez le microphone dans le navigateur',
  'no-speech':      'Keine Sprache erkannt · Aucune parole détectée',
  'audio-capture':  'Mikrofon introuvable · Microphone introuvable',
  'network':        'Erreur réseau · Erreur réseau',
  'aborted':        '',
}

export function useSpeechRecognition({ langue = 'de-DE', onResult, continu = false } = {}) {
  const [isListening, setIsListening] = useState(false)
  const [error, setError]             = useState(null)
  const recognitionRef                = useRef(null)
  const onResultRef                   = useRef(onResult)

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  useEffect(() => {
    onResultRef.current = onResult
  }, [onResult])

  // ── Initialiser la reconnaissance ──
  useEffect(() => {
    if (!isSupported) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition       = new SpeechRecognition()

    recognition.lang        = langue
    recognition.continuous  = continu
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      const texte = event.results[0][0].transcript
      if (onResultRef.current) onResultRef.current(texte)
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      const msg = ERRORS_FR[event.error] || `Erreur: ${event.error}`
      if (msg) setError(msg)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      recognition.abort()
      recognitionRef.current = null
    }
  }, [continu, isSupported, langue])

  // ── Démarrer ──
  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return
    setError(null)
    setIsListening(true)
    try {
      recognitionRef.current.start()
    } catch {
      // Déjà en cours — ignorer
    }
  }, [isSupported])

  // ── Arrêter ──
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }, [])

  return {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
  }
}

export default useSpeechRecognition
