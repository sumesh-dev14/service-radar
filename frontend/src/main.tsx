/**
 * main.tsx — Service Radar App Entry
 * Ref: §Installation & Setup, §Tech Stack (Frontend)
 *
 * Renders the root React tree with:
 *   BrowserRouter  — React Router DOM v7 history management
 *   ThemeProvider  — dark/light mode context + <html> class toggling
 *   StrictMode     — highlights potential problems in development
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/providers/ThemeProvider'
import App from './App'
import './index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error(
    '[Service Radar] Root element #root not found in index.html. ' +
    'Ensure <div id="root"></div> exists.',
  )
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
