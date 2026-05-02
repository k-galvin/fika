"use client";

import { useEffect, useState } from "react";
import {
  getCafeUpdates,
  approveUpdateAndDenyOthers,
  denyUpdates,
} from "@/app/actions";

// Raw update structure from getCafeUpdates
type RawUpdate = {
  id: number;
  cafe_id: number;
  cafe_name: string;
  field: string;
  new_value: string;
  user_id: string;
  created_at: string;
};

// Structure for a single suggestion value with its votes
type Suggestion = {
  value: string;
  count: number;
  ids: number[]; // Keep track of original update IDs
};

// Final grouped structure for display
type GroupedUpdate = {
  cafe_name: string;
  field: string;
  suggestions: Suggestion[];
  totalSuggestions: number;
  allIds: number[];
};

export default function UpdatesPage() {
  const [groupedUpdates, setGroupedUpdates] = useState<GroupedUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchAndGroupUpdates() {
    setIsLoading(true);
    const rawUpdates = (await getCafeUpdates()) as RawUpdate[];

    if (!rawUpdates) {
      setGroupedUpdates([]);
      setIsLoading(false);
      return;
    }

    // Grouping logic
    const groups: Record<string, GroupedUpdate> = {};

    rawUpdates.forEach((update) => {
      const key = `${update.cafe_name}___${update.field}`;
      if (!groups[key]) {
        groups[key] = {
          cafe_name: update.cafe_name,
          field: update.field,
          suggestions: [],
          totalSuggestions: 0,
          allIds: [],
        };
      }

      // Add the raw ID to the main list
      groups[key].allIds.push(update.id);
      groups[key].totalSuggestions += 1;

      // Find or create a suggestion entry for this value
      const suggestion = groups[key].suggestions.find(
        (s) => s.value === update.new_value
      );

      if (suggestion) {
        suggestion.count += 1;
        suggestion.ids.push(update.id);
      } else {
        groups[key].suggestions.push({
          value: update.new_value,
          count: 1,
          ids: [update.id],
        });
      }
    });

    // Sort suggestions within each group by count
    Object.values(groups).forEach((group) => {
      group.suggestions.sort((a, b) => b.count - a.count);
    });

    setGroupedUpdates(Object.values(groups));
    setIsLoading(false);
  }

  useEffect(() => {
    fetchAndGroupUpdates();
  }, []);

  const handleApproveMostVoted = async (group: GroupedUpdate) => {
    if (group.suggestions.length === 0) return;

    const mostVoted = group.suggestions[0];
    const winningId = mostVoted.ids[0]; // Pick one ID to represent the winning value
    const otherIds = group.allIds.filter((id) => id !== winningId);

    await approveUpdateAndDenyOthers(winningId, otherIds);
    fetchAndGroupUpdates(); // Refetch to update the UI
  };

  const handleDenyAll = async (group: GroupedUpdate) => {
    await denyUpdates(group.allIds);
    fetchAndGroupUpdates(); // Refetch to update the UI
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Suggested Cafe Updates</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Suggested Cafe Updates</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupedUpdates.map((group, index) => (
          <div
            key={index}
            data-testid={`group-${group.cafe_name}-${group.field}`}
            className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                <span role="img" aria-label="cafe">
                  ☕
                </span>{" "}
                {group.cafe_name}
              </h2>
              <p data-testid="field" className="text-md text-gray-500 mb-4">
                <strong>Field:</strong> {group.field}
              </p>

              <div className="space-y-3">
                {group.suggestions.map((suggestion) => (
                  <div
                    key={suggestion.value}
                    className={`p-3 rounded-md ${
                      suggestion === group.suggestions[0]
                        ? "bg-green-50 border-l-4 border-green-400"
                        : "bg-gray-50"
                    }`}
                  >
                    <p className="font-semibold text-lg text-gray-700">
                      {suggestion.value}{" "}
                      {suggestion === group.suggestions[0] && (
                        <span className="text-green-600 text-sm ml-2">
                          (most popular)
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      Suggested by {suggestion.count} user
                      {suggestion.count > 1 ? "s" : ""}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-500 mt-4">
                Total suggestions: {group.totalSuggestions}
              </p>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => handleApproveMostVoted(group)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg w-full hover:bg-green-600 transition-colors"
              >
                Approve Most Voted
              </button>
              <button
                onClick={() => handleDenyAll(group)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg w-full hover:bg-red-600 transition-colors"
              >
                Deny All
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
