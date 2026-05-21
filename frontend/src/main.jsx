import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from "./context/AuthContext"
import { TrackingProvider } from "./context/TrackingContext"
import { NotificationProvider } from "./context/NotificationContext"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <TrackingProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </TrackingProvider>
    </AuthProvider>
  </StrictMode>,
)