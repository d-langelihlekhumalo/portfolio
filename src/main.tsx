import React from 'react'
import ReactDOM from 'react-dom/client'
// Self-hosted — no third-party font request. Schibsted Grotesk is the site
// typeface; JetBrains Mono is used only for the hero build receipt and blog
// code blocks, but both are small enough (variable, subset by unicode-range)
// to load eagerly rather than add a second font-loading waterfall later.
import '@fontsource-variable/schibsted-grotesk'
import '@fontsource-variable/jetbrains-mono'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
