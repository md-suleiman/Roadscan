import { useState, useEffect } from 'react'

import {
  db,
  collection,
  addDoc,
} from '../firebase'

function Scanner() {
  const [detecting, setDetecting] =
    useState(false)

  const [count, setCount] =
    useState(0)

  const [status, setStatus] =
    useState(
      'Press Start to begin scanning'
    )

  const [lastDetection, setLastDetection] =
    useState(null)

  const [clicked, setClicked] =
    useState(false)

  const [motionValue, setMotionValue] =
    useState(0)

  const reportPothole = async (
    severity
  ) => {
    setCount((prev) => prev + 1)

    setStatus(
      'Uploading detection...'
    )

    setLastDetection(
      new Date().toLocaleTimeString()
    )

    setClicked(true)

    setTimeout(
      () => setClicked(false),
      200
    )

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const report = {
          lat:
            position.coords
              .latitude,

          lng:
            position.coords
              .longitude,

          severity,

          timestamp:
            new Date().toISOString(),
        }

        await addDoc(
          collection(
            db,
            'potholes'
          ),
          report
        )

        let label = 'Minor'

        if (severity >= 26)
          label = 'Severe'
        else if (severity >= 18)
          label = 'Moderate'

        setStatus(
          `${label} pothole detected`
        )
      },

      () =>
        setStatus(
          'Location permission denied'
        )
    )
  }

  useEffect(() => {
    let lastTrigger = 0

    const recentReadings = []

    const isWalkingPattern = () => {
      const now = Date.now()

      const spikes =
        recentReadings.filter(
          (d) =>
            now - d.time < 4000 &&
            d.value > 10
        )

      if (spikes.length < 4)
        return false

      const intervals = []

      for (
        let i = 1;
        i < spikes.length;
        i++
      ) {
        intervals.push(
          spikes[i].time -
            spikes[i - 1].time
        )
      }

      const avg =
        intervals.reduce(
          (a, b) => a + b,
          0
        ) / intervals.length

      const rhythmic =
        intervals.every(
          (i) =>
            Math.abs(i - avg) <
            220
        )

      return (
        rhythmic &&
        avg > 350 &&
        avg < 900
      )
    }

    const isSpeedbreaker = () => {
      const last4 =
        recentReadings.slice(-4)

      if (last4.length < 4)
        return false

      return last4.every(
        (d) => d.value > 14
      )
    }

    const handleMotion = (
      event
    ) => {
      const acc =
        event.accelerationIncludingGravity

      if (!acc) return

      const x = acc.x || 0
      const y = acc.y || 0
      const z = acc.z || 0

      const intensity =
        Math.sqrt(
          x * x +
            y * y +
            z * z
        )

      recentReadings.push({
        value: intensity,
        time: Date.now(),
      })

      if (
        recentReadings.length > 20
      ) {
        recentReadings.shift()
      }

      setMotionValue(
        intensity.toFixed(2)
      )

      const now = Date.now()

      if (
        intensity > 12 &&
        now - lastTrigger > 1800
      ) {
        if (isWalkingPattern()) {
          setStatus(
            'Walking detected — ignored'
          )

          return
        }

        if (isSpeedbreaker()) {
          setStatus(
            'Speedbreaker detected — ignored'
          )

          return
        }

        lastTrigger = now

        let severity

        if (intensity > 28) {
          severity = 32
        } else if (
          intensity > 18
        ) {
          severity = 20
        } else {
          severity = 14
        }

        reportPothole(severity)
      }
    }

    if (detecting) {
      if (
        typeof DeviceMotionEvent !==
          'undefined' &&
        typeof DeviceMotionEvent.requestPermission ===
          'function'
      ) {
        DeviceMotionEvent.requestPermission().then(
          (permission) => {
            if (
              permission ===
              'granted'
            ) {
              window.addEventListener(
                'devicemotion',
                handleMotion
              )

              setStatus(
                'Motion detection active'
              )
            }
          }
        )
      } else {
        window.addEventListener(
          'devicemotion',
          handleMotion
        )

        setStatus(
          'Motion detection active'
        )
      }
    }

    return () => {
      window.removeEventListener(
        'devicemotion',
        handleMotion
      )
    }
  }, [detecting])

  return (
    <div
      style={{
        textAlign: 'center',

        padding: '2rem',

        maxWidth: '500px',

        margin: '0 auto',
      }}
    >
      <h2
        style={{
          fontSize: '2.5rem',

          marginBottom: '0.5rem',

          color: 'white',
        }}
      >
        RoadScan
      </h2>

      <p
        style={{
          color: '#94a3b8',

          marginBottom: '2rem',

          fontSize: '1.1rem',
        }}
      >
        AI Pothole Detection
        System
      </p>

      <div
        style={{
          background:
            'rgba(255,255,255,0.08)',

          padding: '1.5rem',

          borderRadius: '24px',

          marginBottom: '2rem',

          border:
            '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <p
          style={{
            fontSize: '1.1rem',

            margin: 0,

            color: 'white',

            fontWeight: '600',
          }}
        >
          {status}
        </p>

        {lastDetection && (
          <p
            style={{
              fontSize: '0.95rem',

              color: '#cbd5e1',

              marginTop: '0.8rem',
            }}
          >
            Last detected at{' '}
            {lastDetection}
          </p>
        )}
      </div>

      <div
        style={{
          marginBottom: '2rem',
        }}
      >
        <p
          style={{
            fontSize: '4rem',

            fontWeight: 'bold',

            margin: 0,

            color: '#38bdf8',
          }}
        >
          {count}
        </p>

        <p
          style={{
            color: '#94a3b8',

            margin: 0,

            fontSize: '1rem',
          }}
        >
          Potholes Detected
        </p>

        <p
          style={{
            color: '#38bdf8',

            marginTop: '1rem',

            fontSize: '1rem',
          }}
        >
          Motion Intensity:{' '}
          {motionValue}
        </p>
      </div>

      <button
        onClick={() =>
          setDetecting(
            !detecting
          )
        }
        style={{
          padding:
            '1rem 2rem',

          fontSize: '1rem',

          backgroundColor:
            detecting
              ? '#ef4444'
              : '#22c55e',

          color: 'white',

          border: 'none',

          borderRadius: '50px',

          cursor: 'pointer',

          width: '100%',

          marginBottom: '1rem',

          fontWeight: '700',
        }}
      >
        {detecting
          ? 'Stop Scanning'
          : 'Start Scanning'}
      </button>

      <button
        onClick={() => {
          const random =
            Math.random()

          let randomSeverity

          if (random < 0.2) {
            // 20%
            randomSeverity = 14
          } else if (
            random < 0.5
          ) {
            // 30%
            randomSeverity = 20
          } else {
            // 50%
            randomSeverity = 32
          }

          reportPothole(
            randomSeverity
          )
        }}
        style={{
          padding:
            '1rem 2rem',

          fontSize: '1rem',

          backgroundColor:
            clicked
              ? '#1d4ed8'
              : '#2563eb',

          transform: clicked
            ? 'scale(0.96)'
            : 'scale(1)',

          color: 'white',

          border: 'none',

          borderRadius: '50px',

          cursor: 'pointer',

          width: '100%',

          transition:
            'all 0.15s ease',

          boxShadow:
            '0 10px 30px rgba(37,99,235,0.35)',

          fontWeight: '700',
        }}
      >
        Simulate Detection
      </button>
    </div>
  )
}

export default Scanner