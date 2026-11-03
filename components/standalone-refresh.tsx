"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Home-screen web apps on iOS have no browser refresh button and are often
// resumed after hours in the background. Re-fetch server data when the app
// comes back to the foreground after being away for a while.
const STALE_AFTER_MS = 60_000;

export function StandaloneRefresh() {
  const router = useRouter();
  const hiddenAt = useRef<number | null>(null);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt.current = Date.now();
      } else if (
        hiddenAt.current !== null &&
        Date.now() - hiddenAt.current > STALE_AFTER_MS
      ) {
        hiddenAt.current = null;
        router.refresh();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [router]);

  return null;
}
