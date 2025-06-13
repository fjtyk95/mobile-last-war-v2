import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Fix viewport height for mobile browsers
const setVH = () => {
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

setVH()
window.addEventListener('resize', setVH)
window.addEventListener('orientationchange', () => {
  setTimeout(setVH, 100)
})

const root = createRoot(document.getElementById('root')!)
root.render(<App />)