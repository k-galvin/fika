"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Plus, Check, Star } from "lucide-react";
import {
  rateCafe,
  logVisit,
  unlogVisit,
  checkUserLoggedIn,
} from "@/app/actions";
import { useRouter, usePathname } from "next/navigation";

type LogVisitButtonProps = {
  shopId: number;
  isInitiallyVisited: boolean;
  initialRating: number | null;
  size?: "icon-sm" | "icon-lg";
};

export function LogVisitButton({
  shopId,
  isInitiallyVisited,
  initialRating,
  size = "icon-sm",
}: LogVisitButtonProps) {
  const [isLogging, setIsLogging] = useState(false);
  const [hasVisited, setHasVisited] = useState(isInitiallyVisited);
  const [isRating, setIsRating] = useState(false);
  const [rating, setRating] = useState(initialRating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setHasVisited(isInitiallyVisited);
    setRating(initialRating || 0);
  }, [isInitiallyVisited, initialRating]);

  const handleButtonClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (hasVisited) {
      // If already visited, unlog the visit
      setIsLogging(true);
      try {
        const result = await unlogVisit(shopId);
        if (result.success) {
          setHasVisited(false);
          setRating(0); // Reset rating when unlogging
          router.refresh();
        } else {
          console.error("Failed to unlog visit:", result.message);
        }
      } catch (error) {
        console.error("Error unlogging visit:", error);
      } finally {
        setIsLogging(false);
      }
    } else {
      // If not visited, check authentication status first
      setIsLogging(true);
      const authCheckResult = await checkUserLoggedIn();

      if (!authCheckResult.success) {
        setIsLogging(false);
        router.push(`/auth/login?redirect=${pathname}`);
      } else {
        // Mark as visited immediately
        try {
          const logResult = await logVisit(shopId);
          if (logResult.success) {
            setHasVisited(true);
            setIsRating(true); // Still open rating dialog for ranking
            router.refresh();
          } else {
            console.error("Failed to log visit:", logResult.message);
          }
        } catch (error) {
          console.error("Error logging visit:", error);
        } finally {
          setIsLogging(false);
        }
      }
    }
  };

  const handleSaveRating = async () => {
    setIsLogging(true);
    try {
      // Visit is already logged by now if we're in this dialog
      const result = await rateCafe(shopId, rating);

      if (result.success) {
        router.refresh(); // Re-fetch data and re-render
        setIsRating(false); // Close on success
      } else {
        if (result.message === "User not found") {
          router.push(`/auth/login?redirect=${pathname}`);
        } else {
          setIsRating(false); // Close on other errors
        }
      }
    } catch (error) {
      console.error("Error saving rating:", error);
      setIsRating(false); // Close on unexpected errors
    } finally {
      setIsLogging(false);
    }
  };

  const handleCancelRating = () => {
    setIsRating(false);
    setRating(initialRating || 0);
  };

  const iconSize = size === "icon-lg" ? "h-8 w-8" : "h-4 w-4";

  return (
    <>
      <Button
        variant="outline"
        size={size}
        className="rounded-full"
        onClick={handleButtonClick}
        disabled={isLogging}
      >
        {hasVisited ? (
          <Check className={iconSize} data-testid="check-icon" />
        ) : (
          <Plus className={iconSize} data-testid="plus-icon" />
        )}
      </Button>
      <Dialog open={isRating} onOpenChange={setIsRating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate your experience</DialogTitle>
            <DialogDescription>
              Rate your experience at this cafe to help others.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="h-8 w-8 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setRating(star);
                }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                fill={star <= (hoverRating || rating) ? "green" : "none"}
                stroke="currentColor"
                data-testid={`star-icon-${star}`}
              />
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleCancelRating();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleSaveRating();
              }}
              disabled={isLogging}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
