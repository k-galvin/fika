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
        <div className="relative">
          <Image
            src={isAfterHours ? "/tablescapeDark.png" : "/tablescape.png"}
            alt="Table logo"
            width={300}
            height={300}
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
          <Button variant="link" onClick={handleSuggestClick}>
            Know a great spot? Suggest it for our list!
          </Button>
          <p>© fika</p>
        </div>
      </footer>
      <SuggestCafeForm
        isOpen={isSuggestCafeOpen}
        onOpenChange={setIsSuggestCafeOpen}
      />
    </>
  );
}
