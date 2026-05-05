"use client";

import Image from "next/image";
import { useTheme } from "./theme-context";

export default function DiscoBallAndStars() {
  const { isAfterHours } = useTheme();

  if (!isAfterHours) {
    return null;
  }

  return (
    <>
      <div className="disco-ball-container hidden sm:block">
        <Image
          src="/discoBall.png"
          alt="Disco Ball"
          width={100}
          height={100}
          style={{ width: 'auto', height: "auto" }}
          className="filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
        />
      </div>
      {/* Star icons */}
      <div className="hidden sm:block star star-1">
        <Image src="/stars.png" alt="star" width={100} height={100} style={{ width: 'auto', height: "auto" }} />
      </div>
      <div className="hidden sm:block star star-2">
        <Image src="/stars.png" alt="star" width={100} height={100} style={{ width: 'auto', height: "auto" }} />
      </div>
      <div className="hidden sm:block star star-3">
        <Image src="/stars.png" alt="star" width={100} height={100} style={{ width: 'auto', height: "auto" }} />
      </div>
      <div className="hidden sm:block star star-4">
        <Image src="/stars.png" alt="star" width={100} height={100} style={{ width: 'auto', height: "auto" }} />
      </div>
      <div className="hidden sm:block star star-5">
        <Image src="/stars.png" alt="star" width={100} height={100} style={{ width: 'auto', height: "auto" }} />
      </div>
    </>
  );
}
