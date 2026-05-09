import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@context/AuthContext'
import { GamificationProvider } from '@context/GamificationContext'
import { LangProvider } from '@context/LangContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BrowserRouter au plus haut niveau pour React Router v6 */}
    <BrowserRouter>
      {/* AuthProvider wrappe toute l'app pour accès global au user connecté */}
      <LangProvider>
        <AuthProvider>
          <GamificationProvider>
            <App />
          </GamificationProvider>
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  </React.StrictMode>
)
