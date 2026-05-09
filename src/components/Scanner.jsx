import { useEffect, useState } from 'react'

import {
  db,
  collection,
 addDoc,
} from '../firebase'

function Scanner() {
  const [isScanning, setIsScanning] =
    useState(false)

  const [potholes, setPotholes] =
    useState(0)

  const [severity, setSeverity] =
    useState('None')

  const [lastDetection, setLastDetection] =
    useState(0)

  const [demoIndex, setDemoIndex] =
    useState(0)

  const severityLevels = [
    {
      value: 8,
      label: 'Minor',
      color: '#eab308',
    },

    {
      value: 17,
      label: 'Moderate',
      color: '#f59e0b',
    },

    {
      value: 24,
      label: 'Severe',
      color: '#ef4444',
    },
  ]

  useEffect(() => {
    const handleMotion = async (
      event
    ) => {
      if (!isScanning) return

      const now = Date.now()

      if (
        now - lastDetection <
        2000
      )
        return

      const acc =
        event.accelerationIncludingGravity

      if (!acc) return

      const total =
        Math.abs(acc.x || 0) +
        Math.abs(acc.y || 0) +
        Math.abs(acc.z || 0)

      let level = null

      if (total > 15) {
        level = {
          label: 'Severe',
          value: total,
        }
      } else if (total > 10) {
        level = {
          label: 'Moderate',
          value: total,
        }
      } else if (total > 7) {
        level = {
          label: 'Minor',
          value: total,
        }
      }

      if (level) {
        setPotholes((prev) => prev + 1)

        setSeverity(level.label)

        setLastDetection(now)

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            await addDoc(
              collection(
                db,
                'potholes'
              ),
              {
                lat:
                  position.coords
                    .latitude,

                lng:
                  position.coords
                    .longitude,

                severity:
                  level.value,

                label:
                  level.label,

                timestamp:
                  Date.now(),
              }
            )
          }
        )
      }
    }

    window.addEventListener(
      'devicemotion',
      handleMotion
    )

    return () => {
      window.removeEventListener(
        'devicemotion',
        handleMotion
      )
    }
  }, [
    isScanning,
    lastDetection,
  ])

  const simulateDetection =
    async () => {
      const current =
        severityLevels[
          demoIndex
        ]

      setPotholes(
        (prev) => prev + 1
      )

      setSeverity(current.label)

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await addDoc(
            collection(
              db,
              'potholes'
            ),
            {
              lat:
                position.coords
                  .latitude,

              lng:
                position.coords
                  .longitude,

              severity:
                current.value,

              label:
                current.label,

              timestamp:
                Date.now(),
            }
          )
        }
      )

      setDemoIndex(
        (prev) =>
          (prev + 1) % 3
      )
    }

  const getSeverityColor = () => {
    if (severity === 'Severe')
      return '#ef4444'

    if (
      severity === 'Moderate'
    )
      return '#f59e0b'

    if (severity === 'Minor')
      return '#eab308'

    return '#94a3b8'
  }

  return (
    <div
      style={{
        padding: '2rem',
        color: 'white',
      }}
    >
      <h1
        style={{
          fontSize: '2.5rem',
          marginBottom: '0.5rem',
        }}
      >
        Road Hazard Scanner
      </h1>

      <p
        style={{
          color: '#94a3b8',
          marginBottom: '2rem',
        }}
      >
        AI-powered road anomaly
        detection system
      </p>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() =>
            setIsScanning(
              !isScanning
            )
          }
          style={{
            padding:
              '1rem 2rem',

            borderRadius: '16px',

            border: 'none',

            background: isScanning
              ? '#ef4444'
              : '#2563eb',

            color: 'white',

            fontWeight: 'bold',

            fontSize: '1rem',

            cursor: 'pointer',
          }}
        >
          {isScanning
            ? 'Stop Scanning'
            : 'Start Scanning'}
        </button>

        <button
          onClick={
            simulateDetection
          }
          style={{
            padding:
              '1rem 2rem',

            borderRadius: '16px',

            border: 'none',

            background:
              'linear-gradient(135deg,#22c55e,#16a34a)',

            color: 'white',

            fontWeight: 'bold',

            fontSize: '1rem',

            cursor: 'pointer',
          }}
        >
          Simulate Detection
        </button>
      </div>

      <div
        style={{
          display: 'grid',

          gridTemplateColumns:
            'repeat(auto-fit, minmax(240px, 1fr))',

          gap: '1.5rem',
        }}
      >
        <div
          style={{
            background:
              'rgba(255,255,255,0.05)',

            padding: '2rem',

            borderRadius: '24px',

            border:
              '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2
            style={{
              color: '#94a3b8',
              marginBottom: '1rem',
            }}
          >
            Total Detections
          </h2>

          <h1
            style={{
              fontSize: '3rem',
              margin: 0,
            }}
          >
            {potholes}
          </h1>
        </div>

        <div
          style={{
            background:
              'rgba(255,255,255,0.05)',

            padding: '2rem',

            borderRadius: '24px',

            border:
              '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2
            style={{
              color: '#94a3b8',
              marginBottom: '1rem',
            }}
          >
            Latest Severity
          </h2>

          <h1
            style={{
              fontSize: '2.5rem',
              margin: 0,
              color:
                getSeverityColor(),
            }}
          >
            {severity}
          </h1>
        </div>

        <div
          style={{
            background:
              'rgba(255,255,255,0.05)',

            padding: '2rem',

            borderRadius: '24px',

            border:
              '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2
            style={{
              color: '#94a3b8',
              marginBottom: '1rem',
            }}
          >
            Scanner Status
          </h2>

          <h1
            style={{
              fontSize: '2rem',
              margin: 0,
              color: isScanning
                ? '#22c55e'
                : '#ef4444',
            }}
          >
            {isScanning
              ? 'ACTIVE'
              : 'INACTIVE'}
          </h1>
        </div>
      </div>
    </div>
  )
}

export default Scanner