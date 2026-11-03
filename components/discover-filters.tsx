"use client";

import { useState } from "react";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "./ui/button";
import { SearchBar } from "./ui/search-bar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { cn } from "@/lib/utils";

type FilterConfig = { title: string; filterKey: string; options: string[] };

export function DiscoverFilters({
  locations,
  parkings,
  seatings,
  vibes,
}: {
  locations: string[];
  parkings: string[];
  seatings: string[];
  vibes: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const filters: FilterConfig[] = [
    { title: "Location", filterKey: "location", options: locations },
    { title: "Parking", filterKey: "parking", options: parkings },
    { title: "Seating", filterKey: "seating", options: seatings },
    { title: "Vibe", filterKey: "vibe", options: vibes },
    { title: "Laptop", filterKey: "is_laptop_friendly", options: ["Yes", "No"] },
    { title: "Wifi", filterKey: "has_wifi", options: ["Yes", "No"] },
    { title: "Outlets", filterKey: "has_outlets", options: ["Yes", "No"] },
  ];

  const activeFilters = filters
    .map((f) => ({ ...f, value: searchParams?.get(f.filterKey) ?? "" }))
    .filter((f) => f.value);

  const clearFilters = () => {
    router.push(pathname);
  };

  // Used by the mobile sheet and chips. `replace` keeps rapid chip taps from
  // flooding the history stack (the app has no visible back button there).
  const setFilter = (filterKey: string, value: string | null) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (value === null || params.get(filterKey) === value) {
      params.delete(filterKey);
    } else {
      params.set(filterKey, value);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const clearAllExceptSearch = () => {
    const search = searchParams?.get("search");
    router.replace(
      search ? `${pathname}?search=${encodeURIComponent(search)}` : pathname,
      { scroll: false }
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:items-center justify-between w-full">
      {/* Search (first on mobile) + mobile filters button */}
      <div className="flex gap-2 items-center w-full md:w-auto shrink-0 md:order-2">
        <div className="flex-1 md:flex-none">
          <SearchBar 
            id="cafe-search" 
            name="cafe-search" 
            placeholder="Search by name..." 
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setIsSheetOpen(true)}
          className="md:hidden h-11 px-4 gap-2 uppercase font-kate font-bold shrink-0 handwritten-border !border-primary/20 active:scale-95"
        >
          <SlidersHorizontal className="size-4" />
          filters
          {activeFilters.length > 0 && (
            <span className="ml-0.5 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-xs leading-5 text-center">
              {activeFilters.length}
            </span>
          )}
        </Button>
      </div>

      {/* Desktop: inline dropdowns */}
      <div className="hidden md:flex flex-row flex-wrap gap-3 items-center md:order-1">
        {filters.map((f) => (
          <FilterDropdown
            key={f.filterKey}
            title={f.title}
            options={f.options}
            filterKey={f.filterKey}
          />
        ))}
        <Button variant="ghost" onClick={clearFilters} className="font-kate font-bold text-lg shrink-0">
          Clear Filters
        </Button>
      </div>

      {/* Mobile: removable chips for whatever is currently applied */}
      {activeFilters.length > 0 && (
        <div
          className="md:hidden flex gap-2 overflow-x-auto -mx-5 px-5 pb-1"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        >
          {activeFilters.map((f) => (
            <button
              key={f.filterKey}
              type="button"
              onClick={() => setFilter(f.filterKey, null)}
              className="shrink-0 flex items-center gap-1.5 h-9 pl-3 pr-2 rounded-full bg-primary text-primary-foreground font-kate font-bold text-sm active:scale-95 transition-transform"
            >
              <span className="opacity-70 uppercase tracking-wide text-xs">{f.title}</span>
              {f.value}
              <X className="size-4 opacity-80" aria-label={`Remove ${f.title} filter`} />
            </button>
          ))}
        </div>
      )}

      {/* Mobile: filters bottom sheet */}
      <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <DialogContent className="font-kate gap-6">
          <DialogHeader className="text-left">
            <DialogTitle className="text-3xl font-bold text-primary tracking-tighter">
              Filters
            </DialogTitle>
            <DialogDescription className="italic text-primary/60">
              Narrow it down to the perfect spot.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5">
            {filters.map((f) => {
              const selected = searchParams?.get(f.filterKey) ?? "";
              return (
                <fieldset key={f.filterKey} className="flex flex-col gap-2">
                  <legend className="mb-2 uppercase tracking-widest text-xs font-bold text-primary/60">
                    {f.title}
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {f.options.map((option) => {
                      const isActive = selected === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={isActive}
                          onClick={() => setFilter(f.filterKey, option)}
                          className={cn(
                            "h-10 px-4 rounded-full border font-bold text-base transition-all active:scale-95",
                            isActive
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-secondary/20 text-primary border-primary/15"
                          )}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}
          </div>

          <DialogFooter className="flex-row gap-3 sticky bottom-0 -mx-6 -mb-[calc(1.5rem+env(safe-area-inset-bottom))] px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-background/95 backdrop-blur border-t border-primary/10">
            <Button
              variant="ghost"
              onClick={clearAllExceptSearch}
              className="flex-1 font-bold text-lg"
            >
              clear all
            </Button>
            <Button
              onClick={() => setIsSheetOpen(false)}
              className="flex-1 font-bold text-lg handwritten-border"
            >
              show cafes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
