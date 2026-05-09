import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'eam_lang'

// lang:
// - 'mix': affichage mixte (FR + DE)
// - 'de': Allemand
// - 'fr': Francais
const LangContext = createContext(null)

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang doit etre utilise dans LangProvider')
  return ctx
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'de' || saved === 'fr' || saved === 'mix' ? saved : 'fr'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
  }, [lang])

  const value = useMemo(() => {
    // t(de, fr)
    // t({ de, fr, mix }) (recommended when you want a natural FR+DE string)
    //
    // opts:
    // - sep: legacy separator fallback (default: ' · ')
    // - mixSep: separator used in MIX when both FR and MG exist (default: ' ')
    const t = (de, fr, opts = {}) => {
      let deTxt = de ?? ''
      let frTxt = fr ?? ''
      let mixTxt = ''

      // Object form: t({ de, fr, mix })
      if (de && typeof de === 'object' && !Array.isArray(de)) {
        deTxt = de.de ?? ''
        frTxt = de.fr ?? ''
        mixTxt = de.mix ?? ''
      }

      const sep = opts.sep || ' · '
      const mixSep = opts.mixSep || ' '

      if (lang === 'de') return deTxt || frTxt
      if (lang === 'fr') return frTxt || deTxt

      // MIX
      if (mixTxt) return mixTxt
      if (!deTxt) return frTxt
      if (!frTxt) return deTxt

      return `${frTxt}${mixSep}${deTxt}`.trim() || `${deTxt}${sep}${frTxt}`
    }

    return { lang, setLang, t }
  }, [lang])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export default LangContext

