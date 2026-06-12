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
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
      <div 
        className="flex flex-row flex-nowrap md:flex-wrap overflow-x-auto md:overflow-x-visible gap-3 items-center w-full md:w-auto pb-3 md:pb-0 scroll-smooth"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
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
          title="Laptop"
          options={["Yes", "No"]}
          filterKey="is_laptop_friendly"
        />
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
        <Button variant="ghost" onClick={clearFilters} className="font-kate font-bold text-lg shrink-0">
          Clear Filters
        </Button>
      </div>
      <div className="w-full md:w-auto shrink-0">
        <SearchBar 
          id="cafe-search" 
          name="cafe-search" 
          placeholder="Search by name..." 
        />
      </div>
    </div>
  );
}
