"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MapContent = dynamic(
  () => import("./map-content").then((mod) => mod.MapContent),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] rounded-xl border bg-card text-card-foreground shadow flex items-center justify-center">
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
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}&limit=1`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to geocode address");
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
            setError("Address not found");
          }
        }
      } catch {
        if (!isCancelled) {
          setError("Failed to load map location");
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
      <div className="w-full h-[400px] rounded-xl border bg-card text-card-foreground shadow flex items-center justify-center">
        <p className="text-card-foreground">Loading map...</p>
      </div>
    );
  }

  if (error || !coordinates) {
    return (
      <div className="w-full h-[400px] rounded-xl border bg-card text-card-foreground shadow flex items-center justify-center">
        <p className="text-card-foreground">{error || "Unable to load map"}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border z-10">
      <MapContent
        coordinates={coordinates}
        cafeName={cafeName}
        address={address}
      />
    </div>
  );
}
