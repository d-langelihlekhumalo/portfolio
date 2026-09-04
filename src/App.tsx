import { useState, useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRouter from './router'

const THEME_STORAGE_KEY = 'portfolio-theme'

const getInitialTheme = (): boolean => {
  if (typeof window === 'undefined') return true
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light') return false
    if (stored === 'dark') return true
  } catch {
    /* localStorage unavailable — fall through to system preference */
  }
  return !window.matchMedia('(prefers-color-scheme: light)').matches
}

function App() {
  const [isDark, setIsDark] = useState(getInitialTheme)

  // Reflect theme on <html> and persist the choice
  useEffect(() => {
    const htmlElement = document.documentElement
    htmlElement.classList.toggle('dark', isDark)
    htmlElement.classList.toggle('light', !isDark)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light')
    } catch {
      /* ignore persistence failures (private mode, blocked storage) */
    }
  }, [isDark])

  return (
    <BrowserRouter>
      <AppRouter isDark={isDark} onToggleDarkMode={setIsDark} />
    </BrowserRouter>
  )
}

export default App
