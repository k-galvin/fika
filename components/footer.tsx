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
};

export function Footer({
  isAfterHours,
  setIsAfterHours,
  isWineBar,
  user,
}: FooterProps) {
  const [isSuggestCafeOpen, setIsSuggestCafeOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSuggestClick = () => {
    if (user) {
      setIsSuggestCafeOpen(true);
    } else {
      router.push(`/auth/login?redirect=${pathname}`);
    }
  };

  return (
    <>
      <footer className="w-full flex flex-col items-center justify-center border-t mx-auto text-center text-xs gap-8 pb-4">
        <div className="relative w-[300px] h-[470px]">
          <Image
            src="/tablescape.png"
            alt="Table logo (light theme)"
            width={300}
            height={300}
            style={{ height: 'auto' }}
            className={`absolute top-0 left-0 transition-opacity duration-500 ${
              isAfterHours ? "opacity-0" : "opacity-100"
            }`}
            priority // Keep priority for the default image
          />
          <Image
            src="/tablescapeDark.png"
            alt="Table logo (dark theme)"
            width={300}
            height={300}
            style={{ height: 'auto' }}
            className={`absolute top-0 left-0 transition-opacity duration-500 ${
              isAfterHours ? "opacity-100" : "opacity-0"
            }`}
          />
          {isWineBar && setIsAfterHours && (
            <div
              className="cursor-pointer absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 translate-y-1 translate-x-8"
              onClick={() => setIsAfterHours(!isAfterHours)}
            >
              <Image
                src={isAfterHours ? "/wineGlassDark.png" : "/wineGlass.png"}
                alt="Wine Glass Icon"
                width={40}
                height={40}
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
      />
    </>
  );
}
