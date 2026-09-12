import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import '@fontsource-variable/inter/wght.css'
import './index.css'
import App from './App.tsx'

// Aktiv auf neue Versionen prüfen, statt nur beim nächsten Kaltstart -
// eine schon geöffnete PWA würde sonst tagelang eine veraltete Version
// zeigen, bis der Browser von selbst mal nachschaut.
registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (!registration) return
    setInterval(() => registration.update(), 60_000)
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
