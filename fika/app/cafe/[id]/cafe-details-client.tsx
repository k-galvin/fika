"use client";

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
};

export default function CafeDetailsClient({
  shop,
  user,
  userRole, // New prop
  isInitiallySaved,
  isInitiallyVisited,
}: CafeDetailsClientProps) {
  const { isAfterHours, setIsAfterHours } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <main
      className={clsx(
        "min-h-screen flex flex-col items-center relative overflow-hidden"
      )}
    >
      <div className="flex-1 w-full flex flex-col gap-8 md:gap-12 items-center p-8 max-w-4xl mx-auto">
        <div className="flex flex-col gap-4 text-center items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-5xl md:text-6xl font-bold font-kate">
              {shop.name}
            </h1>
            <div className="flex items-center gap-2">
              <LogVisitButton
                shopId={shop.id}
                isInitiallyVisited={isInitiallyVisited}
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

        <Card className="w-full">
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-8 text-lg p-6">
            {shop.vibe && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-3 font-medium md:min-w-[180px]">
                  <Image
                    src={isAfterHours ? "/heartDark.png" : "/heart.png"}
                    alt="Vibe"
                    width={60}
                    height={60}
                  />{" "}
                  Vibe
                </span>
                <Badge className="text-lg px-3 py-1">{shop.vibe}</Badge>
              </div>
            )}
            {shop.pricing && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-3 font-medium md:min-w-[180px]">
                  <Image
                    src={isAfterHours ? "/moneyDark.png" : "/money.png"}
                    alt="Pricing"
                    width={60}
                    height={60}
                  />{" "}
                  Pricing
                </span>
                <Badge className="text-lg px-3 py-1">{shop.pricing}</Badge>
              </div>
            )}
            {shop.busyness && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-3 font-medium md:min-w-[180px]">
                  <Image
                    src={isAfterHours ? "/personDark.png" : "/person.png"}
                    alt="Busyness"
                    width={60}
                    height={60}
                  />{" "}
                  Busyness
                </span>
                <Badge className="text-lg px-3 py-1">{shop.busyness}</Badge>
              </div>
            )}
            {shop.seating && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-3 font-medium md:min-w-[180px]">
                  <Image
                    src={isAfterHours ? "/chairDark.png" : "/chair.png"}
                    alt="Seating"
                    width={60}
                    height={60}
                  />{" "}
                  Seating
                </span>
                <Badge className="text-lg px-3 py-1">{shop.seating}</Badge>
              </div>
            )}
            {shop.parking && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-3 font-medium md:min-w-[180px]">
                  <Image
                    src={isAfterHours ? "/carDark.png" : "/car.png"}
                    alt="Parking"
                    width={60}
                    height={60}
                  />{" "}
                  Parking
                </span>
                <Badge className="text-lg px-3 py-1">{shop.parking}</Badge>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-3 font-medium md:min-w-[180px]">
                <Image
                  src={isAfterHours ? "/wifiDark.png" : "/wifi.png"}
                  alt="WiFi"
                  width={60}
                  height={60}
                />{" "}
                WiFi
              </span>
              <Badge className="text-lg px-3 py-1">
                {shop.has_wifi ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-3 font-medium md:min-w-[180px]">
                <Image
                  src={isAfterHours ? "/outletDark.png" : "/outlet.png"}
                  alt="Outlets"
                  width={60}
                  height={60}
                />{" "}
                Outlets
              </span>
              <Badge className="text-lg px-3 py-1">
                {shop.has_outlets ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-3 font-medium md:min-w-[180px]">
                <Image
                  src={isAfterHours ? "/laptopDark.png" : "/laptop.png"}
                  alt="Laptop Friendly"
                  width={60}
                  height={60}
                />{" "}
                Laptop Friendly
              </span>
              <Badge className="text-lg px-3 py-1">
                {shop.is_laptop_friendly ? "Yes" : "No"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <UpdateForm shopId={shop.id} />
        <CafeActivityChart cafeId={shop.id} />

        {/* New Photo Gallery Component */}
        <CafePhotoGallery shopId={shop.id} photos={shop.shop_photos} user={user} userRole={userRole} />

        <div className="w-full relative h-64 md:h-80">
          <Image
            src={isAfterHours ? "/wineBarExterior.png" : "/cafeExterior.png"}
            alt="Cafe exterior"
            fill
            className="object-contain"
          />
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
