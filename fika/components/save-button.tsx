"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Bookmark } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { saveCafe, unsaveCafe } from "@/app/actions";

import { useTheme } from "@/app/theme-context";

type SaveButtonProps = {
  shopId: number;
  isInitiallySaved: boolean;
  onUnsave?: (shopId: number) => void;
  size?: "icon-sm" | "icon-lg";
};

export function SaveButton({
  shopId,
  isInitiallySaved,
  onUnsave,
  size = "icon-sm",
}: SaveButtonProps) {
  const { isAfterHours } = useTheme();
  const [isSaved, setIsSaved] = useState(isInitiallySaved); // Initialize with prop
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsSaved(isInitiallySaved);
  }, [isInitiallySaved]);

  const handleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      let result: { success: boolean; message?: string };
      if (isSaved) {
        result = await unsaveCafe(shopId);
      } else {
        result = await saveCafe(shopId);
      }

      if (!result.success) {
        if (result.message === "User not found") {
          router.push(`/auth/login?redirect=${pathname}`);
        }
      } else {
        setIsSaved(!isSaved); // Toggle state only on success
        if (isSaved && onUnsave) {
          // If it was saved and now unsaved
          onUnsave(shopId);
        }
        router.refresh(); // Refresh the page data
      }
    } finally {
      setIsLoading(false);
    }
  };

  const iconSize = size === "icon-lg" ? "h-8 w-8" : "h-5 w-5";

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleClick}
      disabled={isLoading}
    >
      <Bookmark
        className={iconSize}
        fill={isSaved ? (isAfterHours ? "white" : "black") : "none"}
        data-testid="bookmark-icon"
      />
    </Button>
  );
}
