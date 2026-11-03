"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "./ui/button";
import { SuggestCafeForm } from "./suggest-cafe-form";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";

type FooterProps = {
  isAfterHours?: boolean;
  setIsAfterHours?: (value: boolean) => void;
  isWineBar?: boolean | null;
  user: User | null;
  locations?: string[];
  showTablescapeMobile?: boolean;
};

export function Footer({
  isAfterHours,
  setIsAfterHours,
  isWineBar,
  user,
  locations,
  showTablescapeMobile = false,
}: FooterProps) {
  const [isSuggestCafeOpen, setIsSuggestCafeOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // On mobile (< md), the tablescape is integrated into the hero/carousel on Home,
  // so the mobile footer stays clean without peeking. On desktop (md+), the footer tablescape is shown across all pages.
  const shouldShowTablescapeOnMobile = showTablescapeMobile;

  const handleSuggestClick = () => {
    if (user) {
      setIsSuggestCafeOpen(true);
    } else {
      router.push(`/auth/login?redirect=${pathname}`);
    }
  };

  return (
    <>
      <footer className="w-full flex flex-col items-center justify-center border-t mx-auto text-center text-xs gap-4 md:gap-8 pt-4 pb-4">
        {/* Tablescape vignette: Home page on mobile; all pages on desktop */}
        <div
          className={`relative w-[180px] h-[282px] md:w-[300px] md:h-[470px] ${
            shouldShowTablescapeOnMobile ? "block" : "hidden md:block"
          }`}
        >
          <Image
            src="/tablescape.png"
            alt="Table logo (light theme)"
            fill
            sizes="(max-width: 768px) 180px, 300px"
            className={`object-contain transition-opacity duration-500 ${
              isAfterHours ? "opacity-0" : "opacity-100"
            }`}
          />
          <Image
            src="/tablescapeDark.png"
            alt="Table logo (dark theme)"
            fill
            sizes="(max-width: 768px) 180px, 300px"
            className={`object-contain transition-opacity duration-500 ${
              isAfterHours ? "opacity-100" : "opacity-0"
            }`}
          />
          {isWineBar && setIsAfterHours && (
            <div
              className="cursor-pointer absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 translate-y-0.5 translate-x-5 md:translate-y-1 md:translate-x-8 w-6 md:w-10 hover:scale-110 active:scale-95 transition-transform"
              onClick={() => setIsAfterHours(!isAfterHours)}
              title="Toggle after hours"
            >
              <Image
                src={isAfterHours ? "/wineGlassDark.png" : "/wineGlass.png"}
                alt="Wine Glass Icon"
                width={40}
                height={40}
                style={{ width: "100%", height: 'auto' }}
              />
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-2">
          <Button 
            variant="link" 
            onClick={handleSuggestClick}
            className="text-base md:text-lg font-kate font-bold text-primary hover:text-primary/70 transition-colors"
          >
            Know a great spot? Suggest it for our list!
          </Button>
          <p className="font-kate text-sm text-primary/60">© fika</p>
        </div>
      </footer>
      <SuggestCafeForm
        isOpen={isSuggestCafeOpen}
        onOpenChange={setIsSuggestCafeOpen}
        locations={locations}
      />
    </>
  );
}
