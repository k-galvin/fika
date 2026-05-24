import { CafeQuickView } from "@/components/cafe-quick-view";
import { createClient } from "@/lib/supabase/server";
import { CoffeeShop } from "@/lib/types";
import { User } from "@supabase/supabase-js";

export async function FeaturedCafes({ user }: { user: User | null }) {
  const supabase = await createClient();

  const { data: featuredShops, error: shopsError } = await supabase
    .from("coffee_shops")
    .select(
      `
      *,
      shop_photos (
        id,
        photo_url,
        is_approved,
        is_primary
      )
    `
    )
    .eq("is_featured", true);

  if (shopsError) {
    console.error("Error fetching featured shops:", shopsError);
  }

  let savedSet: Set<number> = new Set();
  let visitedSet: Set<number> = new Set();

  if (user) {
    const [savedData, visitedData] = await Promise.all([
      supabase
        .from("user_saved_cafes")
        .select("coffee_shop_id")
        .eq("profile_id", user.id),
      supabase
        .from("user_visits")
        .select("coffee_shop_id")
        .eq("profile_id", user.id),
    ]);

    if (savedData.data) {
      savedSet = new Set(savedData.data.map((s) => Number(s.coffee_shop_id)));
    }
    if (visitedData.data) {
      visitedSet = new Set(visitedData.data.map((v) => Number(v.coffee_shop_id)));
    }
  }

  const shopsWithStatus: CoffeeShop[] =
    featuredShops?.map((shop) => {
      const approvedPhotos = shop.shop_photos?.filter(
        (p: { is_approved: boolean }) => p.is_approved
      );
      const shopId = Number(shop.id);
      return {
        ...shop,
        id: shopId,
        isInitiallySaved: savedSet.has(shopId),
        isInitiallyVisited: visitedSet.has(shopId),
        shop_photos: approvedPhotos || [],
        ratings: [],
      };
    }) || [];

  return (
    <>
      {shopsWithStatus && shopsWithStatus.length > 0 && (
        <section className="flex flex-col gap-10 w-full">
          <h2 className="text-6xl md:text-7xl font-bold font-kate text-primary text-center tracking-tighter">
            Current Favorites
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 w-full">
            {shopsWithStatus.map((shop, index) => (
              <div 
                key={shop.id} 
                className={index === 2 ? "col-span-2 md:col-span-1 flex justify-center md:block" : ""}
              >
                <div className={index === 2 ? "w-full max-w-[50%] md:max-w-none" : "w-full"}>
                  <CafeQuickView
                    shop={shop}
                    user={user}
                    isInitiallySaved={shop.isInitiallySaved}
                    isInitiallyVisited={shop.isInitiallyVisited}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
