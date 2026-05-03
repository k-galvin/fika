// components/admin/admin-photo-actions.tsx
"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { approvePhoto, denyPhoto } from "@/app/actions"; // Import server actions
import { Loader2, Check, Trash2 } from "lucide-react";

type AdminPhotoActionsProps = {
  photoId: number;
  photoUrl: string;
  onSuccess?: () => void;
};

export function AdminPhotoActions({ photoId, photoUrl, onSuccess }: AdminPhotoActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approvePhoto(photoId);
      if (result.success) {
        toast.success("Photo approved successfully!");
        onSuccess?.();
      } else {
        toast.error(result.message || "Failed to approve photo.");
      }
    });
  };

  const handleDeny = () => {
    startTransition(async () => {
      const result = await denyPhoto(photoId, photoUrl);
      if (result.success) {
        toast.success("Photo denied and deleted.");
        onSuccess?.();
      } else {
        toast.error(result.message || "Failed to deny photo.");
      }
    });
  };

  return (
    <div className="flex gap-2 mt-auto">
      <Button 
        onClick={handleApprove} 
        disabled={isPending}
        className="flex-1 bg-green-600 hover:bg-green-700"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Check className="w-4 h-4 mr-2" />
        )}
        Approve
      </Button>
      <Button 
        variant="destructive" 
        onClick={handleDeny} 
        disabled={isPending}
        className="flex-1"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Trash2 className="w-4 h-4 mr-2" />
        )}
        Deny
      </Button>
    </div>
  );
}
