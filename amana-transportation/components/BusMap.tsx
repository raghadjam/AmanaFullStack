// components/BusMap.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // ✅ Make sure to import Leaflet CSS
import { BusData } from '@/lib/data';

// Custom Bus Icon
const busIcon = new L.DivIcon({
  className: 'bus-icon',
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" 
      fill="green" width="32" height="32">
      <path d="M4 16v-5c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v5c0 1.1-.9 2-2 2v1c0 .55-.45 1-1 1s-1-.45-1-1v-1H8v1c0 
        .55-.45 1-1 1s-1-.45-1-1v-1c-1.1 0-2-.9-2-2z"/>
    </svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface BusMapProps {
  bus: BusData;
}

export default function BusMap({ bus }: BusMapProps) {
  const { current_location, route } = bus;

  const center: L.LatLngExpression = [
    current_location.lat,
    current_location.lng,
  ];
// Custom Red Pin Icon for stops
const stopIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  shadowSize: [41, 41],
});

  return (
    <div className="w-full h-96 rounded-2xl shadow-md overflow-hidden">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Bus Current Location */}
        <Marker position={center} icon={busIcon}>
          <Popup>
            <div className="text-sm p-1">
              <p className="font-bold text-base border-b mb-1 pb-1">
                {bus.id} - Active
              </p>
              <p>
                <span className="font-medium">Capacity:</span> {bus.capacity}%
              </p>
              <p>
                <span className="font-medium">Next Stop:</span>{' '}
                <span className="text-red-500">{bus.next_stop_name}</span>
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Bus Stops */}
        {route.map((stop) => (
          <Marker 
  key={stop.name} 
  position={[stop.coords.lat, stop.coords.lng]}
  icon={stopIcon}   // ✅ use custom red pin
>
  <Popup>
    <div className="text-sm p-1">
      <h4 className="font-bold text-base border-b mb-1 pb-1">{stop.name}</h4>
      <p><span className="font-medium">Next Arrival:</span> {stop.time}</p>
    </div>
  </Popup>
</Marker>

        ))}
      </MapContainer>
    </div>
  );
}
