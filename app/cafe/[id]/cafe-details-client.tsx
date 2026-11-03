"use client";

import { useEffect, useState } from "react";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { Bookmark, MapPin, Navigation, NotebookPen, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "../../theme-context";
import { Database } from "@/lib/supabase/database.types";
import { SaveButton } from "@/components/save-button";
import { LogVisitButton } from "@/components/log-visit-button";
import { UpdateForm } from "@/components/update-form";
import { CafePhotoGallery } from "@/components/cafe-photo-gallery";
import { CafeMap } from "@/components/cafe-map";
import { JournalSection, NEW_JOURNAL_ENTRY_EVENT } from "@/components/journal-section";
import { deleteCafe } from "@/app/actions";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteCafe(shop.id);
    setIsDeleting(false);
    setDeleteDialogOpen(false);
    
    if (result.success) {
      toast.success("Cafe deleted successfully.");
      router.push("/discover");
    } else {
      toast.error(result.message || "Failed to delete cafe.");
    }
  }

  const attributeRow = (icon: string, label: string, value: string | boolean | null) => {
    if (value === null || value === undefined) return null;
    const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
    
    return (
      // Phones: compact 2-up tiles. lg: the original full-width rows.
      <div className="flex flex-col items-start gap-2 p-3 rounded-xl bg-background/40 border border-primary/5 lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:p-0 lg:py-5 lg:rounded-none lg:bg-transparent lg:border-0 lg:border-b lg:border-primary/5 lg:last:border-0 group">
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="bg-secondary/20 p-1.5 lg:p-2 rounded-full group-hover:bg-secondary/40 transition-colors shrink-0">
            <Image
              src={isAfterHours ? `${icon}Dark.png` : `${icon}.png`}
              alt={label}
              width={40}
              height={40}
              className="w-7 lg:w-10"
              style={{ height: 'auto' }}
            />
          </div>
          <span className="font-kate text-primary/70 uppercase tracking-widest text-xs lg:text-sm font-bold">{label}</span>
        </div>
        <Badge variant="journal" className="text-sm lg:text-base px-3 lg:px-6 py-0.5 lg:py-1">{displayValue}</Badge>
      </div>
    );
  };

  const directionsUrl = shop.address
    ? `https://maps.apple.com/?q=${encodeURIComponent(shop.address)}`
    : null;

  return (
    <main className="min-h-dvh flex flex-col items-center relative overflow-hidden bg-background">
      {/*
        Note: the entrance animation is applied to the blocks inside this
        wrapper rather than the wrapper itself — an animated transform here
        would become the containing block for the fixed mobile action bar.
      */}
      <div className="w-full flex-1 max-w-7xl px-6 py-6 md:py-12 md:px-12">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-baseline items-start gap-6 mb-8 md:mb-12 border-b border-primary/10 pb-6 md:pb-8 w-full">
          <div className="flex flex-col gap-2 w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold font-kate text-primary tracking-tighter leading-[0.8] break-words">
              {shop.name}
            </h1>
            <div className="flex items-center gap-2 mt-4 text-primary/40 font-kate italic text-xl">
              <MapPin className="size-5" />
              <span>{shop.city || "Curated Discovery"}</span>
            </div>
          </div>

          {/*
            Actions. On phones this becomes a floating bar pinned just above the
            bottom tab bar so log/save/directions are always in thumb reach; from
            md up it sits inline in the header as before.
          */}
          <div className="fixed z-40 inset-x-4 bottom-[calc(var(--tabbar-height)+env(safe-area-inset-bottom)+0.5rem)] md:static md:inset-auto md:bottom-auto flex items-center gap-4 md:animate-in md:fade-in md:slide-in-from-bottom-4 md:duration-1000">
            <div className="w-full md:w-auto bg-background/95 md:bg-secondary/10 backdrop-blur-md md:backdrop-blur-none shadow-lg md:shadow-none p-2 md:p-3 rounded-2xl handwritten-border !border-primary/15 md:!border-primary/10 flex items-center justify-around md:justify-start gap-2 md:gap-4">
              {userRole === "admin" && (
                <>
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-lg"
                        className="text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-6 w-6 md:h-8 md:w-8" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-kate">Delete Cafe?</DialogTitle>
                        <DialogDescription className="text-base">
                          Are you sure you want to delete <strong>{shop.name}</strong>? 
                          This action is permanent and will remove all associated photos, journal entries, and visits.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="mt-6">
                        <Button
                          variant="outline"
                          onClick={() => setDeleteDialogOpen(false)}
                          disabled={isDeleting}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="gap-2"
                        >
                          {isDeleting ? "Deleting..." : "Delete Permanently"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <div className="h-8 w-px bg-primary/10" />
                </>
              )}
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
              {/* Mobile-only shortcuts */}
              {directionsUrl && (
                <>
                  <div className="h-8 w-px bg-primary/10 md:hidden" />
                  <Button
                    asChild
                    variant="ghost"
                    size="icon-lg"
                    className="md:hidden text-primary/80"
                  >
                    <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                      <Navigation className="h-7 w-7" />
                      <span className="sr-only">Directions</span>
                    </a>
                  </Button>
                </>
              )}
              {user && (
                <>
                  <div className="h-8 w-px bg-primary/10 md:hidden" />
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    className="md:hidden text-primary/80"
                    onClick={() =>
                      window.dispatchEvent(new Event(NEW_JOURNAL_ENTRY_EVENT))
                    }
                  >
                    <NotebookPen className="h-7 w-7" />
                    <span className="sr-only">Add journal note</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {/*
            Left Column: Gallery and Location Stacked.
            Below lg the wrapper uses `display: contents` so Field Notes can sit
            between the gallery and the map on phones.
          */}
          <div className="contents lg:flex lg:col-span-7 lg:flex-col lg:gap-10">
            {/* 01: Gallery */}
            <section className="relative order-1 lg:order-none">
              <div className="absolute -top-6 -left-6 text-primary/10 font-kate font-bold text-8xl z-0 select-none">
                01
              </div>
              <div className="relative z-10">
                <CafePhotoGallery
                  shopId={shop.id}
                  photos={shop.shop_photos}
                  user={user}
                  userRole={userRole}
                  cafeName={shop.name}
                />
              </div>
            </section>

            {/* 02: Location */}
            <section className="relative order-3 lg:order-none">
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
                {directionsUrl ? (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center font-kate text-primary/50 hover:text-primary text-lg underline decoration-primary/20 underline-offset-4 transition-colors"
                  >
                    {shop.address}
                  </a>
                ) : (
                  <p className="text-center font-kate text-primary/40 text-lg">{shop.address}</p>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Field Notes and Drawing */}
          <aside className="order-2 lg:order-none lg:col-span-5 flex flex-col gap-0">
            <div className="bg-secondary/20 p-5 lg:p-8 rounded-2xl handwritten-border !border-primary/10 shadow-sm flex flex-col">
              <h2 className="text-3xl font-bold font-kate text-primary mb-3 lg:mb-1 border-b border-primary/10 pb-1">
                Field Notes
              </h2>
              
              <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-col lg:flex-grow lg:justify-between lg:gap-0">
                {attributeRow("/heart", "Vibe", shop.vibe)}
                {attributeRow("/money", "Pricing", shop.pricing)}
                {attributeRow("/person", "Busyness", shop.busyness)}
                {attributeRow("/chair", "Seating", shop.seating)}
                {attributeRow("/car", "Parking", shop.parking)}
                {attributeRow("/wifi", "WiFi", shop.has_wifi)}
                {attributeRow("/outlet", "Outlets", shop.has_outlets)}
                {attributeRow("/laptop", "Laptop Friendly", shop.is_laptop_friendly)}
              </div>

              <div className="mt-4 lg:mt-2 pt-2 border-t border-primary/5 flex flex-col items-center gap-2">
                <UpdateForm shopId={shop.id} user={user} />
                <p className="font-kate text-[10px] uppercase tracking-[0.2em] text-primary/30 text-center">
                  Help us keep the journal accurate.
                </p>
              </div>

              {/* Architectural Sketch & Wine Bar Toggle */}
              <div className="relative w-full h-36 md:h-44 mt-3 pt-2 border-t border-primary/5 flex items-center justify-center">
                <div className="relative w-full h-full select-none">
                  <Image
                    src={isAfterHours ? "/wineBarExterior.png" : "/cafeExterior.png"}
                    alt="Cafe exterior"
                    fill
                    sizes="(max-width: 1024px) 85vw, 30vw"
                    className="object-contain opacity-85 transition-opacity duration-500"
                  />
                </div>

                {/* If it's a wine bar, place the interactive wine glass Easter Egg right here */}
                {shop.wine_bar && (
                  <button
                    type="button"
                    onClick={() => setIsAfterHours(!isAfterHours)}
                    className="absolute right-1 bottom-1 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/90 backdrop-blur-xs border border-primary/20 shadow-xs hover:bg-background active:scale-95 transition-all group/wine cursor-pointer"
                    title={isAfterHours ? "Switch to daytime" : "Switch to after hours"}
                    aria-label={isAfterHours ? "Switch to daytime" : "Switch to after hours"}
                  >
                    <div className="relative size-5 shrink-0">
                      <Image
                        src={isAfterHours ? "/wineGlassDark.png" : "/wineGlass.png"}
                        alt="Wine glass"
                        fill
                        sizes="20px"
                        className="object-contain group-hover/wine:rotate-12 transition-transform"
                      />
                    </div>
                    <span className="font-kate text-xs font-bold text-primary/80 uppercase tracking-wider">
                      {isAfterHours ? "day mode" : "after hours"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* Row 3: Journal Section */}
        <div className="mt-12 lg:mt-0">
          <JournalSection
            cafeId={shop.id}
            user={user}
            entries={journalEntries}
          />
        </div>
      </div>
      <Footer
        user={user}
        isAfterHours={isAfterHours}
        setIsAfterHours={setIsAfterHours}
        isWineBar={shop.wine_bar}
      />
      {/* Room for the floating action bar on phones */}
      <div aria-hidden className="h-20 md:hidden" />
    </main>
  );
}
