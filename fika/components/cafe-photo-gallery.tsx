// components/cafe-photo-gallery.tsx
"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { uploadShopPhoto, setPrimaryPhoto } from "@/app/actions";
import { User } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase/database.types";
import { toast } from "sonner"; // Assuming sonner is used for notifications
import { Badge } from "@/components/ui/badge";

type ShopPhoto = Database["public"]["Tables"]["shop_photos"]["Row"];

type CafePhotoGalleryProps = {
  shopId: number;
  photos: ShopPhoto[];
  user: User | null;
  userRole: "user" | "admin" | null; // New prop
};

import { ChevronLeft, ChevronRight } from "lucide-react";

// ... (imports remain the same)

export function CafePhotoGallery({
  shopId,
  photos,
  user,
  userRole, // Destructure new prop
}: CafePhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = userRole === "admin"; // Use userRole instead of user?.user_metadata?.role

  // Filter photos to only show approved ones
  const approvedPhotos = photos.filter(photo => photo.is_approved);

  // Adjust currentIndex if it's out of bounds after filtering
  useEffect(() => {
    if (currentIndex >= approvedPhotos.length && approvedPhotos.length > 0) {
      setCurrentIndex(approvedPhotos.length - 1);
    } else if (approvedPhotos.length === 0) {
      setCurrentIndex(0);
    }
  }, [approvedPhotos, currentIndex]);


  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();

    const filePath = `${shopId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("images")
      .upload(filePath, file);

    if (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload photo.");
      setUploading(false);
      return;
    }

    const publicUrl = supabase.storage
      .from("images")
      .getPublicUrl(filePath).data.publicUrl;

    console.log("Generated public URL:", publicUrl); // Add this line

    if (user) {
      startTransition(async () => {
        const result = await uploadShopPhoto(shopId, publicUrl, user.id);
        if (result.success) {
          toast.success("Photo uploaded successfully!");
          setUploadModalOpen(false);
        } else {
          toast.error(result.message || "Failed to add photo to database.");
        }
        setUploading(false);
      });
    }
  };

  const handleSetPrimary = (photoId: number) => {
    startTransition(async () => {
      const result = await setPrimaryPhoto(photoId, shopId);
      if (result.success) {
        toast.success("Primary photo updated!");
      } else {
        toast.error(result.message || "Failed to set primary photo.");
      }
    });
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % approvedPhotos.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + approvedPhotos.length) % approvedPhotos.length
    );
  };

  return (
    <div className="w-full flex flex-col gap-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-3xl font-bold font-kate">Cafe Photos</h2>
              {user && (
                <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Add Photo</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Photo</DialogTitle>
                      <DialogDescription>
                        Upload a photo of this cafe.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Input
                                          id="picture"
                                          type="file"
                                          accept="image/*"
                                          ref={fileInputRef}
                                          onChange={handleFileUpload}
                                          disabled={uploading || isPending}
                                          data-testid="file-input"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        onClick={() => setUploadModalOpen(false)}
                        disabled={uploading || isPending}
                      >
                        Cancel
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
      {/* Photo Carousel */}
      {approvedPhotos.length > 0 ? (
        <div className="relative w-1/3 aspect-square rounded-md overflow-hidden group">
          <Image
            src={approvedPhotos[currentIndex].photo_url}
            alt={`Photo of ${shopId}`}
            fill
            className="object-cover"
          />
          {approvedPhotos[currentIndex].is_primary && (
            <Badge className="absolute top-2 left-2">Primary</Badge>
          )}
          {isAdmin && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                onClick={() => handleSetPrimary(approvedPhotos[currentIndex].id)}
                disabled={isPending}
              >
                Set as Primary
              </Button>
            </div>
          )}
          {approvedPhotos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2"
                onClick={handlePrev}
                data-testid="prev-button"
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={handleNext}
                data-testid="next-button"
              >
                <ChevronRight />
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-md">
          <p className="text-center text-gray-500">
            No photos yet. Be the first to upload one!
          </p>
        </div>
      )}
    </div>
  );
}
