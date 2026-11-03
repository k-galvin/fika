"use client";

import Link from "next/link";
import Image from "next/image";
import { CoffeeShop } from "@/lib/types";
import { SafeImage } from "./safe-image";
import { LogVisitButton } from "./log-visit-button";
import { SaveButton } from "./save-button";
import { useTheme } from "@/app/theme-context";
import { cn } from "@/lib/utils";

// A gentle, repeating set of tilts so the polaroids look hand-placed.
const TILTS = ["-rotate-2", "rotate-[1.5deg]", "-rotate-1", "rotate-2"];
const TAPE_TILTS = ["rotate-[3deg]", "-rotate-[4deg]", "rotate-[2deg]", "-rotate-[2deg]"];

function primaryPhotoUrl(shop: CoffeeShop) {
  const approved = shop.shop_photos?.filter((p) => p.is_approved) ?? [];
  return (
    approved.find((p) => p.is_primary)?.photo_url ??
    approved[0]?.photo_url ??
    "/hotLatte.png"
  );
}

function Polaroid({ shop, index }: { shop: CoffeeShop; index: number }) {
  return (
    <Link
      href={`/cafe/${shop.id}`}
      className={cn(
        "relative block bg-[#fffdf8] p-3 pb-4.5 shadow-[0_10px_30px_-8px_rgba(52,38,27,0.35)] border border-primary/5 transition-transform duration-300 active:scale-[0.98] hover:rotate-0 hover:-translate-y-1",
        TILTS[index % TILTS.length]
      )}
    >
      {/* Washi tape (same treatment as the journal page) */}
      <div
        aria-hidden
        className={cn(
          "washi-tape -top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-accent/30 z-20",
          TAPE_TILTS[index % TAPE_TILTS.length]
        )}
      />

      <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary/20">
        <SafeImage
          src={primaryPhotoUrl(shop)}
          alt={shop.name || "Cafe"}
          fill
          sizes="(max-width: 768px) 80vw, 33vw"
          priority={index < 2}
          className="object-cover"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1.5">
          <div className="bg-background/80 backdrop-blur-sm rounded-full shadow-sm border border-primary/10">
            <LogVisitButton
              shopId={shop.id}
              isInitiallyVisited={shop.isInitiallyVisited}
              initialRating={null}
              size="icon"
            />
          </div>
          <div className="bg-background/80 backdrop-blur-sm rounded-full shadow-sm border border-primary/10">
            <SaveButton
              shopId={shop.id}
              isInitiallySaved={shop.isInitiallySaved}
              size="icon"
            />
          </div>
        </div>
      </div>

      <div className="mt-3.5 px-1 flex flex-col gap-0.5">
        <h3 className="font-kate font-bold text-2xl text-primary leading-tight tracking-tight line-clamp-1 md:line-clamp-2">
          {shop.name}
        </h3>
        {shop.city && (
          <p className="font-kate italic text-primary/50 text-base">{shop.city}</p>
        )}
      </div>
    </Link>
  );
}

/**
 * Home page favorites. Phones: a swipeable, snap-scrolling row of tilted
 * polaroids with the next card peeking in. md and up: a simple 3-up layout.
 */
export function FavoritesCarousel({ shops }: { shops: CoffeeShop[] }) {
  const { isAfterHours } = useTheme();

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          // Phones: 1 card per slide, perfectly centered on the screen (no clumsy peeking)
          "relative z-10 flex overflow-x-auto snap-x snap-mandatory pt-3 pb-4 -mx-4 [&::-webkit-scrollbar]:hidden",
          // md+: plain 3-column grid
          "md:grid md:grid-cols-3 md:gap-10 md:overflow-visible md:mx-0 md:px-4 md:pt-8"
        )}
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {shops.map((shop, index) => (
          <div
            key={shop.id}
            className="w-full shrink-0 snap-center flex justify-center px-6 md:w-auto md:p-0 md:block"
          >
            <div className="w-full max-w-[278px] md:max-w-none">
              <Polaroid shop={shop} index={index} />
            </div>
          </div>
        ))}
      </div>

      {/* Sequential flow: Tablescape behind polaroids -> Browse all cafes */}
      <div className="flex flex-col items-center pb-2">
        {/* Complete tablescape illustration (layered BEHIND the polaroids) */}
        <div
          aria-hidden
          className="md:hidden relative z-0 w-[130px] h-[202px] -mt-10 mb-1.5 select-none pointer-events-none opacity-90 transition-opacity"
        >
          <Image
            src={isAfterHours ? "/tablescapeDark.png" : "/tablescape.png"}
            alt="Tablescape"
            fill
            sizes="130px"
            className="object-contain"
          />
        </div>

        {/* Browse all cafes link directly below the tablescape */}
        <Link
          href="/discover"
          className="relative z-10 font-kate font-bold text-base md:text-lg text-primary/80 hover:text-primary border-b border-primary/30 pb-0.5 transition-colors"
        >
          browse all cafes →
        </Link>
      </div>
    </div>
  );
}
