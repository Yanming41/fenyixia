import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { DebugProvider } from './contexts/DebugContext'
import App from './App'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/fenyixia">
      <DebugProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </DebugProvider>
    </BrowserRouter>
  </StrictMode>,
)
