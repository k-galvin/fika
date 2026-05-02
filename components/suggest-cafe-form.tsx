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
import { useState } from "react";
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

const initialState = {
  name: "",
  address: "",
  description: "",
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
  const [message, setMessage] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false); // New state for success dialog

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

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      const value = formData[key as keyof typeof formData];
      data.append(key, String(value));
    });

    const result = await suggestCafe({ message: "" }, data);
    setMessage(result.message);
    setPending(false);

    if (result.message === "Thank you for your suggestion!") {
      setFormData(initialState);
      onOpenChange(false); // Close the main form dialog
      setShowSuccessDialog(true); // Open the success dialog
    }
  };

  const form = (
    <form
      data-testid="suggest-form"
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      <Label htmlFor="name">Cafe Name</Label>
      <Input
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <Label htmlFor="address">Address</Label>
      <Input
        id="address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        required
      />
      <Label htmlFor="description">Description</Label>
      <Input
        id="description"
        name="description"
        value={formData.description}
        onChange={handleChange}
      />

      <Label htmlFor="city">City</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full mt-1 justify-start">
            {formData.city || "Select a city"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
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

      <Label htmlFor="seating">Seating</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full mt-1 justify-start">
            {formData.seating || "Select seating"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
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

      <Label htmlFor="parking">Parking</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full mt-1 justify-start">
            {formData.parking || "Select parking"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
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

      <Label htmlFor="vibe">Vibe</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full mt-1 justify-start">
            {formData.vibe || "Select vibe"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
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

      <Label htmlFor="pricing">Pricing</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full mt-1 justify-start">
            {formData.pricing || "Select pricing"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
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

      <Label htmlFor="busyness">Busyness</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full mt-1 justify-start">
            {formData.busyness || "Select busyness"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
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

      <div className="grid grid-cols-2 items-center gap-x-4 gap-y-2">
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

      <Button type="submit" aria-disabled={pending}>
        {pending ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );

  if (withDialog) {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Suggest a Cafe</DialogTitle>
              <DialogDescription>
                Fill out the form below to suggest a new cafe for our list.
              </DialogDescription>
            </DialogHeader>
            {form}
            {message && message !== "Thank you for your suggestion!" && (
              <p className="mt-4 text-sm text-red-500">{message}</p>
            )}
          </DialogContent>
        </Dialog>

        {/* New Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-green-600">Success!</DialogTitle>
              <DialogDescription>
                Thank you for your suggestion! It has been submitted for review.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end">
              <Button onClick={() => setShowSuccessDialog(false)}>OK</Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      {form}
      {message && message !== "Thank you for your suggestion!" && (
        <p className="mt-4 text-sm text-red-500">{message}</p>
      )}
    </>
  );
}
