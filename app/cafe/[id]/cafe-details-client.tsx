"use client";

import { useEffect, useState } from "react";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { Bookmark, MapPin } from "lucide-react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "../../theme-context";
import { Database } from "@/lib/supabase/database.types";
import { SaveButton } from "@/components/save-button";
import { LogVisitButton } from "@/components/log-visit-button";
import { UpdateForm } from "@/components/update-form";
import CafeActivityChart from "@/components/CafeActivityChart";
import { CafePhotoGallery } from "@/components/cafe-photo-gallery";
import { CafeMap } from "@/components/cafe-map";
import { JournalSection } from "@/components/journal-section";

type ShopPhoto = Database["public"]["Tables"]["shop_photos"]["Row"];
type CoffeeShopWithPhotos =
  Database["public"]["Tables"]["coffee_shops"]["Row"] & {
    shop_photos: ShopPhoto[];
  };

type CafeDetailsClientProps = {
  shop: CoffeeShopWithPhotos;
  user: User | null;
  userRole: "user" | "admin" | null;
  isInitiallySaved: boolean;
  isInitiallyVisited: boolean;
  initialRating: number | null;
  journalEntries: Database["public"]["Tables"]["journal_entries"]["Row"][];
};

export default function CafeDetailsClient({
  shop,
  user,
  userRole,
  isInitiallySaved,
  isInitiallyVisited,
  initialRating,
  journalEntries,
}: CafeDetailsClientProps) {
  const { isAfterHours, setIsAfterHours } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const attributeRow = (icon: string, label: string, value: string | boolean | null) => {
    if (value === null || value === undefined) return null;
    const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
    
    return (
      <div className="flex items-center justify-between py-5 border-b border-primary/5 last:border-0 group">
        <div className="flex items-center gap-4">
          <div className="bg-secondary/20 p-2 rounded-full group-hover:bg-secondary/40 transition-colors">
            <Image
              src={isAfterHours ? `${icon}Dark.png` : `${icon}.png`}
              alt={label}
              width={40}
              height={40}
              style={{ height: 'auto' }}
            />
          </div>
          <span className="font-kate text-primary/70 uppercase tracking-widest text-sm font-bold">{label}</span>
        </div>
        <Badge variant="journal" className="text-base px-6 py-1">{displayValue}</Badge>
      </div>
    );
  };

  return (
    <main className="min-h-screen flex flex-col items-center relative overflow-hidden bg-background">
      <div className="w-full flex-1 max-w-7xl px-6 py-12 md:px-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row justify-between items-baseline gap-8 mb-16 border-b border-primary/10 pb-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-7xl md:text-9xl font-bold font-kate text-primary tracking-tighter leading-[0.8]">
              {shop.name}
            </h1>
            <div className="flex items-center gap-2 mt-4 text-primary/40 font-kate italic text-xl">
              <MapPin className="size-5" />
              <span>{shop.city || "Curated Discovery"}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-secondary/10 p-3 rounded-2xl handwritten-border !border-primary/10 flex items-center gap-4">
              <LogVisitButton
                shopId={shop.id}
                isInitiallyVisited={isInitiallyVisited}
                initialRating={initialRating}
                size="icon-lg"
              />
              <div className="h-8 w-px bg-primary/10" />
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
                  className="text-primary/60 hover:text-primary"
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          {/* Left Column: Gallery and Location Stacked */}
          <div className="lg:col-span-7 flex flex-col gap-10">
            {/* 01: Gallery */}
            <section className="relative">
              <div className="absolute -top-6 -left-6 text-primary/10 font-kate font-bold text-8xl z-0 select-none">
                01
              </div>
              <div className="relative z-10">
                <CafePhotoGallery
                  shopId={shop.id}
                  photos={shop.shop_photos}
                  user={user}
                  userRole={userRole}
                />
              </div>
            </section>

            {/* 02: Location */}
            <section className="relative">
              <div className="absolute -top-6 -left-6 text-primary/10 font-kate font-bold text-8xl z-0 select-none">
                02
              </div>
              <div className="relative z-10 flex flex-col gap-6">
                <h2 className="text-4xl font-bold font-kate text-primary tracking-tighter">Location</h2>
                <div className="handwritten-border !border-primary/10 overflow-hidden rounded-2xl shadow-xl bg-background">
                  {isClient && shop.address ? (
                    <CafeMap
                      address={shop.address}
                      cafeName={shop.name || "Cafe"}
                    />
                  ) : (
                    <div className="w-full h-[300px] flex items-center justify-center bg-secondary/5">
                      <p className="font-kate italic text-primary/40">Loading map...</p>
                    </div>
                  )}
                </div>
                <p className="text-center font-kate text-primary/40 text-lg">{shop.address}</p>
              </div>
            </section>
          </div>

          {/* Right Column: Field Notes and Drawing */}
          <aside className="lg:col-span-5 flex flex-col gap-0">
            <div className="bg-secondary/20 p-8 rounded-2xl handwritten-border !border-primary/10 shadow-sm flex flex-col">
              <h2 className="text-3xl font-bold font-kate text-primary mb-1 border-b border-primary/10 pb-1">
                Field Notes
              </h2>
              
              <div className="flex flex-col flex-grow justify-between">
                {attributeRow("/heart", "Vibe", shop.vibe)}
                {attributeRow("/money", "Pricing", shop.pricing)}
                {attributeRow("/person", "Busyness", shop.busyness)}
                {attributeRow("/chair", "Seating", shop.seating)}
                {attributeRow("/car", "Parking", shop.parking)}
                {attributeRow("/wifi", "WiFi", shop.has_wifi)}
                {attributeRow("/outlet", "Outlets", shop.has_outlets)}
                {attributeRow("/laptop", "Laptop Friendly", shop.is_laptop_friendly)}
              </div>

              <div className="mt-2 pt-2 border-t border-primary/5 flex flex-col items-center gap-2">
                <UpdateForm shopId={shop.id} user={user} />
                <p className="font-kate text-[10px] uppercase tracking-[0.2em] text-primary/30 text-center">
                  Help us keep the journal accurate.
                </p>
              </div>
            </div>

            {/* Decorative Drawing - Tucked tightly */}
            <div className="relative w-full h-80 transition-all duration-700 select-none pointer-events-none group -mt-10 opacity-80">
                <Image
                src={isAfterHours ? "/wineBarExterior.png" : "/cafeExterior.png"}
                alt="Cafe exterior"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain"
              />
            </div>
          </aside>
        </div>

        {/* Row 2: Popularity Log Full Width */}
        <div className="pt-4 -mt-8">
          <section className="relative">
            <div className="absolute -top-6 -left-6 text-primary/10 font-kate font-bold text-8xl z-0 select-none">
              03
            </div>
            <div className="relative z-10 flex flex-col gap-10">
              <h2 className="text-4xl font-bold font-kate text-primary tracking-tighter">Popularity Log</h2>
              <div className="bg-secondary/5 p-8 md:p-12 rounded-2xl handwritten-border !border-primary/10">
                <CafeActivityChart cafeId={shop.id} />
              </div>
            </div>
          </section>
        </div>

        {/* Row 3: Journal Section */}
        <JournalSection
          cafeId={shop.id}
          user={user}
          entries={journalEntries}
        />
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
