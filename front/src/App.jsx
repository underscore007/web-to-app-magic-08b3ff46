import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import MainLayout from '@layouts/MainLayout'

// ── Spinner de chargement pendant le lazy load ──
import PageLoader from '@components/PageLoader'

// ── Pages chargées en lazy (code splitting automatique par Vite) ──
const Home        = lazy(() => import('@pages/Home'))
const Login       = lazy(() => import('@pages/Login'))
const Register    = lazy(() => import('@pages/Register'))
const Dashboard   = lazy(() => import('@pages/Dashboard'))
const Cours       = lazy(() => import('@pages/Cours'))
const Lecon       = lazy(() => import('@pages/Lecon'))
const Sprechen    = lazy(() => import('@pages/Sprechen'))
const Communaute  = lazy(() => import('@pages/Communaute'))
const Guide       = lazy(() => import('@pages/Guide'))
const MonProfil   = lazy(() => import('@pages/MonProfil'))
const NotFound    = lazy(() => import('@pages/NotFound'))

// ── Composant de protection des routes privées ──
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  // Pendant la vérification du token JWT stocké
  if (loading) return <PageLoader />

  // Redirection vers login si non connecté
  if (!user) return <Navigate to="/login" replace />

  return children
}

// ── Composant de redirection si déjà connecté ──
function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <PageLoader />

  // Si déjà connecté, rediriger vers le dashboard
  if (user) return <Navigate to="/dashboard" replace />

  return children
}

// ── App principale ──
function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* ── Routes publiques avec layout principal (Navbar) ── */}
        <Route element={<MainLayout />}>

          {/* Page d'accueil */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* Connexion - redirige si déjà connecté */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />

          {/* Inscription - redirige si déjà connecté */}
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />

          {/* Guide Ausbildung/Au Pair/FSJ - accessible sans compte */}
          <Route
            path="/guide"
            element={<Guide />}
          />
          <Route
            path="/guide/:section"
            element={<Guide />}
          />

          {/* ── Routes privées (nécessitent connexion) ── */}

          {/* Tableau de bord */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Liste des cours par niveau */}
          <Route
            path="/cours"
            element={
              <PrivateRoute>
                <Cours />
              </PrivateRoute>
            }
          />

          {/* Cours filtré par niveau ex: /cours/A1 */}
          <Route
            path="/cours/:niveau"
            element={
              <PrivateRoute>
                <Cours />
              </PrivateRoute>
            }
          />

          {/* Page d'une leçon ex: /cours/A1/lecon/1 */}
          <Route
            path="/cours/:niveau/lecon/:leconId"
            element={
              <PrivateRoute>
                <Lecon />
              </PrivateRoute>
            }
          />

          {/* Sprechen - pratique orale */}
          <Route
            path="/sprechen"
            element={
              <PrivateRoute>
                <Sprechen />
              </PrivateRoute>
            }
          />

          {/* Communauté - chat */}
          <Route
            path="/communaute"
            element={
              <PrivateRoute>
                <Communaute />
              </PrivateRoute>
            }
          />

          {/* Canal de chat spécifique ex: /communaute/general */}
          <Route
            path="/communaute/:canal"
            element={
              <PrivateRoute>
                <Communaute />
              </PrivateRoute>
            }
          />

          <Route
            path="/mon-profil"
            element={
              <PrivateRoute>
                <MonProfil />
              </PrivateRoute>
            }
          />

        </Route>

        {/* ── Page 404 ── */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Suspense>
  )
}

export default App
