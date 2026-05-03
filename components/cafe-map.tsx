"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MapContent = dynamic(
  () => import("./map-content").then((mod) => mod.MapContent),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] rounded-xl flex items-center justify-center">
        <p className="text-card-foreground">Loading map content...</p>
      </div>
    ),
  }
);

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

  useEffect(() => {
    let isCancelled = false;

    const geocodeAddress = async () => {
      if (!address) {
        setError("No address provided");
        setLoading(false);
        return;
      }

      try {
        // Use Nominatim (OpenStreetMap's geocoding service)
        let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}&limit=1`;

        let response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to geocode address");
        }

        let data = await response.json();

        // If specific address fails, try a broader search (just the name and city if available)
        if ((!data || data.length === 0) && cafeName) {
          url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            `${cafeName}, ${address.split(',').pop()}`
          )}&limit=1`;
          response = await fetch(url);
          if (response.ok) {
            data = await response.json();
          }
        }

        if (!isCancelled) {
          if (data && data.length > 0) {
            const coords = {
              lat: parseFloat(data[0].lat),
              lon: parseFloat(data[0].lon),
            };
            setCoordinates(coords);
          } else {
            setError("Address not found on map");
          }
        }
      } catch {
        if (!isCancelled) {
          setError("Unable to load map location");
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
  }, [address, cafeName]);

  if (loading) {
    return (
      <div className="w-full h-[300px] rounded-xl flex items-center justify-center">
        <p className="text-card-foreground">Loading map...</p>
      </div>
    );
  }

  if (error || !coordinates) {
    return (
      <div className="w-full h-[300px] rounded-xl flex flex-col items-center justify-center gap-4 text-center p-6">
        <p className="text-primary/60 font-kate italic">{error || "Unable to load map"}</p>
        <a 
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cafeName} ${address}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold font-kate text-primary border-b border-primary/20 hover:border-primary transition-all"
        >
          View on Google Maps
        </a>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] rounded-lg overflow-hidden z-10">
      <MapContent
        coordinates={coordinates}
        cafeName={cafeName}
        address={address}
      />
    </div>
  );
}
