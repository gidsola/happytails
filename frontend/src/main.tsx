import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.js'

const rootDiv = document.getElementById('root');
// if someone wants they can add some handling for the case of no element found ('root')
rootDiv && createRoot(rootDiv).render(
  <StrictMode>
    <App />
  </StrictMode>
)
