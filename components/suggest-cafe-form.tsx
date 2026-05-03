"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useState, useRef, useEffect } from "react";
import { suggestCafe } from "@/app/actions";
import { Constants } from "@/lib/supabase/database.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Checkbox } from "./ui/checkbox";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { X, UploadCloud, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const initialState = {
  name: "",
  address: "",
  city: "",
  seating: "",
  parking: "",
  vibe: "",
  pricing: "",
  busyness: "",
  is_laptop_friendly: "no",
  has_wifi: "no",
  has_outlets: "no",
  wine_bar: "no",
};

interface SelectedFile {
  file: File;
  preview: string;
  id: string;
}

export function SuggestCafeForm({
  isOpen,
  onOpenChange,
  withDialog = true,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  withDialog?: boolean;
}) {
  const [formData, setFormData] = useState(initialState);
  const [pending, setPending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [message, setMessage] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    };
  }, [selectedFiles]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDropdownChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked ? "yes" : "no",
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setMessage("");

    try {
      const uploadedUrls: string[] = [];
      const supabase = createClient();

      // 1. Upload photos to storage first if any
      if (selectedFiles.length > 0) {
        for (const selectedFile of selectedFiles) {
          const { file } = selectedFile;
          const randomStr = Math.random().toString(36).substring(2, 8);
          const fileName = `${Date.now()}-${randomStr}-${file.name.replace(/\s+/g, "_")}`;
          const filePath = `suggestions/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("images")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from("images")
            .getPublicUrl(filePath);

          uploadedUrls.push(urlData.publicUrl);
        }
      }

      // 2. Submit form with photo URLs
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof typeof formData];
        data.append(key, String(value));
      });
      
      data.append("photo_urls", JSON.stringify(uploadedUrls));

      const result = await suggestCafe({ message: "" }, data);
      
      if (result.message === "Thank you for your suggestion!") {
        setFormData(initialState);
        setSelectedFiles([]);
        onOpenChange(false);
        setShowSuccessDialog(true);
      } else {
        setMessage(result.message);
      }
    } catch (err) {
      console.error("Error submitting suggestion:", err);
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setPending(false);
    }
  };

  const form = (
    <form
      data-testid="suggest-form"
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Cafe Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Blue Bottle Coffee"
            required
            className="handwritten-border !border-primary/10"
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street address and area"
            required
            className="handwritten-border !border-primary/10"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full mt-1 justify-start handwritten-border !border-primary/10">
                  {formData.city || "Select a city"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="font-kate">
                <DropdownMenuRadioGroup
                  value={formData.city}
                  onValueChange={(value) => handleDropdownChange("city", value)}
                >
                  {Constants.public.Enums.Cities.map((city) => (
                    <DropdownMenuRadioItem key={city} value={city}>
                      {city}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pricing">Pricing</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full mt-1 justify-start handwritten-border !border-primary/10">
                  {formData.pricing || "Select pricing"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="font-kate">
                <DropdownMenuRadioGroup
                  value={formData.pricing}
                  onValueChange={(value) => handleDropdownChange("pricing", value)}
                >
                  {Constants.public.Enums.Pricing.map((pricing) => (
                    <DropdownMenuRadioItem key={pricing} value={pricing}>
                      {pricing}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="vibe">Vibe</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full mt-1 justify-start handwritten-border !border-primary/10">
                  {formData.vibe || "Select vibe"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="font-kate">
                <DropdownMenuRadioGroup
                  value={formData.vibe}
                  onValueChange={(value) => handleDropdownChange("vibe", value)}
                >
                  {Constants.public.Enums.Vibe.map((vibe) => (
                    <DropdownMenuRadioItem key={vibe} value={vibe}>
                      {vibe}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="busyness">Busyness</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full mt-1 justify-start handwritten-border !border-primary/10">
                  {formData.busyness || "Select busyness"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="font-kate">
                <DropdownMenuRadioGroup
                  value={formData.busyness}
                  onValueChange={(value) => handleDropdownChange("busyness", value)}
                >
                  {Constants.public.Enums.Busyness.map((busyness) => (
                    <DropdownMenuRadioItem key={busyness} value={busyness}>
                      {busyness}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="seating">Seating</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full mt-1 justify-start handwritten-border !border-primary/10">
                  {formData.seating || "Select seating"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="font-kate">
                <DropdownMenuRadioGroup
                  value={formData.seating}
                  onValueChange={(value) => handleDropdownChange("seating", value)}
                >
                  {Constants.public.Enums["Seating Availability"].map((seating) => (
                    <DropdownMenuRadioItem key={seating} value={seating}>
                      {seating}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="parking">Parking</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full mt-1 justify-start handwritten-border !border-primary/10">
                  {formData.parking || "Select parking"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="font-kate">
                <DropdownMenuRadioGroup
                  value={formData.parking}
                  onValueChange={(value) => handleDropdownChange("parking", value)}
                >
                  {Constants.public.Enums["Parking Difficulty"].map((parking) => (
                    <DropdownMenuRadioItem key={parking} value={parking}>
                      {parking}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Multi-Photo Upload Section */}
        <div className="space-y-3 pt-2">
          <Label>Photos</Label>
          <div 
            onClick={() => !pending && fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
              selectedFiles.length > 0 ? "border-primary/20 bg-primary/5" : "border-primary/10 hover:bg-secondary/5",
              pending && "opacity-50 cursor-not-allowed"
            )}
          >
            <Input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={pending}
              className="hidden"
            />
            <UploadCloud className="size-6 text-primary/40" />
            <span className="text-sm font-bold text-primary/60">
              {selectedFiles.length > 0 ? "Add more photos" : "Upload photos of this spot"}
            </span>
          </div>

          {selectedFiles.length > 0 && (
            <div className="grid grid-cols-4 gap-2 pt-2">
              {selectedFiles.map((file) => (
                <div key={file.id} className="relative aspect-square rounded-lg overflow-hidden border border-primary/10 group">
                  <img src={file.preview} alt="Preview" className="w-full h-full object-cover" />
                  {!pending && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 items-center gap-x-4 gap-y-2 pt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_laptop_friendly"
              name="is_laptop_friendly"
              checked={formData.is_laptop_friendly === "yes"}
              onCheckedChange={(checked) =>
                handleCheckboxChange("is_laptop_friendly", checked as boolean)
              }
            />
            <Label htmlFor="is_laptop_friendly" className="ml-2">
              Laptop Friendly?
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_wifi"
              name="has_wifi"
              checked={formData.has_wifi === "yes"}
              onCheckedChange={(checked) =>
                handleCheckboxChange("has_wifi", checked as boolean)
              }
            />
            <Label htmlFor="has_wifi" className="ml-2">
              Wifi?
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_outlets"
              name="has_outlets"
              checked={formData.has_outlets === "yes"}
              onCheckedChange={(checked) =>
                handleCheckboxChange("has_outlets", checked as boolean)
              }
            />
            <Label htmlFor="has_outlets" className="ml-2">
              Outlets?
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="wine_bar"
              name="wine_bar"
              checked={formData.wine_bar === "yes"}
              onCheckedChange={(checked) =>
                handleCheckboxChange("wine_bar", checked as boolean)
              }
            />
            <Label htmlFor="wine_bar" className="ml-2">
              Wine Bar?
            </Label>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={pending} className="mt-4 font-kate font-bold text-lg h-12 handwritten-border !border-primary/20">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin mr-2" />
            Submitting...
          </>
        ) : (
          "Submit Suggestion"
        )}
      </Button>
    </form>
  );

  if (withDialog) {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto font-kate">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold text-primary tracking-tighter">Suggest a Cafe</DialogTitle>
              <DialogDescription className="italic text-primary/60">
                Help us discover more local gems.
              </DialogDescription>
            </DialogHeader>
            {form}
            {message && message !== "Thank you for your suggestion!" && (
              <p className="mt-4 text-sm text-red-500 font-kate text-center">{message}</p>
            )}
          </DialogContent>
        </Dialog>

        {/* New Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="font-kate">
            <DialogHeader>
              <DialogTitle className="text-4xl font-bold text-green-600 tracking-tighter">Success!</DialogTitle>
              <DialogDescription className="italic text-primary/60">
                Thank you for your suggestion! It has been submitted for review.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end">
              <Button 
                onClick={() => setShowSuccessDialog(false)}
                className="font-kate font-bold px-8 handwritten-border !border-primary/10"
              >
                OK
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="font-kate">
      {form}
      {message && message !== "Thank you for your suggestion!" && (
        <p className="mt-4 text-sm text-red-500 text-center">{message}</p>
      )}
    </div>
  );
}
