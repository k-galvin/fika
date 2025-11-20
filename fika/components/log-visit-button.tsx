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
import { rateCafe, logVisit } from "@/app/actions";
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

  const handleInitiateRating = () => {
    setIsRating(true);
  };

  const handleSaveRating = async () => {
    setIsLogging(true);
    try {
      let result;
      if (rating > 0) {
        result = await rateCafe(shopId, rating);
      } else {
        result = await logVisit(shopId);
      }

      if (result.success) {
        setHasVisited(true);
        setIsRating(false); // Close on success
      } else {
        if (result.message === "User not found") {
          router.push(`/auth/login?redirect=${pathname}`);
          // Don't close dialog, let the page redirect
        } else {
          setIsRating(false); // Close on other errors
        }
      }
    } catch {
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
        onClick={handleInitiateRating}
        disabled={isLogging}
      >
        {hasVisited || initialRating ? (
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
