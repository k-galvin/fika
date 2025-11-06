import { CafeQuickView } from "@/components/cafe-quick-view";
import { createClient } from "@/lib/supabase/server";
import { CoffeeShop } from "@/lib/types";

export async function FeaturedCafes() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: featuredShopsData } = await supabase
    .from("coffee_shops")
    .select(
      `
      *,
      shop_photos (
        id,
        photo_url,
        is_primary,
        is_approved
      )
    `
    )
    .eq("is_featured", true);

  let savedCafeIds: Set<number> = new Set();
  let visitedCafeIds: Set<number> = new Set();

  if (user) {
    // Fetch all saved cafes for the user
    const { data: savedCafes } = await supabase
      .from("user_saved_cafes")
      .select("coffee_shop_id")
      .eq("profile_id", user.id);
    if (savedCafes) {
      savedCafeIds = new Set(savedCafes.map((cafe) => cafe.coffee_shop_id));
    }

    // Fetch all visited cafes for the user
    const { data: visitedCafes } = await supabase
      .from("user_visits")
      .select("coffee_shop_id")
      .eq("profile_id", user.id);
    if (visitedCafes) {
      visitedCafeIds = new Set(visitedCafes.map((cafe) => cafe.coffee_shop_id));
    }
  }

  const featuredShops: CoffeeShop[] =
    featuredShopsData?.map((shop) => {
      return {
        ...shop,
        isInitiallySaved: savedCafeIds.has(shop.id),
        isInitiallyVisited: visitedCafeIds.has(shop.id),
        shop_photos: shop.shop_photos || [],
      };
    }) || [];

  return (
    <>
      {featuredShops && featuredShops.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl mb-4">Featured Cafes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {featuredShops.map((shop) => (
              <CafeQuickView
                key={shop.id}
                shop={shop}
                user={user}
                isInitiallySaved={shop.isInitiallySaved}
                isInitiallyVisited={shop.isInitiallyVisited}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
