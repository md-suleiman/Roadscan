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

  return (
    <div
      style={{
        padding: '2rem',
        color: 'white',
      }}
    >
      <h2
        style={{
          fontSize: '2rem',
          marginBottom: '1.5rem',
        }}
      >
        Pothole Reports
      </h2>

      {reports.map((report) => {
        let severity = 'Minor'

        if (report.severity > 20) {
          severity = 'Severe'
        } else if (
          report.severity > 15
        ) {
          severity = 'Moderate'
        }

        return (
          <div
            key={report.id}
            style={{
              background:
                'rgba(255,255,255,0.08)',
              padding: '1rem',
              borderRadius: '18px',
              marginBottom: '1rem',
              border:
                '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <h3>
              {severity} Pothole
            </h3>

            <p>
              Severity Score:{' '}
              {report.severity}
            </p>

            <p>
              Reports:{' '}
              {report.reportCount || 1}
            </p>

            <p>
              Latitude: {report.lat}
            </p>

            <p>
              Longitude: {report.lng}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export default Reports