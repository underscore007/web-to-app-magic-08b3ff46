import { Capacitor } from '@capacitor/core'

const FALLBACK_API_URL = 'http://localhost:3001/api'
const FALLBACK_SOCKET_URL = 'http://localhost:3001'
const ANDROID_EMULATOR_HOST = '10.0.2.2'
const LOCALHOST_NAMES = new Set(['localhost', '127.0.0.1'])

export const isNativeApp = Capacitor.isNativePlatform()
export const nativePlatform = Capacitor.getPlatform()
export const LOGIN_PATH = '/login'

function trimTrailingSlash(value) {
  return value?.replace(/\/+$/, '') || ''
}

function resolveRuntimeUrl(value) {
  if (!value) return value

  try {
    const parsed = new URL(value)

    if (
      isNativeApp &&
      nativePlatform === 'android' &&
      LOCALHOST_NAMES.has(parsed.hostname)
    ) {
      parsed.hostname = ANDROID_EMULATOR_HOST
    }

    return trimTrailingSlash(parsed.toString())
  } catch {
    return trimTrailingSlash(value)
  }
}

function pickRuntimeUrl(nativeValue, webValue, fallbackValue) {
  const preferred = isNativeApp ? nativeValue || webValue : webValue
  return resolveRuntimeUrl(preferred || fallbackValue)
}

function warnIfAndroidEmulatorFallback(envKey, resolvedUrl) {
  if (!isNativeApp || nativePlatform !== 'android' || import.meta.env[envKey]) return

  try {
    const parsed = new URL(resolvedUrl)
    if (parsed.hostname === ANDROID_EMULATOR_HOST) {
      console.warn(
        `[EAM] ${envKey} n'est pas defini. Android utilise ${ANDROID_EMULATOR_HOST}, ce qui fonctionne seulement sur emulateur. Configurez une URL publique pour un vrai telephone.`
      )
    }
  } catch {
    // Ignorer les URLs invalides; la requete reseau exposera deja le probleme.
  }
}

export const API_URL = pickRuntimeUrl(
  import.meta.env.VITE_NATIVE_API_URL?.trim(),
  import.meta.env.VITE_API_URL?.trim(),
  FALLBACK_API_URL
)

export const SOCKET_URL = pickRuntimeUrl(
  import.meta.env.VITE_NATIVE_SOCKET_URL?.trim(),
  import.meta.env.VITE_SOCKET_URL?.trim(),
  FALLBACK_SOCKET_URL
)

warnIfAndroidEmulatorFallback('VITE_NATIVE_API_URL', API_URL)
warnIfAndroidEmulatorFallback('VITE_NATIVE_SOCKET_URL', SOCKET_URL)
