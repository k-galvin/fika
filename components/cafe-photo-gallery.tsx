"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { setPrimaryPhoto, denyPhoto } from "@/app/actions";
import { User } from "@supabase/supabase-js";
import { Trash2, Maximize2, Move } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhotoUploadModal } from "./photo-upload-modal";
import { SortablePhotoGallery } from "./admin/sortable-photo-gallery";

type ShopPhoto = {
  id: number;
  shop_id: number;
  photo_url: string;
  user_id: string;
  is_primary: boolean | null;
  is_approved: boolean | null;
  uploaded_at: string | null;
  sort_order?: number | null;
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [isRearranging, setIsRearranging] = useState(false);

  const isAdmin = userRole === "admin";
  const approvedPhotos = photos.filter((p) => p.is_approved);

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

  const handleDelete = (photoId: number, photoUrl: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    startTransition(async () => {
      const result = await denyPhoto(photoId, photoUrl);
      if (result.success) {
        toast.success("Photo deleted successfully!");
      } else {
        toast.error(result.message || "Failed to delete photo.");
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

  const getExpandedPhotoClass = (index: number) => {
    if (index === 0) return "md:col-start-1 md:row-start-1";
    if (index === 1) return "md:col-start-2 md:row-start-1";
    if (index === 2) return "md:col-start-1 md:row-start-2";
    if (index === 3) return "md:col-start-2 md:row-start-2";
    return "";
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-3xl font-bold font-kate text-primary tracking-tight">Gallery</h2>
        <div className="flex flex-wrap gap-2 items-center">
          {isAdmin && approvedPhotos.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsRearranging(true);
                setViewAllOpen(true);
              }}
              className="font-kate font-bold gap-2 handwritten-border !border-primary/10 hover:bg-primary/5 px-2 sm:px-4"
              title="Rearrange Photos"
            >
              <Move className="size-4" />
              <span className="hidden sm:inline">Rearrange</span>
            </Button>
          )}
          {approvedPhotos.length > 4 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewAllOpen(true)}
              className="font-kate font-bold gap-2 handwritten-border !border-primary/10 hover:bg-primary/5 px-2 sm:px-4"
              title="View All Photos"
            >
              <Maximize2 className="size-4" />
              <span className="hidden sm:inline">View All</span>
            </Button>
          )}
          {user && (
            <PhotoUploadModal shopId={shopId} user={user} />
          )}
        </div>
      </div>

      <div className="w-full aspect-square relative">
        {approvedPhotos.length > 0 ? (
          <div className={cn("grid gap-2 h-full w-full", getGridContainerClass(approvedPhotos.length))}>
            {approvedPhotos.slice(0, 4).map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => setViewAllOpen(true)}
                className={cn(
                  "relative rounded-xl overflow-hidden group handwritten-border !border-primary/10 shadow-md bg-secondary/5 transition-transform duration-500 hover:scale-[1.02] w-full h-full cursor-pointer",
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
                  <div 
                    className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="journal"
                      size="sm"
                      className="bg-background/90 text-primary border-primary/20"
                      onClick={() => handleSetPrimary(photo.id)}
                      disabled={isPending}
                    >
                      Set as Primary
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="bg-red-500 text-white h-8 w-8"
                      onClick={() => handleDelete(photo.id, photo.photo_url)}
                      disabled={isPending}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                )}
                
                {/* Overlay for more photos on the last visible slot */}
                {index === 3 && approvedPhotos.length > 4 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
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

      {/* View All / Rearrange Dialog */}
      <Dialog 
        open={viewAllOpen} 
        onOpenChange={(open) => {
          setViewAllOpen(open);
          if (!open) setIsRearranging(false);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto font-kate">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <DialogTitle className="text-3xl font-bold tracking-tighter">
              {isRearranging ? "Rearrange Photos" : "Photo Gallery"}
            </DialogTitle>
            {isAdmin && !isRearranging && approvedPhotos.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRearranging(true)}
                className="handwritten-border !border-primary/10"
              >
                <Move className="size-4 mr-2" />
                Rearrange
              </Button>
            )}
          </DialogHeader>

          {isRearranging ? (
            <SortablePhotoGallery
              shopId={shopId}
              initialPhotos={approvedPhotos}
              onSave={() => {
                setIsRearranging(false);
                router.refresh();
              }}
              onCancel={() => setIsRearranging(false)}
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4 grid-flow-row-dense">
              {approvedPhotos.map((photo, index) => (
                <div 
                  key={photo.id} 
                  className={cn(
                    "relative aspect-square rounded-xl overflow-hidden handwritten-border !border-primary/10 shadow-sm group bg-secondary/5",
                    getExpandedPhotoClass(index)
                  )}
                >
                  <Image
                    src={photo.photo_url}
                    alt="Gallery Photo"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {index < 4 && (
                    <div className="absolute top-2 right-2 z-10 pointer-events-none">
                      <Badge variant="secondary" className="bg-primary/80 text-white border-none scale-75 origin-top-right backdrop-blur-sm">
                        Grid View
                      </Badge>
                    </div>
                  )}
                  {photo.is_primary && (
                    <Badge variant="journal" className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm scale-75 origin-top-left z-10">
                      Primary
                    </Badge>
                  )}
                  {isAdmin && (
                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="journal"
                        size="sm"
                        className="bg-background/90 text-primary border-primary/20 scale-75"
                        onClick={() => handleSetPrimary(photo.id)}
                        disabled={isPending}
                      >
                        Set as Primary
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="bg-red-500 text-white h-7 w-7"
                        onClick={() => handleDelete(photo.id, photo.photo_url)}
                        disabled={isPending}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
