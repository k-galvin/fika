"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Plus, Check } from "lucide-react";
import { toggleVisitedCafe } from "@/app/actions";
import { useRouter, usePathname } from "next/navigation";

type LogVisitButtonProps = {
  shopId: number;
  isInitiallyVisited: boolean;
  size?: "icon-sm" | "icon-lg";
};

export function LogVisitButton({
  shopId,
  isInitiallyVisited,
  size = "icon-sm",
}: LogVisitButtonProps) {
  const [isLogging, setIsLogging] = useState(false);
  const [hasVisited, setHasVisited] = useState(isInitiallyVisited); // Initialize with prop
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setHasVisited(isInitiallyVisited);
  }, [isInitiallyVisited]);

  const handleClick = async () => {
    if (isLogging) return;
    setIsLogging(true);

    try {
      const result = await toggleVisitedCafe(shopId, hasVisited);

      if (!result.success) {
        if (result.message === "User not found") {
          router.push(`/auth/login?redirect=${pathname}`);
        }
      } else {
        setHasVisited(!hasVisited); // Toggle state only on success
        router.refresh(); // Refresh the page data
      }
    } finally {
      setIsLogging(false);
    }
  };

  const iconSize = size === "icon-lg" ? "h-8 w-8" : "h-4 w-4";

  return (
    <Button
      variant="outline"
      size={size}
      className="rounded-full"
      onClick={handleClick}
      disabled={isLogging}
    >
      {hasVisited ? (
        <Check className={iconSize} data-testid="check-icon" />
      ) : (
        <Plus className={iconSize} data-testid="plus-icon" />
      )}
    </Button>
  );
}
