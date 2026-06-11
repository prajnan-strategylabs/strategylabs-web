import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
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
