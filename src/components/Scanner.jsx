import { useState, useEffect } from 'react'
import { db, collection, addDoc } from '../firebase'

function Scanner() {
  const [detecting, setDetecting] = useState(false)
  const [count, setCount] = useState(0)
  const [status, setStatus] = useState('Press Start to begin scanning')
  const [lastDetection, setLastDetection] = useState(null)
  const [clicked, setClicked] = useState(false)
  const [motionValue, setMotionValue] = useState(0)

  const reportPothole = async (severity) => {
    setCount((prev) => prev + 1)
    setStatus('Uploading detection...')
    setLastDetection(new Date().toLocaleTimeString())
    setClicked(true)
    setTimeout(() => setClicked(false), 200)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const report = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          severity,
          timestamp: new Date().toISOString(),
        }
        await addDoc(collection(db, 'potholes'), report)

        let label = 'Minor'
        if (severity > 22) label = 'Severe'
        else if (severity > 15) label = 'Moderate'

        setStatus(`${label} pothole detected`)
      },
      () => setStatus('Location permission denied')
    )
  }

  useEffect(() => {
    let lastTrigger = 0
    let lastZ = null

    // Store last 20 delta readings with timestamps
    // Used for both walking detection and speedbreaker detection
    const recentDeltas = []

    // WALKING FILTER
    // Walking creates a rhythmic pattern — regular spikes every 400–800ms (one per step)
    // If we see 4+ spikes with consistent spacing, it's footsteps, not a pothole
    const isWalkingPattern = () => {
      const now = Date.now()
      // Only look at recent spikes above noise level
      const spikes = recentDeltas.filter(
        (d) => now - d.time < 4000 && d.value > 4
      )
      if (spikes.length < 4) return false

      // Calculate time gaps between spikes
      const intervals = []
      for (let i = 1; i < spikes.length; i++) {
        intervals.push(spikes[i].time - spikes[i - 1].time)
      }

      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length

      // Walking rhythm is 400–900ms between steps
      // If all intervals are close to the average, it's rhythmic = walking
      const isRhythmic = intervals.every((i) => Math.abs(i - avg) < 220)
      return isRhythmic && avg > 350 && avg < 900
    }

    // SPEEDBREAKER FILTER
    // A speedbreaker causes gradual sustained motion across MULTIPLE readings
    // A pothole causes ONE sudden isolated spike
    // So if the last 4 readings are ALL elevated, it's a speedbreaker
    const isSpeedbreaker = () => {
      const last4 = recentDeltas.slice(-4)
      if (last4.length < 4) return false
      // All 4 recent readings elevated = gradual sustained bump = speedbreaker
      return last4.every((d) => d.value > 5)
    }

    const handleMotion = (event) => {
      const currentZ = event.accelerationIncludingGravity?.z || 0
      if (lastZ === null) {
        lastZ = currentZ
        return
      }

      const delta = Math.abs(currentZ - lastZ)
      lastZ = currentZ

      // Keep rolling window of last 20 readings
      recentDeltas.push({ value: delta, time: Date.now() })
      if (recentDeltas.length > 20) recentDeltas.shift()

      setMotionValue(delta.toFixed(2))

      const now = Date.now()

      // Only process if spike is significant and cooldown has passed
      if (delta > 8 && now - lastTrigger > 1500) {

        // Check walking pattern first
        if (isWalkingPattern()) {
          setStatus('Walking detected — ignored')
          return
        }

        // Check speedbreaker pattern
        if (isSpeedbreaker()) {
          setStatus('Speedbreaker detected — ignored')
          return
        }

        // It's a real pothole — classify severity by delta magnitude
        // These ranges are calibrated for realistic phone motion values
        lastTrigger = now
        let severity
        if (delta > 22) {
          severity = 26       // Severe — very sharp jolt
        } else if (delta > 14) {
          severity = 19       // Moderate — clear bump
        } else {
          severity = 12       // Minor — small dip
        }

        reportPothole(severity)
      }
    }

    if (detecting) {
      // iOS requires explicit permission for DeviceMotion
      if (
        typeof DeviceMotionEvent !== 'undefined' &&
        typeof DeviceMotionEvent.requestPermission === 'function'
      ) {
        DeviceMotionEvent.requestPermission().then((permission) => {
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleMotion)
            setStatus('Motion detection active')
          }
        })
      } else {
        window.addEventListener('devicemotion', handleMotion)
        setStatus('Motion detection active')
      }
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion)
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
      <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'white' }}>
        RoadScan
      </h2>

      <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1.1rem' }}>
        AI Pothole Detection System
      </p>

      <div
        style={{
          background: 'rgba(255,255,255,0.08)',
          padding: '1.5rem',
          borderRadius: '24px',
          marginBottom: '2rem',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <p style={{ fontSize: '1.1rem', margin: 0, color: 'white', fontWeight: '600' }}>
          {status}
        </p>
        {lastDetection && (
          <p style={{ fontSize: '0.95rem', color: '#cbd5e1', marginTop: '0.8rem' }}>
            Last detected at {lastDetection}
          </p>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '4rem', fontWeight: 'bold', margin: 0, color: '#38bdf8' }}>
          {count}
        </p>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '1rem' }}>
          Potholes Detected
        </p>
        <p style={{ color: '#38bdf8', marginTop: '1rem', fontSize: '1rem' }}>
          Motion Value: {motionValue}
        </p>
      </div>

      <button
        onClick={() => setDetecting(!detecting)}
        style={{
          padding: '1rem 2rem',
          fontSize: '1rem',
          backgroundColor: detecting ? '#ef4444' : '#22c55e',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          cursor: 'pointer',
          width: '100%',
          marginBottom: '1rem',
          fontWeight: '700',
        }}
      >
        {detecting ? 'Stop Scanning' : 'Start Scanning'}
      </button>

      <button
        onClick={() => reportPothole(18)}
        style={{
          padding: '1rem 2rem',
          fontSize: '1rem',
          backgroundColor: clicked ? '#1d4ed8' : '#2563eb',
          transform: clicked ? 'scale(0.96)' : 'scale(1)',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          cursor: 'pointer',
          width: '100%',
          transition: 'all 0.15s ease',
          boxShadow: '0 10px 30px rgba(37,99,235,0.35)',
          fontWeight: '700',
        }}
      >
        Simulate Detection
      </button>
    </div>
  )
}

export default Scanner