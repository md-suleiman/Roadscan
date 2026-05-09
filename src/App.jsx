import { useState, useRef } from 'react'

import Scanner from './components/Scanner'
import Map from './components/Map'
import Reports from './components/Reports'

function App() {
  const [tab, setTab] =
    useState('scanner')

  const touchStartX =
    useRef(0)

  const touchEndX =
    useRef(0)

  const tabs = [
    'scanner',
    'map',
    'reports',
  ]

  const handleTouchStart = (
    e
  ) => {
    touchStartX.current =
      e.changedTouches[0].screenX
  }

  const handleTouchEnd = (e) => {
    touchEndX.current =
      e.changedTouches[0].screenX

    const delta =
      touchStartX.current -
      touchEndX.current

    const currentIndex =
      tabs.indexOf(tab)

    // Swipe left
    if (delta > 70) {
      const nextIndex =
        Math.min(
          currentIndex + 1,
          tabs.length - 1
        )

      setTab(tabs[nextIndex])
    }

    // Swipe right
    if (delta < -70) {
      const prevIndex =
        Math.max(
          currentIndex - 1,
          0
        )

      setTab(tabs[prevIndex])
    }
  }

  return (
    <div
      onTouchStart={
        handleTouchStart
      }
      onTouchEnd={handleTouchEnd}
      style={{
        minHeight: '100vh',

        background:
          'linear-gradient(180deg,#0f172a,#020617)',
      }}
    >
      <div
        style={{
          display: 'flex',

          justifyContent:
            'center',

          gap: '1rem',

          padding: '1rem',

          position: 'sticky',

          top: 0,

          zIndex: 999,

          backdropFilter:
            'blur(10px)',
        }}
      >
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() =>
              setTab(t)
            }
            style={{
              padding:
                '0.8rem 1.4rem',

              borderRadius:
                '999px',

              border: 'none',

              cursor: 'pointer',

              background:
                tab === t
                  ? '#2563eb'
                  : 'rgba(255,255,255,0.08)',

              color: 'white',

              fontWeight: '700',

              textTransform:
                'capitalize',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'scanner' && (
        <Scanner />
      )}

      {tab === 'map' && (
        <Map />
      )}

      {tab === 'reports' && (
        <Reports
          setTab={setTab}
        />
      )}
    </div>
  )
}

export default App