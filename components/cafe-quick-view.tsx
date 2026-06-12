import { CoffeeShop } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { LogVisitButton } from "./log-visit-button";
import { SaveButton } from "./save-button";
import { User } from "@supabase/supabase-js";

type CafeQuickViewProps = {
  shop: CoffeeShop;
  user: User | null;
  isInitiallySaved: boolean;
  isInitiallyVisited: boolean;
};

export function CafeQuickView({
  shop,
  isInitiallySaved,
  isInitiallyVisited,
}: CafeQuickViewProps) {
  const primaryPhoto = shop.shop_photos?.find(
    (photo) => photo.is_primary && photo.is_approved
  );
  const approvedPhotos = shop.shop_photos?.filter((photo) => photo.is_approved);

  const imageUrl = primaryPhoto
    ? primaryPhoto.photo_url
    : approvedPhotos && approvedPhotos.length > 0
    ? approvedPhotos[0].photo_url
    : "/hotLatte.png";

  return (
    <Link href={`/cafe/${shop.id}`} className="block w-full h-full group">
      <div className="relative h-full flex flex-col p-3 transition-all duration-300 group-hover:-translate-y-1">
        {/* The 'Photo' Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-secondary/20 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] handwritten-border !border-primary/20">
          <Image
            src={imageUrl}
            alt={shop.name || "No name found"}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Subtle overlay for buttons to make them pop against photos */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-background/80 backdrop-blur-sm rounded-full p-1 shadow-sm border border-primary/10">
              <LogVisitButton
                shopId={shop.id}
                isInitiallyVisited={isInitiallyVisited}
                initialRating={null}
              />
            </div>
            <div className="bg-background/80 backdrop-blur-sm rounded-full p-1 shadow-sm border border-primary/10">
              <SaveButton shopId={shop.id} isInitiallySaved={isInitiallySaved} />
            </div>
          </div>
        </div>

        {/* The 'Caption' */}
        <div className="mt-4 px-1 flex flex-col gap-1">
          <h2 className="font-kate font-bold text-2xl text-primary leading-tight tracking-tight">
            {shop.name}
          </h2>
          {shop.city && (
            <p className="font-kate text-primary/60 text-sm italic italic tracking-wide">
              {shop.city}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
