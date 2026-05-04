"use client";

import { useState, useRef } from "react";
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
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { uploadShopPhotosBatch } from "@/app/actions";
import { User } from "@supabase/supabase-js";
import { Plus, X, UploadCloud, Image as ImageIcon } from "lucide-react";

interface PhotoUploadModalProps {
  shopId: number;
  user: User | null;
}

interface SelectedFile {
  file: File;
  preview: string;
  id: string;
}

export function PhotoUploadModal({ shopId, user }: PhotoUploadModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles: SelectedFile[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substring(7),
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (id: string) => {
    const fileToRemove = selectedFiles.find((f) => f.id === id);
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpload = async () => {
    if (!user || selectedFiles.length === 0) return;

    setUploading(true);
    const supabase = createClient();
    const uploadedUrls: string[] = [];
    const failedFiles: string[] = [];

    try {
      // 1. Upload files to storage one by one
      for (const selectedFile of selectedFiles) {
        const { file } = selectedFile;
        // Ensure filename is unique even if selected multiple times or with same name
        const randomStr = Math.random().toString(36).substring(2, 8);
        const fileName = `${Date.now()}-${randomStr}-${file.name.replace(/\s+/g, "_")}`;
        const filePath = `${shopId}/${fileName}`;

        try {
          const { error: uploadError } = await supabase.storage
            .from("images")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from("images")
            .getPublicUrl(filePath);

          uploadedUrls.push(urlData.publicUrl);
        } catch (err) {
          console.error(`Storage upload failed for ${file.name}:`, err);
          failedFiles.push(file.name);
        }
      }

      // 2. Batch register successful uploads in database
      if (uploadedUrls.length > 0) {
        const result = await uploadShopPhotosBatch(shopId, uploadedUrls, user.id);

        if (result.success) {
          if (failedFiles.length === 0) {
            toast.success(`Successfully uploaded ${uploadedUrls.length} photo${uploadedUrls.length > 1 ? "s" : ""}!`, {
              description: "They will be visible in the gallery after a quick review by our team.",
              duration: 6000,
            });
            handleClose();
          } else {
            toast.success(`Uploaded ${uploadedUrls.length} photo${uploadedUrls.length > 1 ? "s" : ""}.`, {
              description: "Review pending for successful uploads.",
            });
            toast.error(`Failed: ${failedFiles.join(", ")}`);
            // Update selected files to only show failed ones
            setSelectedFiles(prev => prev.filter(sf => failedFiles.includes(sf.file.name)));
          }
        } else {
          toast.error(result.message || "Failed to register photos in database.");
        }
      } else if (failedFiles.length > 0) {
        toast.error("All uploads failed. Please try again.");
      }
    } catch (error) {
      console.error("Batch upload process error:", error);
      toast.error("An unexpected error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    setSelectedFiles([]);
    setOpen(false);
    setUploading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => (val ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="font-kate font-bold gap-2 handwritten-border !border-primary/10 hover:bg-primary/5 px-2 sm:px-4"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Add Photos</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="font-kate max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tighter">Share Your Experience</DialogTitle>
          <DialogDescription className="italic text-primary/60">
            Select one or more photos to contribute to this spot&apos;s journal.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div 
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer
              transition-colors duration-200
              ${selectedFiles.length > 0 ? 'border-primary/20 bg-primary/5' : 'border-primary/10 hover:border-primary/30 hover:bg-secondary/5'}
              ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <Input
              id="photo-input"
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={uploading}
              data-testid="file-input"
              className="hidden"
            />
            <div className="bg-background p-3 rounded-full shadow-sm">
              <UploadCloud className="size-6 text-primary/60" />
            </div>
            <div className="text-center">
              <p className="font-bold text-primary/80">Click to select photos</p>
              <p className="text-xs text-primary/40 mt-1">High-quality JPG, PNG, or WebP</p>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <h3 className="font-bold text-sm uppercase tracking-widest text-primary/60">Review Uploads ({selectedFiles.length})</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedFiles([])}
                  disabled={uploading}
                  className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 h-7"
                >
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1">
                {selectedFiles.map((file) => (
                  <div key={file.id} className="relative aspect-square rounded-xl overflow-hidden group border border-primary/10 shadow-sm">
                    <img 
                      src={file.preview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    {!uploading && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                        className="absolute top-1.5 right-1.5 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {selectedFiles.length === 0 && (
             <div className="flex flex-col items-center justify-center py-12 text-primary/20">
                <ImageIcon className="size-12 mb-2 opacity-50" />
                <p className="italic">No photos selected yet.</p>
             </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={uploading}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className="flex-1 sm:flex-none handwritten-border !border-primary/20 bg-primary text-primary-foreground"
          >
            {uploading ? (
              <>Uploading...</>
            ) : (
              <>Upload {selectedFiles.length > 0 ? `${selectedFiles.length} Photo${selectedFiles.length > 1 ? "s" : ""}` : "Photos"}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
