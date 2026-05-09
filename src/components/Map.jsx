import { useEffect, useState } from 'react'

import {
  MapContainer,
  TileLayer,
  Popup,
  Circle,
  Marker,
  useMap,
} from 'react-leaflet'

import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

import {
  db,
  collection,
  onSnapshot,
} from '../firebase'

function RecenterMap({
  userLocation,
}) {
  const map = useMap()

  useEffect(() => {
    if (userLocation) {
      map.flyTo(
        [
          userLocation.lat,
          userLocation.lng,
        ],
        18,
        {
          duration: 1.2,
        }
      )
    }
  }, [userLocation])

  return null
}

function Map() {
  const [potholes, setPotholes] =
    useState([])

  const [userLocation, setUserLocation] =
    useState(null)

  const [warning, setWarning] =
    useState(null)

  const [heading, setHeading] =
    useState(0)

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
          maximumAge: 1000,
          timeout: 3000,
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
        watchId
      )

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
        width: 0;
        height: 0;
        border-left: 12px solid transparent;
        border-right: 12px solid transparent;
        border-bottom: 24px solid #3b82f6;
        transform: rotate(${heading}deg);
        transform-origin: center;
        filter: drop-shadow(0 0 6px rgba(59,130,246,0.7));
      "></div>
    `,

    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })

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
        center={[12.9716, 77.5946]}
        zoom={13}
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

        {userLocation && (
          <>
            <RecenterMap
              userLocation={
                userLocation
              }
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
          </>
        )}

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
              radius={5}
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