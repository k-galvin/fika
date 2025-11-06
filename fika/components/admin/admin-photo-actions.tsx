// components/admin/admin-photo-actions.tsx
"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { approvePhoto, denyPhoto } from "@/app/actions"; // Import server actions

type AdminPhotoActionsProps = {
  photoId: number;
  photoUrl: string;
};

export function AdminPhotoActions({ photoId, photoUrl }: AdminPhotoActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approvePhoto(photoId);
      if (result.success) {
        toast.success("Photo approved successfully!");
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
      } else {
        toast.error(result.message || "Failed to deny photo.");
      }
    });
  };

  return (
    <div className="flex gap-2 mt-auto">
      <Button onClick={handleApprove} disabled={isPending}>
        Approve
      </Button>
      <Button variant="destructive" onClick={handleDeny} disabled={isPending}>
        Deny
      </Button>
    </div>
  );
}
