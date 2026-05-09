app.jsx

import { useState } from 'react'

import Scanner from './components/Scanner'
import Map from './components/Map'
import Report from './components/Report'

function App() {
  const [tab, setTab] =
    useState('scanner')

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(to bottom, #020617, #0f172a)',

        padding: '1rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {[
          'scanner',
          'map',
          'report',
        ].map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            style={{
              padding:
                '0.9rem 1.5rem',

              border: 'none',

              borderRadius: '999px',

              cursor: 'pointer',

              background:
                tab === item
                  ? '#2563eb'
                  : '#1e293b',

              color: 'white',

              fontWeight: '700',

              textTransform:
                'capitalize',
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === 'scanner' && (
        <Scanner />
      )}

      {tab === 'map' && <Map />}

      {tab === 'report' && (
        <Report />
      )}
    </div>
  )
}

export default App