// components/map-content.tsx
"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface MapContentProps {
  coordinates: { lat: number; lon: number };
  cafeName: string;
  address: string;
}

export function MapContent({ coordinates, cafeName, address }: MapContentProps) {
  // Create a custom hand-drawn coffee cup icon
  const coffeeIcon = new L.Icon({
    iconUrl: '/hotMatchaLatte.png',
    iconRetinaUrl: '/hotMatchaLatte.png',
    iconSize: [50, 50],
    iconAnchor: [25, 50],
    popupAnchor: [0, -50],
    className: 'filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] brightness-110'
  });

  return (
    <div className="h-full w-full relative group">
      <MapContainer
        center={[coordinates.lat, coordinates.lon]}
        zoom={15}
        style={{ height: '100%', width: '100%', filter: 'sepia(0.1) saturate(1.1) contrast(0.9) brightness(1.02)' }}
        scrollWheelZoom={false}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[coordinates.lat, coordinates.lon]} icon={coffeeIcon}>
          <Popup className="font-kate">
            <strong className="text-primary text-lg">{cafeName}</strong>
            <br />
            <span className="text-primary/60">{address}</span>
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Overlay to give the map a slight paper/warm tint */}
      <div className="absolute inset-0 bg-primary/5 pointer-events-none z-10 mix-blend-multiply opacity-20" />
    </div>
  );
}
