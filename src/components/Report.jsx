import { useState, useEffect } from 'react'

import {
  db,
  collection,
  onSnapshot,
} from '../firebase'

function Report() {
  const [potholes, setPotholes] =
    useState([])

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'potholes'),
      (snapshot) => {
        setPotholes(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        )
      }
    )

    return () => unsubscribe()
  }, [])

  const severe =
    potholes.filter(
      (p) => p.severity > 20
    ).length

  const moderate =
    potholes.filter(
      (p) =>
        p.severity > 15 &&
        p.severity <= 20
    ).length

  const minor =
    potholes.filter(
      (p) => p.severity <= 15
    ).length

  let urgency = 'LOW PRIORITY'
  let urgencyColor = '#22c55e'

  if (severe >= 5) {
    urgency = 'HIGH PRIORITY'
    urgencyColor = '#ef4444'
  } else if (moderate >= 3) {
    urgency = 'MEDIUM PRIORITY'
    urgencyColor = '#f59e0b'
  }

  return (
    <div
      style={{
        padding: '1rem',
      }}
    >
      <h1
        style={{
          color: 'white',
          fontSize: '2.4rem',
          marginBottom: '0.5rem',
        }}
      >
        RoadScan AI Analysis
      </h1>

      <p
        style={{
          color: '#94a3b8',
          marginBottom: '2rem',
        }}
      >
        Real-time municipal road
        intelligence dashboard
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(220px, 1fr))',

          gap: '1rem',

          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            background:
              'linear-gradient(135deg,#0f172a,#1e3a8a)',

            padding: '1.5rem',

            borderRadius: '24px',

            color: 'white',
          }}
        >
          <h2
            style={{
              fontSize: '3rem',
              margin: 0,
            }}
          >
            {potholes.length}
          </h2>

          <p
            style={{
              marginTop: '0.5rem',
              opacity: 0.8,
            }}
          >
            Total Detections
          </p>
        </div>

        <div
          style={{
            background:
              'linear-gradient(135deg,#7f1d1d,#ef4444)',

            padding: '1.5rem',

            borderRadius: '24px',

            color: 'white',
          }}
        >
          <h2
            style={{
              fontSize: '3rem',
              margin: 0,
            }}
          >
            {severe}
          </h2>

          <p
            style={{
              marginTop: '0.5rem',
              opacity: 0.8,
            }}
          >
            🚨 Severe Potholes
          </p>
        </div>

        <div
          style={{
            background:
              'linear-gradient(135deg,#78350f,#f59e0b)',

            padding: '1.5rem',

            borderRadius: '24px',

            color: 'white',
          }}
        >
          <h2
            style={{
              fontSize: '3rem',
              margin: 0,
            }}
          >
            {moderate}
          </h2>

          <p
            style={{
              marginTop: '0.5rem',
              opacity: 0.8,
            }}
          >
            ⚠ Moderate
          </p>
        </div>

        <div
          style={{
            background:
              'linear-gradient(135deg,#064e3b,#22c55e)',

            padding: '1.5rem',

            borderRadius: '24px',

            color: 'white',
          }}
        >
          <h2
            style={{
              fontSize: '3rem',
              margin: 0,
            }}
          >
            {minor}
          </h2>

          <p
            style={{
              marginTop: '0.5rem',
              opacity: 0.8,
            }}
          >
            ✅ Minor
          </p>
        </div>
      </div>

      <div
        style={{
          background:
            'linear-gradient(135deg, rgba(239,68,68,0.18), rgba(15,23,42,0.9))',

          border:
            '1px solid rgba(239,68,68,0.3)',

          padding: '2rem',

          borderRadius: '28px',

          marginBottom: '2rem',
        }}
      >
        <p
          style={{
            color: '#94a3b8',
            marginBottom: '0.5rem',
          }}
        >
          CURRENT MUNICIPAL STATUS
        </p>

        <h1
          style={{
            color: urgencyColor,
            fontSize: '3rem',
            margin: 0,
          }}
        >
          {urgency}
        </h1>

        <p
          style={{
            color: '#cbd5e1',
            marginTop: '1rem',
            lineHeight: '1.8',
          }}
        >
          Real-time anomaly detection
          indicates infrastructure
          deterioration across
          monitored road networks.
          Immediate attention is
          recommended for
          high-severity zones.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(300px, 1fr))',

          gap: '1.5rem',

          marginBottom: '2rem',
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
              color: 'white',
              marginBottom: '1.5rem',
            }}
          >
            🛣 Road Analysis
          </h2>

          <div
            style={{
              color: '#cbd5e1',
              lineHeight: '2',
            }}
          >
            <p>
              • Multiple road surface
              anomalies detected
            </p>

            <p>
              • Severe potholes pose
              vehicle safety risks
            </p>

            <p>
              • Traffic efficiency may
              decrease in affected
              zones
            </p>

            <p>
              • Road wear patterns
              indicate infrastructure
              degradation
            </p>
          </div>
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
              color: 'white',
              marginBottom: '1.5rem',
            }}
          >
            🧠 AI Recommendations
          </h2>

          <div
            style={{
              color: '#cbd5e1',
              lineHeight: '2',
            }}
          >
            <p>
              ✅ Prioritize severe
              pothole repairs
            </p>

            <p>
              ✅ Dispatch maintenance
              teams to hotspot zones
            </p>

            <p>
              ✅ Continue live road
              monitoring
            </p>

            <p>
              ✅ Schedule preventive
              maintenance inspections
            </p>
          </div>
        </div>
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
            color: 'white',
            marginBottom: '1.5rem',
          }}
        >
          🏛 Municipal Action Plan
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',

            gap: '1rem',
          }}
        >
          {[
            'Identify Risk Zones',
            'Allocate Repair Teams',
            'Schedule Maintenance',
            'Monitor Road Health',
          ].map((step, index) => (
            <div
              key={index}
              style={{
                background:
                  'rgba(255,255,255,0.04)',

                padding: '1.5rem',

                borderRadius: '20px',

                textAlign: 'center',

                color: 'white',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',

                  background:
                    'linear-gradient(135deg,#2563eb,#7c3aed)',

                  display: 'flex',

                  alignItems: 'center',

                  justifyContent:
                    'center',

                  margin:
                    '0 auto 1rem auto',

                  fontWeight: 'bold',

                  fontSize: '1.2rem',
                }}
              >
                {index + 1}
              </div>

              <p
                style={{
                  margin: 0,
                  lineHeight: '1.6',
                }}
              >
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Report