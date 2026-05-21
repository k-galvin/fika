import { CafeQuickView } from "@/components/cafe-quick-view";
import { createClient, getUser } from "@/lib/supabase/server";
import { CoffeeShop } from "@/lib/types";

export async function FeaturedCafes() {
  const { user } = await getUser();
  const supabase = await createClient();

  const { data: featuredShops } = await supabase
    .from("coffee_shops")
    .select(
      `
      *,
      shop_photos (
        photo_url,
        is_approved,
        is_primary
      )
    `
    )
    .eq("is_featured", true);

  const shopsWithPhotos: CoffeeShop[] =
    featuredShops?.map((shop) => {
      const approvedPhotos = shop.shop_photos?.filter(
        (p: { is_approved: boolean }) => p.is_approved
      );
      return {
        ...shop,
        shop_photos: approvedPhotos || [],
      };
    }) || [];

  return (
    <>
      {shopsWithPhotos && shopsWithPhotos.length > 0 && (
        <section className="flex flex-col gap-10 w-full">
          <h2 className="text-6xl md:text-7xl font-bold font-kate text-primary text-center tracking-tighter">
            Current Favorites
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 w-full">
            {shopsWithPhotos.map((shop, index) => (
              <div 
                key={shop.id} 
                className={index === 2 ? "col-span-2 md:col-span-1 flex justify-center md:block" : ""}
              >
                <div className={index === 2 ? "w-full max-w-[50%] md:max-w-none" : "w-full"}>
                  <CafeQuickView
                    shop={shop}
                    user={user}
                    isInitiallySaved={false}
                    isInitiallyVisited={false}
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
