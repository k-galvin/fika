"use client";

import { CafeQuickView } from "@/components/cafe-quick-view";
import { DiscoverFilters } from "@/components/discover-filters";
import { CafeCardSkeleton } from "@/components/cafe-card-skeleton";
import { Button } from "@/components/ui/button";

import { Constants } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/client";
import { CoffeeShop } from "@/lib/types";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";

import { User } from "@supabase/supabase-js";
import { Footer } from "@/components/footer";

const PAGE_SIZE = 20;

export function DiscoverContent({
  initialShops,
  user,
}: {
  initialShops: CoffeeShop[];
  user: User | null;
}) {
  const [shops, setShops] = useState<CoffeeShop[]>(initialShops || []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialShops.length === PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setShops(initialShops);
    setPage(1);
    setHasMore(initialShops.length === PAGE_SIZE);
  }, [initialShops]);

  const fetchMoreShops = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase.from("coffee_shops").select(
      `
      *,
      shop_photos (
        photo_url
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
      <div className="text-center px-4">
        <h1 className="text-4xl tracking-tight text-black sm:text-6xl font-kate">
          Discover Cafes
        </h1>
        <p className="mt-6 text-lg leading-8 text-black font-kate">
          Browse our collection of coffee shops.
        </p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                <Button onClick={fetchMoreShops} disabled={loading}>
                  {loading ? "Loading..." : "Load More"}
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
