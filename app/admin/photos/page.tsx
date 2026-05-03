"use client";

import { useEffect, useState, useTransition } from "react";
import { getUnapprovedPhotos, approvePhotosBatch, denyPhotosBatch } from "@/app/actions";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPhotoActions } from "@/components/admin/admin-photo-actions";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import Link from "next/link";
import { ChevronLeft, CheckSquare, Square, Check, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// Local type for unapproved photo
type UnapprovedPhoto = {
  id: number;
  photo_url: string;
  coffee_shops: { name: string } | null;
  profiles: { username: string } | null;
};

export default function AdminPhotosPage() {
  const [unapprovedPhotos, setUnapprovedPhotos] = useState<UnapprovedPhoto[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchPhotos = async () => {
    setLoading(true);
    const photos = await getUnapprovedPhotos();
    if (photos) {
      setUnapprovedPhotos(photos as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === unapprovedPhotos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(unapprovedPhotos.map((p) => p.id));
    }
  };

  const handleBatchApprove = () => {
    if (selectedIds.length === 0) return;

    startTransition(async () => {
      const result = await approvePhotosBatch(selectedIds);
      if (result.success) {
        toast.success(`Approved ${selectedIds.length} photos!`);
        setSelectedIds([]);
        fetchPhotos();
      } else {
        toast.error(result.message || "Failed to approve photos.");
      }
    });
  };

  const handleBatchDeny = () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} photos?`)) return;

    startTransition(async () => {
      const photosToDeny = unapprovedPhotos
        .filter((p) => selectedIds.includes(p.id))
        .map((p) => ({ id: p.id, url: p.photo_url }));

      const result = await denyPhotosBatch(photosToDeny);
      if (result.success) {
        toast.success(`Deleted ${selectedIds.length} photos.`);
        setSelectedIds([]);
        fetchPhotos();
      } else {
        toast.error(result.message || "Failed to delete photos.");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading photos...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 md:gap-12 items-center p-8 max-w-6xl mx-auto pb-32">
      <div className="w-full flex flex-col gap-4">
        <Link 
          href="/admin" 
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-4xl font-bold font-kate">Manage Photos</h1>
          {unapprovedPhotos.length > 0 && (
            <Button 
              variant="outline" 
              onClick={toggleSelectAll}
              className="font-kate font-bold gap-2 self-start md:self-auto"
            >
              {selectedIds.length === unapprovedPhotos.length ? (
                <CheckSquare className="size-4" />
              ) : (
                <Square className="size-4" />
              )}
              {selectedIds.length === unapprovedPhotos.length ? "Deselect All" : "Select All"}
            </Button>
          )}
        </div>
      </div>

      {unapprovedPhotos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {unapprovedPhotos.map((photo) => (
            <Card 
              key={photo.id} 
              className={`flex flex-col transition-all border-2 ${selectedIds.includes(photo.id) ? 'border-primary shadow-md' : 'border-transparent'}`}
            >
              <CardHeader className="relative">
                <div className="absolute top-4 right-4 z-20">
                  <Checkbox 
                    checked={selectedIds.includes(photo.id)}
                    onCheckedChange={() => toggleSelect(photo.id)}
                    className="size-5 border-2"
                  />
                </div>
                <CardTitle className="text-xl font-kate pr-8 truncate">
                  {photo.coffee_shops?.name || "Unknown Cafe"}
                </CardTitle>
                <p className="text-sm text-muted-foreground italic">
                  Uploaded by {photo.profiles?.username || "Unknown"}
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <div 
                  className="relative w-full h-48 rounded-xl overflow-hidden bg-muted cursor-pointer group"
                  onClick={() => toggleSelect(photo.id)}
                >
                  <Image
                    src={photo.photo_url}
                    alt="Review Photo"
                    fill
                    className="object-contain"
                  />
                  <div className={`absolute inset-0 bg-primary/10 transition-opacity ${selectedIds.includes(photo.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                </div>
                <AdminPhotoActions
                  photoId={photo.id}
                  photoUrl={photo.photo_url}
                  onSuccess={fetchPhotos}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <AdminEmptyState 
          message="No photos awaiting approval" 
          description="Everything is up to date! Check back later for new photo submissions."
        />
      )}

      {/* Batch Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl animate-in slide-in-from-bottom-8 duration-300">
          <div className="bg-background/80 backdrop-blur-md border-2 border-primary/20 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="font-kate font-bold text-lg leading-none">
                {selectedIds.length} Photo{selectedIds.length > 1 ? 's' : ''} Selected
              </span>
              <button 
                onClick={() => setSelectedIds([])}
                className="text-xs text-muted-foreground hover:text-primary text-left transition-colors"
              >
                Clear selection
              </button>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleBatchApprove} 
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700 text-white font-kate font-bold px-6"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : (
                  <Check className="size-4 mr-2" />
                )}
                Approve
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleBatchDeny} 
                disabled={isPending}
                className="font-kate font-bold px-6"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="size-4 mr-2" />
                )}
                Deny
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
