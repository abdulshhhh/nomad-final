import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Remove StrictMode temporarily as it can cause double rendering
createRoot(document.getElementById('root')).render(
  <App />
)
