import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from '@components/navbar/Navbar'
import { useOffline } from '@hooks/useOffline'
import BottomNav from '@components/BottomNav'
import Icon from '@components/ui/Icon'
import { cx } from '@utils/ui'

// Pages sans padding (full-width)
const FULL_WIDTH_PAGES = ['/sprechen', '/communaute']

function MainLayout() {
  const { isOnline, showReconnected } = useOffline()
  const location = useLocation()
  const isFullWidth = FULL_WIDTH_PAGES.some((p) => location.pathname.startsWith(p))

  // Remonter en haut a chaque changement de page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  const bannerClasses =
    'fixed inset-x-4 top-4 z-[70] flex items-center justify-center gap-2 rounded-full border border-brand-border/80 bg-white/90 px-4 py-3 text-sm font-semibold text-brand-text shadow-soft backdrop-blur sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2'

  return (
    <div className="min-h-screen">
      {!isOnline && (
        <div className={cx(bannerClasses, 'border-amber-200 bg-amber-50/95 text-amber-700')} role="alert" aria-live="polite">
          <Icon name="wifiOff" size={18} className="icon" />
          <span>Keine Verbindung - Mode hors ligne</span>
        </div>
      )}

      {showReconnected && (
        <div className={cx(bannerClasses, 'border-emerald-200 bg-emerald-50/95 text-emerald-700')} role="status" aria-live="polite">
          <Icon name="checkCircle" size={18} className="icon" />
          <span>Verbindung wiederhergestellt - Reconnecté</span>
        </div>
      )}

      <Navbar />

      <main
        className={cx(
          'relative min-h-[calc(100vh-8rem)] pt-24 md:pt-28',
          isFullWidth ? 'pb-24 md:pb-12' : 'pb-28 md:pb-14'
        )}
        id="main-content"
      >
        {isFullWidth ? (
          <Outlet />
        ) : (
          <div className="page-section">
            <Outlet />
          </div>
        )}
      </main>

      <BottomNav />

      <footer className="border-t border-brand-border/70 bg-white/65 pb-24 pt-8 backdrop-blur md:pb-10">
        <div className="shell flex flex-col gap-3 text-sm text-brand-brown sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-brand-text">
            &copy; {new Date().getFullYear()} EAM - Ecole d&apos;Allemand pour Malgaches
          </p>
          <p className="text-brand-brown/85">
            Concu pour apprendre l&apos;allemand avec une interface mobile claire, utile et rapide.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout

