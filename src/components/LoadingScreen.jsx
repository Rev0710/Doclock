import React, { useEffect, useState } from 'react'
import './LoadingScreen.css'

export default function LoadingScreen({ message = 'Loading…' }) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const id = setInterval(() =>
      setDots(d => (d.length >= 3 ? '' : d + '.')), 400)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <span className="logo-doc">Doc</span>
          <span className="logo-lock">Lock</span>
        </div>

        <div className="loading-spinner-wrap">
          <div className="loading-ring" />
          <div className="loading-ring delay" />
        </div>

        <p className="loading-message">{message}{dots}</p>
      </div>

      {/* Background decoration */}
      <div className="loading-bg-circle loading-bg-circle--1" />
      <div className="loading-bg-circle loading-bg-circle--2" />
    </div>
  )
}