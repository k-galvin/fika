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

  const handleButtonClick = async () => {
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
      setIsLogging(false);

      if (!authCheckResult.success) {
        router.push(`/auth/login?redirect=${pathname}`);
      } else {
        // User is logged in, open rating dialog
        setIsRating(true);
      }
    }
  };

  const handleSaveRating = async () => {
    setIsLogging(true);
    try {
      let result;
      // It's possible the user logged in, came back, and now wants to log/rate.
      // If they haven't visited yet, log the visit first.
      if (!hasVisited) {
        const logResult = await logVisit(shopId);
        if (!logResult.success) {
          // Handle error if logging visit fails
          console.error(
            "Failed to log visit before rating:",
            logResult.message
          );
          setIsRating(false);
          setIsLogging(false);
          return;
        }
        setHasVisited(true); // Update state to reflect visit logged
      }

      // Now, rate the cafe if a rating is provided
      if (rating > 0) {
        result = await rateCafe(shopId, rating);
      } else {
        // If no rating and they just logged visit (which is handled above),
        // we can just close the dialog.
        result = { success: true };
      }

      if (result.success) {
        router.refresh(); // Re-fetch data and re-render
        setIsRating(false); // Close on success
      } else {
        if (result.message === "User not found") {
          // This should ideally not be reached due to early auth check in handleButtonClick
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
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                fill={star <= (hoverRating || rating) ? "green" : "none"}
                stroke="currentColor"
                data-testid={`star-icon-${star}`}
              />
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={handleCancelRating}>
              Cancel
            </Button>
            <Button onClick={handleSaveRating} disabled={isLogging}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
