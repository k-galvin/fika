"use client";

import { useEffect, useState } from "react";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@supabase/supabase-js";
import { Bookmark } from "lucide-react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "../../theme-context";
import clsx from "clsx";
import { Database } from "@/lib/supabase/database.types";
import { SaveButton } from "@/components/save-button";
import { LogVisitButton } from "@/components/log-visit-button";
import { UpdateForm } from "@/components/update-form";
import CafeActivityChart from "@/components/CafeActivityChart";
import { CafePhotoGallery } from "@/components/cafe-photo-gallery";
import { CafeMap } from "@/components/cafe-map";

type ShopPhoto = Database["public"]["Tables"]["shop_photos"]["Row"];
type CoffeeShopWithPhotos =
  Database["public"]["Tables"]["coffee_shops"]["Row"] & {
    shop_photos: ShopPhoto[];
  };

type CafeDetailsClientProps = {
  shop: CoffeeShopWithPhotos;
  user: User | null;
  userRole: "user" | "admin" | null; // New prop
  isInitiallySaved: boolean;
  isInitiallyVisited: boolean;
  initialRating: number | null;
};

export default function CafeDetailsClient({
  shop,
  user,
  userRole, // New prop
  isInitiallySaved,
  isInitiallyVisited,
  initialRating,
}: CafeDetailsClientProps) {
  const { isAfterHours, setIsAfterHours } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <main
      className={clsx(
        "min-h-screen flex flex-col items-center relative overflow-hidden"
      )}
    >
      <div className="w-full flex-1 p-8">
        <div className="flex flex-col gap-4 text-center items-center mb-8">
          <div className="flex items-center gap-8">
            <h1 className="text-5xl md:text-6xl font-bold font-kate">
              {shop.name}
            </h1>
            <div className="flex items-center gap-2">
              <LogVisitButton
                shopId={shop.id}
                isInitiallyVisited={isInitiallyVisited}
                initialRating={initialRating}
                size="icon-lg"
              />
              {user ? (
                <SaveButton
                  shopId={shop.id}
                  isInitiallySaved={isInitiallySaved}
                  size="icon-lg"
                />
              ) : (
                <Button
                  variant="ghost"
                  size="icon-lg"
                  onClick={() =>
                    router.push(`/auth/login?redirect=${pathname}`)
                  }
                >
                  <Bookmark className="h-8 w-8" fill="none" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Row 1: Categories and Map */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 max-w-7xl mx-auto items-stretch">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold mb-4 font-kate">Categories</h2>
            <Card className="w-full">
              <CardContent className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-14 text-lg p-8">
                {shop.vibe && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-3 font-medium">
                      <Image
                        src={isAfterHours ? "/heartDark.png" : "/heart.png"}
                        alt="Vibe"
                        width={40}
                        height={40}
                      />
                      Vibe
                    </span>
                    <Badge className="text-base px-3 py-1">{shop.vibe}</Badge>
                  </div>
                )}
                {shop.pricing && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-3 font-medium">
                      <Image
                        src={isAfterHours ? "/moneyDark.png" : "/money.png"}
                        alt="Pricing"
                        width={40}
                        height={40}
                      />
                      Pricing
                    </span>
                    <Badge className="text-base px-3 py-1">
                      {shop.pricing}
                    </Badge>
                  </div>
                )}
                {shop.busyness && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-3 font-medium">
                      <Image
                        src={isAfterHours ? "/personDark.png" : "/person.png"}
                        alt="Busyness"
                        width={40}
                        height={40}
                      />
                      Busyness
                    </span>
                    <Badge className="text-base px-3 py-1">
                      {shop.busyness}
                    </Badge>
                  </div>
                )}
                {shop.seating && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-3 font-medium">
                      <Image
                        src={isAfterHours ? "/chairDark.png" : "/chair.png"}
                        alt="Seating"
                        width={40}
                        height={40}
                      />
                      Seating
                    </span>
                    <Badge className="text-base px-3 py-1">
                      {shop.seating}
                    </Badge>
                  </div>
                )}
                {shop.parking && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-3 font-medium">
                      <Image
                        src={isAfterHours ? "/carDark.png" : "/car.png"}
                        alt="Parking"
                        width={40}
                        height={40}
                      />
                      Parking
                    </span>
                    <Badge className="text-base px-3 py-1">
                      {shop.parking}
                    </Badge>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-3 font-medium">
                    <Image
                      src={isAfterHours ? "/wifiDark.png" : "/wifi.png"}
                      alt="WiFi"
                      width={40}
                      height={40}
                    />
                    WiFi
                  </span>
                  <Badge className="text-base px-3 py-1">
                    {shop.has_wifi ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-3 font-medium">
                    <Image
                      src={isAfterHours ? "/outletDark.png" : "/outlet.png"}
                      alt="Outlets"
                      width={40}
                      height={40}
                    />
                    Outlets
                  </span>
                  <Badge className="text-base px-3 py-1">
                    {shop.has_outlets ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-3 font-medium">
                    <Image
                      src={isAfterHours ? "/laptopDark.png" : "/laptop.png"}
                      alt="Laptop Friendly"
                      width={40}
                      height={40}
                    />
                    Laptop Friendly
                  </span>
                  <Badge className="text-base px-3 py-1">
                    {shop.is_laptop_friendly ? "Yes" : "No"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="w-full flex flex-col">
            <h2 className="text-2xl font-bold mb-4 font-kate">Location</h2>
            {isClient && shop.address ? (
              <>
                <CafeMap
                  address={shop.address}
                  cafeName={shop.name || "Cafe"}
                />
                <p className="text-muted-foreground text-center">
                  {shop.address}
                </p>
              </>
            ) : (
              <div className="w-full h-[350px] rounded-lg bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">
                  {isClient
                    ? "No address available for this cafe"
                    : "Loading map..."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Gallery and Graph */}
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-12 max-w-7xl mx-auto items-stretch mt-12">
          <div className="flex flex-col md:h-[300px]">
            <CafePhotoGallery
              shopId={shop.id}
              photos={shop.shop_photos}
              user={user}
              userRole={userRole}
            />
          </div>
          <div className="flex flex-col gap-8">
            <div className="h-[300px]">
              <CafeActivityChart cafeId={shop.id} />
            </div>
          </div>
        </div>

        {/* Row 3: Cafe Exterior Photo */}
        <div className="w-full relative h-64 md:h-80 max-w-7xl mx-auto mt-24">
          <Image
            src={isAfterHours ? "/wineBarExterior.png" : "/cafeExterior.png"}
            alt="Cafe exterior"
            fill
            className="object-contain"
          />
        </div>

        {/* Row 4: Update Form */}
        <div className="grid grid-cols-1 max-w-7xl mx-auto mt-2">
          <UpdateForm shopId={shop.id} user={user} />
        </div>
      </div>
      <Footer
        user={user}
        isAfterHours={isAfterHours}
        setIsAfterHours={setIsAfterHours}
        isWineBar={shop.wine_bar}
      />
    </main>
  );
}
