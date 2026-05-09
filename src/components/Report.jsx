import { useEffect, useState } from 'react'

import {
  db,
  collection,
  onSnapshot,
} from '../firebase'

const getDistance = (
  lat1,
  lon1,
  lat2,
  lon2
) => {
  const R = 6371e3

  const toRad = (deg) =>
    (deg * Math.PI) / 180

  const dLat = toRad(
    lat2 - lat1
  )

  const dLon = toRad(
    lon2 - lon1
  )

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )

  return R * c
}

const mergeNearbyPotholes = (
  potholes
) => {
  const merged = []

  potholes.forEach((pothole) => {
    const existing = merged.find(
      (m) =>
        getDistance(
          pothole.lat,
          pothole.lng,
          m.lat,
          m.lng
        ) < 15
    )

    if (existing) {
      existing.reportCount +=
        pothole.reportCount || 1

      existing.severity =
        Math.max(
          existing.severity,
          pothole.severity
        )
    } else {
      merged.push({
        ...pothole,

        reportCount:
          pothole.reportCount || 1,
      })
    }
  })

  return merged
}

function Reports() {
  const [reports, setReports] =
    useState([])

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'potholes'),
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        )

        setReports(
          mergeNearbyPotholes(data)
        )
      }
    )

    return () => unsubscribe()
  }, [])

  const getSeverityData = (
    severity
  ) => {
    if (severity > 20) {
      return {
        label: 'Severe',
        color: '#ef4444',
        glow:
          '0 0 20px rgba(239,68,68,0.35)',
        emoji: '🚨',
      }
    }

    if (severity > 15) {
      return {
        label: 'Moderate',
        color: '#f59e0b',
        glow:
          '0 0 20px rgba(245,158,11,0.35)',
        emoji: '⚠️',
      }
    }

    return {
      label: 'Minor',
      color: '#eab308',
      glow:
        '0 0 20px rgba(234,179,8,0.35)',
      emoji: '🟡',
    }
  }

  return (
    <div
      style={{
        padding: '2rem',
        minHeight: '100vh',
        color: 'white',
      }}
    >
      <div
        style={{
          marginBottom: '2rem',
        }}
      >
        <h1
          style={{
            fontSize: '2.7rem',
            marginBottom: '0.5rem',
            fontWeight: '800',
          }}
        >
          Road Hazard Reports
        </h1>

        <p
          style={{
            color: '#94a3b8',
            fontSize: '1.1rem',
          }}
        >
          Live crowdsourced road damage
          monitoring
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '1.2rem',
        }}
      >
        {reports.map((report) => {
          const severityData =
            getSeverityData(
              report.severity
            )

          return (
            <div
              key={report.id}
              style={{
                background:
                  'rgba(255,255,255,0.08)',

                backdropFilter:
                  'blur(14px)',

                border:
                  `1px solid ${severityData.color}`,

                borderLeft:
                  `8px solid ${severityData.color}`,

                borderRadius: '24px',

                padding: '1.4rem',

                boxShadow:
                  severityData.glow,

                transition:
                  'all 0.25s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '1.5rem',
                      color:
                        severityData.color,
                    }}
                  >
                    {severityData.emoji}{' '}
                    {
                      severityData.label
                    }{' '}
                    Pothole
                  </h2>
                </div>

                <div
                  style={{
                    background:
                      severityData.color,
                    padding:
                      '0.5rem 1rem',
                    borderRadius:
                      '999px',
                    fontWeight: '700',
                    color: 'white',
                    fontSize: '0.9rem',
                  }}
                >
                  {report.reportCount ||
                    1}{' '}
                  Reports
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit,minmax(180px,1fr))',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    background:
                      'rgba(255,255,255,0.05)',
                    padding: '1rem',
                    borderRadius:
                      '16px',
                  }}
                >
                  <p
                    style={{
                      color: '#94a3b8',
                      marginBottom:
                        '0.4rem',
                    }}
                  >
                    Severity Score
                  </p>

                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.5rem',
                    }}
                  >
                    {report.severity}
                  </h3>
                </div>

                <div
                  style={{
                    background:
                      'rgba(255,255,255,0.05)',
                    padding: '1rem',
                    borderRadius:
                      '16px',
                  }}
                >
                  <p
                    style={{
                      color: '#94a3b8',
                      marginBottom:
                        '0.4rem',
                    }}
                  >
                    Latitude
                  </p>

                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1rem',
                    }}
                  >
                    {report.lat.toFixed(
                      5
                    )}
                  </h3>
                </div>

                <div
                  style={{
                    background:
                      'rgba(255,255,255,0.05)',
                    padding: '1rem',
                    borderRadius:
                      '16px',
                  }}
                >
                  <p
                    style={{
                      color: '#94a3b8',
                      marginBottom:
                        '0.4rem',
                    }}
                  >
                    Longitude
                  </p>

                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1rem',
                    }}
                  >
                    {report.lng.toFixed(
                      5
                    )}
                  </h3>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Reports