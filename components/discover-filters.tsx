"use client";

import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { SearchBar } from "./ui/search-bar";

export function DiscoverFilters({
  cities,
  parkings,
  seatings,
  vibes,
}: {
  cities: string[];
  parkings: string[];
  seatings: string[];
  vibes: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  const clearFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="flex flex-wrap gap-4 items-center">
        <FilterDropdown title="City" options={cities} filterKey="city" />
        <FilterDropdown
          title="Parking"
          options={parkings}
          filterKey="parking"
        />
        <FilterDropdown
          title="Seating"
          options={seatings}
          filterKey="seating"
        />
        <FilterDropdown title="Vibe" options={vibes} filterKey="vibe" />
        <FilterDropdown
          title="Wifi"
          options={["Yes", "No"]}
          filterKey="has_wifi"
        />
        <FilterDropdown
          title="Outlets"
          options={["Yes", "No"]}
          filterKey="has_outlets"
        />
        <Button variant="ghost" onClick={clearFilters} className="font-kate font-bold text-lg">
          Clear Filters
        </Button>
      </div>
      <SearchBar placeholder="Search by name..." />
    </div>
  );
}
