import { useEffect, useState } from 'react'

import {
  MapContainer,
  TileLayer,
  Popup,
  Circle,
  Marker,
} from 'react-leaflet'

import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

import {
  db,
  collection,
  onSnapshot,
} from '../firebase'

function Map() {
  const [potholes, setPotholes] =
    useState([])

  const [userLocation, setUserLocation] =
    useState(null)

  const [warning, setWarning] =
    useState(null)

  const [heading, setHeading] =
    useState(0)

  const [loading, setLoading] =
    useState(true)

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

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat:
            position.coords.latitude,

          lng:
            position.coords.longitude,
        })

        setLoading(false)
      },

      (error) => {
        console.log(error)
        setLoading(false)
      },

      {
        enableHighAccuracy: true,
      }
    )

    const watchId =
      navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            lat:
              position.coords.latitude,

            lng:
              position.coords.longitude,
          }

          setUserLocation(location)

          potholes.forEach((pothole) => {
            const distance =
              getDistance(
                location.lat,
                location.lng,
                pothole.lat,
                pothole.lng
              )

            if (distance < 60) {
              let severity =
                'Minor'

              if (
                pothole.severity > 20
              ) {
                severity = 'Severe'
              } else if (
                pothole.severity > 15
              ) {
                severity = 'Moderate'
              }

              setWarning(
                `${severity} pothole ahead`
              )

              setTimeout(() => {
                setWarning(null)
              }, 4000)
            }
          })
        },

        (error) => {
          console.log(error)
        },

        {
          enableHighAccuracy: true,
          maximumAge: 500,
          timeout: 2000,
        }
      )

    const handleOrientation = (
      event
    ) => {
      if (event.alpha != null) {
        setHeading(event.alpha)
      }
    }

    window.addEventListener(
      'deviceorientation',
      handleOrientation
    )

    return () => {
      navigator.geolocation.clearWatch(
        watchId)

      window.removeEventListener(
        'deviceorientation',
        handleOrientation
      )
    }
  }, [potholes])

  const getDistance = (
    lat1,
    lon1,
    lat2,
    lon2
  ) => {
    const R = 6371e3

    const φ1 =
      (lat1 * Math.PI) / 180

    const φ2 =
      (lat2 * Math.PI) / 180

    const Δφ =
      ((lat2 - lat1) *
        Math.PI) /
      180

    const Δλ =
      ((lon2 - lon1) *
        Math.PI) /
      180

    const a =
      Math.sin(Δφ / 2) *
        Math.sin(Δφ / 2) +
      Math.cos(φ1) *
        Math.cos(φ2) *
        Math.sin(Δλ / 2) *
        Math.sin(Δλ / 2)

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      )

    return R * c
  }

  const getCircleStyle = (
    severity
  ) => {
    if (severity > 20) {
      return {
        color: '#ef4444',
        fillColor: '#ef4444',
      }
    }

    if (severity > 15) {
      return {
        color: '#f59e0b',
        fillColor: '#f59e0b',
      }
    }

    return {
      color: '#eab308',
      fillColor: '#eab308',
    }
  }

  const userArrowIcon = L.divIcon({
    className: '',

    html: `
      <div style="
        width: 34px;
        height: 34px;
        transform: rotate(${heading}deg);
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="#3b82f6"
          xmlns="http://www.w3.org/2000/svg"
          style="
            filter: drop-shadow(0 0 6px rgba(59,130,246,0.8));
          "
        >
          <path d="M12 2L3 21L12 16L21 21L12 2Z"/>
        </svg>
      </div>
    `,

    iconSize: [34, 34],
    iconAnchor: [17, 17],
  })

  if (loading || !userLocation) {
    return (
      <div
        style={{
          height: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '1.2rem',
        }}
      >
        Loading map...
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      {warning && (
        <div
          style={{
            position: 'absolute',

            top: '20px',

            left: '50%',

            transform:
              'translateX(-50%)',

            zIndex: 9999,

            background:
              'linear-gradient(135deg,#dc2626,#ef4444)',

            color: 'white',

            padding:
              '1rem 1.5rem',

            borderRadius: '18px',

            fontWeight: '700',
          }}
        >
          ⚠ {warning}
        </div>
      )}

      <MapContainer
        center={[
          userLocation.lat,
          userLocation.lng,
        ]}
        zoom={18}
        style={{
          height: '80vh',
          width: '100%',
          borderRadius: '24px',
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

        <Marker
          position={[
            userLocation.lat,
            userLocation.lng,
          ]}
          icon={userArrowIcon}
        >
          <Popup>
            Your Current Location
          </Popup>
        </Marker>

        {potholes.map((pothole) => {
          const style =
            getCircleStyle(
              pothole.severity
            )

          return (
            <Circle
              key={pothole.id}
              center={[
                pothole.lat,
                pothole.lng,
              ]}
              radius={4}
              pathOptions={{
                color: style.color,
                fillColor:
                  style.fillColor,
                fillOpacity: 1,
              }}
            >
              <Popup>
                <div>
                  <h3>
                    Road Hazard
                  </h3>

                  <p>
                    Severity:{' '}
                    {pothole.severity}
                  </p>
                </div>
              </Popup>
            </Circle>
          )
        })}
      </MapContainer>
    </div>
  )
}

export default Map