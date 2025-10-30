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
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { suggestCafe } from "@/app/actions";
import { Constants } from "@/lib/supabase/database.types";

const initialState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" aria-disabled={pending}>
      {pending ? "Submitting..." : "Submit"}
    </Button>
  );
}

export function SuggestCafeForm({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const [state, formAction] = useActionState(suggestCafe, initialState);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Suggest a Cafe</DialogTitle>
          <DialogDescription>
            Fill out the form below to suggest a new cafe for our list.
          </DialogDescription>
        </DialogHeader>
        <form data-testid="suggest-form" action={formAction} className="flex flex-col gap-4">
          <Label htmlFor="name">Cafe Name</Label>
          <Input id="name" name="name" required />
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" required />
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" />

          <Label htmlFor="city">City</Label>
          <select id="city" name="city" required className="border p-2 rounded-md">
            {Constants.public.Enums.Cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <Label htmlFor="seating">Seating</Label>
          <select id="seating" name="seating" className="border p-2 rounded-md">
            {Constants.public.Enums["Seating Availability"].map((seating) => (
              <option key={seating} value={seating}>
                {seating}
              </option>
            ))}
          </select>

          <Label htmlFor="parking">Parking</Label>
          <select id="parking" name="parking" className="border p-2 rounded-md">
            {Constants.public.Enums["Parking Difficulty"].map((parking) => (
              <option key={parking} value={parking}>
                {parking}
              </option>
            ))}
          </select>

          <Label htmlFor="vibe">Vibe</Label>
          <select id="vibe" name="vibe" className="border p-2 rounded-md">
            {Constants.public.Enums.Vibe.map((vibe) => (
              <option key={vibe} value={vibe}>
                {vibe}
              </option>
            ))}
          </select>

          <Label htmlFor="pricing">Pricing</Label>
          <select id="pricing" name="pricing" className="border p-2 rounded-md">
            {Constants.public.Enums.Pricing.map((pricing) => (
              <option key={pricing} value={pricing}>
                {pricing}
              </option>
            ))}
          </select>

          <Label htmlFor="busyness">Busyness</Label>
          <select id="busyness" name="busyness" className="border p-2 rounded-md">
            {Constants.public.Enums.Busyness.map((busyness) => (
              <option key={busyness} value={busyness}>
                {busyness}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-x-4 gap-y-2">
            <Input
              type="checkbox"
              id="is_laptop_friendly"
              name="is_laptop_friendly"
            />
            <Label htmlFor="is_laptop_friendly">Laptop Friendly?</Label>

            <Input type="checkbox" id="has_wifi" name="has_wifi" />
            <Label htmlFor="has_wifi">Wifi?</Label>

            <Input type="checkbox" id="has_outlets" name="has_outlets" />
            <Label htmlFor="has_outlets">Outlets?</Label>

            <Input type="checkbox" id="wine_bar" name="wine_bar" />
            <Label htmlFor="wine_bar">Wine Bar?</Label>
          </div>

          <SubmitButton />
        </form>
        {state?.message && <p>{state.message}</p>}
      </DialogContent>
    </Dialog>
  );
}