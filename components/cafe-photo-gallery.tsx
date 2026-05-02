"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { uploadShopPhoto, setPrimaryPhoto } from "@/app/actions";
import { User } from "@supabase/supabase-js";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type ShopPhoto = {
  id: number;
  shop_id: number;
  photo_url: string;
  user_id: string;
  is_primary: boolean | null;
  is_approved: boolean | null;
  uploaded_at: string | null;
};

type CafePhotoGalleryProps = {
  shopId: number;
  photos: ShopPhoto[];
  user: User | null;
  userRole: "user" | "admin" | null;
};

export function CafePhotoGallery({
  shopId,
  photos,
  user,
  userRole,
}: CafePhotoGalleryProps) {
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = userRole === "admin";
  const approvedPhotos = photos.filter((p) => p.is_approved);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const supabase = createClient();

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${shopId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      const result = await uploadShopPhoto(shopId, urlData.publicUrl, user.id);

      if (result.success) {
        toast.success("Photo uploaded successfully!");
        setUploadModalOpen(false);
      } else {
        toast.error(result.message || "Failed to save photo record.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Error uploading photo.");
    } finally {
      setUploading(false);
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

  // Helper to determine grid classes based on photo count
  const getGridContainerClass = (count: number) => {
    if (count === 1) return "grid-cols-1 grid-rows-1";
    if (count === 2) return "grid-cols-2 grid-rows-1";
    if (count === 3) return "grid-cols-2 grid-rows-2";
    return "grid-cols-2 grid-rows-2"; // 4 or more
  };

  const getPhotoClass = (index: number, count: number) => {
    if (count === 3 && index === 0) return "row-span-2";
    return "";
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold font-kate text-primary tracking-tight">Gallery</h2>
        {user && (
          <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="font-kate font-bold gap-2 handwritten-border !border-primary/10 hover:bg-primary/5">
                <Plus className="size-4" />
                Add Photo
              </Button>
            </DialogTrigger>
            <DialogContent className="font-kate">
              <DialogHeader>
                <DialogTitle>Share a Moment</DialogTitle>
                <DialogDescription>
                  Upload a photo of this spot for the journal.
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
                  className="handwritten-border !border-primary/10"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
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

      <div className="w-full aspect-square relative">
        {approvedPhotos.length > 0 ? (
          <div className={cn("grid gap-2 h-full w-full", getGridContainerClass(approvedPhotos.length))}>
            {approvedPhotos.slice(0, 4).map((photo, index) => (
              <div
                key={photo.id}
                className={cn(
                  "relative rounded-xl overflow-hidden group handwritten-border !border-primary/10 shadow-md bg-secondary/5 transition-transform duration-500 hover:scale-[1.02] w-full h-full",
                  getPhotoClass(index, approvedPhotos.length)
                )}
              >
                <Image
                  src={photo.photo_url}
                  alt={`Photo of ${shopId}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                {photo.is_primary && (
                  <Badge variant="journal" className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm">
                    Primary
                  </Badge>
                )}
                {isAdmin && (
                  <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="journal"
                      size="sm"
                      className="bg-background/90 text-primary border-primary/20"
                      onClick={() => handleSetPrimary(photo.id)}
                      disabled={isPending}
                    >
                      Set as Primary
                    </Button>
                  </div>
                )}
                
                {/* Overlay for more photos on the last visible slot */}
                {index === 3 && approvedPhotos.length > 4 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                    <span className="font-kate font-bold text-white text-2xl">+{approvedPhotos.length - 3}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/5 rounded-2xl border-2 border-dashed border-primary/10">
            <p className="font-kate italic text-primary/40 p-4 text-center">
              No approved photos yet. <br />Be the first to contribute to this spot!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
