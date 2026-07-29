import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import '@fontsource-variable/inter/index.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
// Display face for headings only. Inter carries the UI and JetBrains Mono the
// numbers; Inter-for-everything is what made the app read as characterless.
import '@fontsource/instrument-serif/400.css'
import './index.css'
import App from './App.tsx'
import { initNative } from './lib/native-init'

if (Capacitor.isNativePlatform()) {
  document.documentElement.classList.add('is-native')
  document.body.classList.add('is-native')
}
initNative()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
