
import 'leaflet/dist/leaflet.css'
import dynamic from 'next/dynamic'
import { useEffect, useState, useRef } from 'react'
import L from 'leaflet'

interface MapBoxMapProps {
  height?: string;
  width?: string;
}

// Custom marker icons for better visibility
const userIcon = L.icon({
  iconUrl: 'src/assets/user-location.png', // Add this icon to your public folder
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const doctorIcon = L.icon({
  iconUrl: 'src/assets/doctor-location.png', // Add this icon to your public folder
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {ssr:false}); 
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), {ssr:false});
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), {ssr:false});
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {ssr:false});
const ZoomControl = dynamic(() => import('react-leaflet').then((mod) => mod.ZoomControl), {ssr:false});

export default function Maps({height = '300px', width = '500px'}: MapBoxMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          const lat = location.coords.latitude;
          const lng = location.coords.longitude;
          setPosition([lat, lng]);

          // Center the map on the user's location after it is set
          if (mapRef.current && mapRef.current.setView) {
            mapRef.current.setView([lat, lng], 13);
          }
          // Open the user marker popup after a short delay
          setTimeout(() => {
            if (userMarkerRef.current && userMarkerRef.current.openPopup) {
              userMarkerRef.current.openPopup();
            }
          }, 300);

          (async () => {
            try {
              const response = await fetch('https://google-map-places-new-v2.p.rapidapi.com/v1/places:searchText', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Goog-FieldMask': '*',
                  'x-rapidapi-host': 'google-map-places-new-v2.p.rapidapi.com',
                  'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY
                },
                body: JSON.stringify({
                  textQuery: 'psychologist near me',
                  languageCode: '',
                  regionCode: '',
                  rankPreference: 0,
                  includedType: '',
                  openNow: true,
                  minRating: 0,
                  maxResultCount: 10,
                  priceLevels: [],
                  strictTypeFiltering: false,
                  locationBias: {
                    circle: {
                      center: { latitude: lat, longitude: lng },
                      radius: 10000
                    }
                  },
                  evOptions: {
                    minimumChargingRateKw: 0,
                    connectorTypes: []
                  }
                })
              });
              if (!response.ok) {
                return;
              }
              const data = await response.json();
              // Show all 10 results with valid coordinates
              const mappedPlaces = (data.places || [])
                .filter((place: any) => place.location && place.location.latitude && place.location.longitude)
                .map((place: any) => ({
                  name: place.displayName?.text || place.name,
                  position: [place.location?.latitude, place.location?.longitude],
                  address: place.formattedAddress,
                  rating: place.rating,
                  googleMapsUri: place.googleMapsUri
                }));
              setPlaces(mappedPlaces);
            } catch (err) {
            }
          })();
        },
        () => {
          alert('Unable to access your location. Please allow location access for better results.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }, []);

  if (!position) {
    return <div style={{height, width, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Detecting your location...</div>;
  }
  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height, width }}
      scrollWheelZoom={true}
      ref={mapRef}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'></a>"
      />
      {/* Add zoom control to the right */}
      <ZoomControl position="topright" />
      {/* User marker */}
      <Marker position={position} icon={userIcon} ref={userMarkerRef}>
        <Popup>Your Location</Popup>
      </Marker>
      {/* Psychologist/doctor markers */}
      {places.map((place, idx) => (
        <Marker key={idx} position={place.position} icon={doctorIcon}>
          <Popup>
            <div style={{ minWidth: 240, maxWidth: 320, fontFamily: 'inherit', lineHeight: 1.5, padding: '10px 20px 10px 12px', marginTop: 18 }}>
              <div style={{ fontWeight: 700, fontSize: '1.1em', marginBottom: 4 }}>{place.name}</div>
              {place.address && (
                <div style={{ color: '#555', fontSize: '0.97em', marginBottom: 6 }}>{place.address}</div>
              )}
              {place.rating && (
                <div style={{ color: '#f39c12', fontWeight: 500, marginBottom: 6 }}>
                  <span style={{ fontSize: '1.1em', verticalAlign: 'middle' }}>★</span>
                  <span style={{ color: '#222', marginLeft: 4 }}> {place.rating}</span>
                </div>
              )}
              {place.googleMapsUri && (
                <a
                  href={place.googleMapsUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#1976d2',
                    textDecoration: 'none',
                    fontWeight: 600,
                    display: 'inline-block',
                    marginTop: 4
                  }}
                >
                  Open in Google Maps
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
