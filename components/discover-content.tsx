"use client";

import { CafeQuickView } from "@/components/cafe-quick-view";
import { DiscoverFilters } from "@/components/discover-filters";
import { CafeCardSkeleton } from "@/components/cafe-card-skeleton";
import { Button } from "@/components/ui/button";

import { Constants } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/client";
import { CoffeeShop } from "@/lib/types";
import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";

import { User } from "@supabase/supabase-js";
import { Footer } from "@/components/footer";

const PAGE_SIZE = 20;

// Custom hook to get the previous value of a prop or state
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export function DiscoverContent({
  initialShops,
  user,
}: {
  initialShops: CoffeeShop[];
  user: User | null;
}) {
  const [shops, setShops] = useState<CoffeeShop[]>(initialShops);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialShops.length === PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const paramsString = searchParams.toString();
  const prevParamsString = usePrevious(paramsString);

  useEffect(() => {
    if (paramsString !== prevParamsString) {
      setShops(initialShops);
      setPage(1);
      setHasMore(initialShops.length === PAGE_SIZE);
    } else {
      // If the filters haven't changed, we're just updating the existing shops
      // with new data (e.g. after a save or visit)
      setShops((currentShops) => {
        const newShopsMap = new Map(initialShops.map((s) => [s.id, s]));
        return currentShops.map((shop) => {
          const updatedShopData = newShopsMap.get(shop.id);
          if (updatedShopData) {
            return {
              ...shop,
              isInitiallySaved: updatedShopData.isInitiallySaved,
              isInitiallyVisited: updatedShopData.isInitiallyVisited,
            };
          }
          return shop;
        });
      });
    }
  }, [initialShops, paramsString, prevParamsString]);

  const fetchMoreShops = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase.from("coffee_shops").select(
      `
      *,
      shop_photos (
        id,
        photo_url,
        is_primary,
        is_approved
      )
    `
    );

    // Apply filters
    if (searchParams.get("city"))
      query = query.eq("city", searchParams.get("city") as string);
    if (searchParams.get("parking"))
      query = query.eq("parking", searchParams.get("parking") as string);
    if (searchParams.get("seating"))
      query = query.eq("seating", searchParams.get("seating") as string);
    if (searchParams.get("vibe"))
      query = query.eq("vibe", searchParams.get("vibe") as string);
    if (searchParams.get("has_wifi"))
      query = query.eq("has_wifi", searchParams.get("has_wifi") === "Yes");
    if (searchParams.get("has_outlets"))
      query = query.eq(
        "has_outlets",
        searchParams.get("has_outlets") === "Yes"
      );
    if (searchParams.get("search"))
      query = query.ilike(
        "name",
        `%${(searchParams.get("search") as string).replace(/%/g, "\\%")}%`
      );

    query = query.order("name", { ascending: true });

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data: newShopsData } = await query;

    let savedCafeIds: Set<number> = new Set();
    let visitedCafeIds: Set<number> = new Set();

    if (user) {
      const { data: savedCafes } = await supabase
        .from("user_saved_cafes")
        .select("coffee_shop_id")
        .eq("profile_id", user.id);
      if (savedCafes) {
        savedCafeIds = new Set(savedCafes.map((cafe) => cafe.coffee_shop_id));
      }

      const { data: visitedCafes } = await supabase
        .from("user_visits")
        .select("coffee_shop_id")
        .eq("profile_id", user.id);
      if (visitedCafes) {
        visitedCafeIds = new Set(
          visitedCafes.map((cafe) => cafe.coffee_shop_id)
        );
      }
    }

    const newShops: CoffeeShop[] =
      newShopsData?.map((shop) => ({
        ...shop,
        isInitiallySaved: savedCafeIds.has(shop.id),
        isInitiallyVisited: visitedCafeIds.has(shop.id),
      })) || [];

    setShops((prev) => [...prev, ...newShops]);
    setPage((prev) => prev + 1);
    setHasMore(newShops.length === PAGE_SIZE);
    setLoading(false);
  }, [page, searchParams, user]);

  return (
    <>
      <div className="flex flex-col items-center text-center px-6 pt-4 pb-2">
        <h1 className="text-6xl md:text-7xl font-bold font-kate text-primary tracking-tighter">
          Discover
        </h1>
      </div>
      <div className="flex-1 flex flex-col gap-10 max-w-7xl p-5 w-full">
        <DiscoverFilters
          cities={Constants.public.Enums.Cities as unknown as string[]}
          parkings={
            Constants.public.Enums["Parking Difficulty"] as unknown as string[]
          }
          seatings={
            Constants.public.Enums[
              "Seating Availability"
            ] as unknown as string[]
          }
          vibes={Constants.public.Enums.Vibe as unknown as string[]}
        />
        {shops.length > 0 ? (
          <section className="flex flex-col gap-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {shops.map((shop) => (
                <CafeQuickView
                  key={shop.id}
                  shop={shop}
                  user={user}
                  isInitiallySaved={shop.isInitiallySaved}
                  isInitiallyVisited={shop.isInitiallyVisited}
                />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button 
                  onClick={fetchMoreShops} 
                  disabled={loading}
                  className="font-kate font-bold text-xl px-10 py-6 handwritten-border !border-primary/20 hover:bg-primary/5 transition-all"
                >
                  {loading ? "loading..." : "load more"}
                </Button>
              </div>
            )}
          </section>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(PAGE_SIZE)].map((_, i) => (
              <CafeCardSkeleton key={i} size="small" />
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p>No shops found matching your criteria.</p>
          </div>
        )}
      </div>
      <Footer user={user} />
    </>
  );
}
