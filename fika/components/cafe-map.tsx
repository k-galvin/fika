'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import MapContainer and related components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
});

interface CafeMapProps {
  address: string;
  cafeName: string;
}

interface Coordinates {
  lat: number;
  lon: number;
}

export function CafeMap({ address, cafeName }: CafeMapProps) {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Fix for default marker icon in production
    const setupMarkerIcon = async () => {
      try {
        const L = await import('leaflet');

        delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
          ._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl:
            'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl:
            'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
      } catch {
        // console.error('Error setting up marker icon:', err);
      }
    };

    if (isClient) {
      setupMarkerIcon();
    }
  }, [isClient]);

  useEffect(() => {
    let isCancelled = false;

    const geocodeAddress = async () => {
      if (!address) {
        setError('No address provided');
        setLoading(false);
        return;
      }

      try {
        // Use Nominatim (OpenStreetMap's geocoding service)
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address,
        )}&limit=1`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to geocode address');
        }

        const data = await response.json();

        if (!isCancelled) {
          if (data && data.length > 0) {
            const coords = {
              lat: parseFloat(data[0].lat),
              lon: parseFloat(data[0].lon),
            };
            setCoordinates(coords);
          } else {
            setError('Address not found');
          }
        }
      } catch {
        if (!isCancelled) {
          setError('Failed to load map location');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    geocodeAddress();

    return () => {
      isCancelled = true;
    };
  }, [address]);

  if (loading) {
    return (
      <div className="w-full h-[400px] rounded-lg bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  if (error || !coordinates) {
    return (
      <div className="w-full h-[400px] rounded-lg bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">{error || 'Unable to load map'}</p>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div className="w-full h-[400px] rounded-lg bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border">
      <MapContainer
        center={[coordinates.lat, coordinates.lon]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[coordinates.lat, coordinates.lon]}>
          <Popup>
            <strong>{cafeName}</strong>
            <br />
            {address}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
