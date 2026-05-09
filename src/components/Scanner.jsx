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
    },

    {
      value: 17,
      label: 'Moderate',
    },

    {
      value: 24,
      label: 'Severe',
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
        level = 'Severe'
      } else if (total > 10) {
        level = 'Moderate'
      } else if (total > 7) {
        level = 'Minor'
      }

      if (level) {
        setPotholes((prev) => prev + 1)

        setSeverity(level)

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

                severity: total,

                label: level,

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
  }, [isScanning, lastDetection])

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

  return (
    <div
      style={{
        padding: '2rem',
        color: 'white',
      }}
    >
      <h1>
        Road Hazard Scanner
      </h1>

      <button
        onClick={() =>
          setIsScanning(
            !isScanning
          )
        }
        style={{
          padding:
            '1rem 2rem',

          borderRadius: '14px',

          border: 'none',

          background: isScanning
            ? '#ef4444'
            : '#2563eb',

          color: 'white',

          fontWeight: 'bold',

          cursor: 'pointer',

          marginRight: '1rem',
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

          borderRadius: '14px',

          border: 'none',

          background: '#22c55e',

          color: 'white',

          fontWeight: 'bold',

          cursor: 'pointer',
        }}
      >
        Simulate Detection
      </button>

      <div
        style={{
          marginTop: '2rem',
          fontSize: '1.2rem',
          lineHeight: '2',
        }}
      >
        <p>
          Total Detections:{' '}
          {potholes}
        </p>

        <p>
          Latest Severity:{' '}
          {severity}
        </p>

        <p>
          Scanner Status:{' '}
          {isScanning
            ? 'ACTIVE'
            : 'INACTIVE'}
        </p>
      </div>
    </div>
  )
}

export default Scanner