import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/global.css'
import ImageGenerator from './components/ImageGenerator'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ImageGenerator />
  </React.StrictMode>,
)
