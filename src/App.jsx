import { useState } from 'react'

import Scanner from './components/Scanner'
import Map from './components/Map'
import Reports from './components/Reports'

function App() {
  const [tab, setTab] =
    useState('scanner')

  return (
    <div
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
        }}
      >
        <button
          onClick={() =>
            setTab('scanner')
          }
        >
          Scanner
        </button>

        <button
          onClick={() =>
            setTab('map')
          }
        >
          Map
        </button>

        <button
          onClick={() =>
            setTab('reports')
          }
        >
          Reports
        </button>
      </div>

      {tab === 'scanner' && (
        <Scanner />
      )}

      {tab === 'map' && <Map />}

      {tab === 'reports' && (
        <Reports />
      )}
    </div>
  )
}

export default App