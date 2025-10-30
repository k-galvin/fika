"use client";

import { useEffect, useState } from "react";
import { getSuggestedCafes, approveSuggestion, denySuggestion } from "@/app/actions";
import { SuggestedCafe } from "@/lib/types";

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<SuggestedCafe[]>([]);

  useEffect(() => {
    async function fetchSuggestions() {
      const suggestedCafes = await getSuggestedCafes();
      if (suggestedCafes) {
        setSuggestions(suggestedCafes);
      }
    }

    fetchSuggestions();
  }, []);

  const handleApprove = async (id: number) => {
    await approveSuggestion(id);
    setSuggestions(suggestions.filter((s) => s.id !== id));
  };

  const handleDeny = async (id: number) => {
    await denySuggestion(id);
    setSuggestions(suggestions.filter((s) => s.id !== id));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Suggested Cafes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="border p-4 rounded-lg flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold">{suggestion.name}</h2>
              <p className="text-sm text-gray-600">{suggestion.address}</p>
              <p className="mt-2">{suggestion.description}</p>
              <div className="mt-4 flex flex-col gap-1 text-sm">
                <p data-testid={`city-${suggestion.id}`}><strong>City:</strong> {suggestion.city}</p>
                <p data-testid={`parking-${suggestion.id}`}><strong>Parking:</strong> {suggestion.parking}</p>
                <p data-testid={`seating-${suggestion.id}`}><strong>Seating:</strong> {suggestion.seating}</p>
                <p data-testid={`vibe-${suggestion.id}`}><strong>Vibe:</strong> {suggestion.vibe}</p>
                <p data-testid={`pricing-${suggestion.id}`}><strong>Pricing:</strong> {suggestion.pricing}</p>
                <p data-testid={`busyness-${suggestion.id}`}><strong>Busyness:</strong> {suggestion.busyness}</p>
                <p data-testid={`laptop-friendly-${suggestion.id}`}><strong>Laptop Friendly:</strong> {suggestion.is_laptop_friendly ? 'Yes' : 'No'}</p>
                <p data-testid={`wifi-${suggestion.id}`}><strong>Wifi:</strong> {suggestion.has_wifi ? 'Yes' : 'No'}</p>
                <p data-testid={`outlets-${suggestion.id}`}><strong>Outlets:</strong> {suggestion.has_outlets ? 'Yes' : 'No'}</p>
                <p data-testid={`wine-bar-${suggestion.id}`}><strong>Wine Bar:</strong> {suggestion.wine_bar ? 'Yes' : 'No'}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleApprove(suggestion.id)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg w-full"
              >
                Approve
              </button>
              <button
                onClick={() => handleDeny(suggestion.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg w-full"
              >
                Deny
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
