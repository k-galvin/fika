import { CoffeeShop } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
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
    <Link href={`/cafe/${shop.id}`} className="block w-full h-full max-w-[320px]">
      <Card className="w-full h-full flex flex-col relative group hover:shadow-lg transition-shadow duration-200 ease-in-out">
        <div className="flex justify-between items-center p-4 pl-6 pr-[1.1rem]">
          <h2 className="font-kate font-semibold leading-none tracking-tight text-lg">
            {shop.name}
          </h2>
          <div className="flex items-center gap-2">
            <LogVisitButton
              shopId={shop.id}
              isInitiallyVisited={isInitiallyVisited}
              initialRating={null}
            />
            <SaveButton shopId={shop.id} isInitiallySaved={isInitiallySaved} />
          </div>
        </div>
        <div className="flex-grow"></div>
        <CardContent className="px-4 pb-4">
          <Image
            src={imageUrl}
            alt={shop.name || "No name found"}
            width={300}
            height={300}
            priority
            className="w-full aspect-square object-cover rounded-md"
          />
        </CardContent>
      </Card>
    </Link>
  );
}
