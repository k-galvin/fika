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
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
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

  withDialog = true,

}: {

  isOpen: boolean;

  onOpenChange: (isOpen: boolean) => void;

  withDialog?: boolean;

}) {

  const [state, formAction] = useActionState(suggestCafe, initialState);

  const [city, setCity] = useState("");

  const [seating, setSeating] = useState("");

  const [parking, setParking] = useState("");

  const [vibe, setVibe] = useState("");

  const [pricing, setPricing] = useState("");

  const [busyness, setBusyness] = useState("");



  const form = (

    <form

      data-testid="suggest-form"

      action={formAction}

      className="flex flex-col gap-4"

    >

      <Label htmlFor="name">Cafe Name</Label>

      <Input id="name" name="name" required />

      <Label htmlFor="address">Address</Label>

      <Input id="address" name="address" required />

      <Label htmlFor="description">Description</Label>

      <Input id="description" name="description" />



      <Label htmlFor="city">City</Label>

      <DropdownMenu>

        <DropdownMenuTrigger asChild>

          <Button variant="outline" className="w-full mt-1 justify-start">

            {city || "Select a city"}

          </Button>

        </DropdownMenuTrigger>

        <DropdownMenuContent>

          <DropdownMenuRadioGroup value={city} onValueChange={setCity}>

            {Constants.public.Enums.Cities.map((city) => (

              <DropdownMenuRadioItem key={city} value={city}>

                {city}

              </DropdownMenuRadioItem>

            ))}

          </DropdownMenuRadioGroup>

        </DropdownMenuContent>

      </DropdownMenu>

      <Input type="hidden" name="city" value={city} />



      <Label htmlFor="seating">Seating</Label>

      <DropdownMenu>

        <DropdownMenuTrigger asChild>

          <Button variant="outline" className="w-full mt-1 justify-start">

            {seating || "Select seating"}

          </Button>

        </DropdownMenuTrigger>

        <DropdownMenuContent>

          <DropdownMenuRadioGroup

            value={seating}

            onValueChange={setSeating}

          >

            {Constants.public.Enums["Seating Availability"].map(

              (seating) => (

                <DropdownMenuRadioItem key={seating} value={seating}>

                  {seating}

                </DropdownMenuRadioItem>

              )

            )}

          </DropdownMenuRadioGroup>

        </DropdownMenuContent>

      </DropdownMenu>

      <Input type="hidden" name="seating" value={seating} />



      <Label htmlFor="parking">Parking</Label>

      <DropdownMenu>

        <DropdownMenuTrigger asChild>

          <Button variant="outline" className="w-full mt-1 justify-start">

            {parking || "Select parking"}

          </Button>

        </DropdownMenuTrigger>

        <DropdownMenuContent>

          <DropdownMenuRadioGroup

            value={parking}

            onValueChange={setParking}

          >

            {Constants.public.Enums["Parking Difficulty"].map((parking) => (

              <DropdownMenuRadioItem key={parking} value={parking}>

                {parking}

              </DropdownMenuRadioItem>

            ))}

          </DropdownMenuRadioGroup>

        </DropdownMenuContent>

      </DropdownMenu>

      <Input type="hidden" name="parking" value={parking} />



      <Label htmlFor="vibe">Vibe</Label>

      <DropdownMenu>

        <DropdownMenuTrigger asChild>

          <Button variant="outline" className="w-full mt-1 justify-start">

            {vibe || "Select vibe"}

          </Button>

        </DropdownMenuTrigger>

        <DropdownMenuContent>

          <DropdownMenuRadioGroup value={vibe} onValueChange={setVibe}>

            {Constants.public.Enums.Vibe.map((vibe) => (

              <DropdownMenuRadioItem key={vibe} value={vibe}>

                {vibe}

              </DropdownMenuRadioItem>

            ))}

          </DropdownMenuRadioGroup>

        </DropdownMenuContent>

      </DropdownMenu>

      <Input type="hidden" name="vibe" value={vibe} />



      <Label htmlFor="pricing">Pricing</Label>

      <DropdownMenu>

        <DropdownMenuTrigger asChild>

          <Button variant="outline" className="w-full mt-1 justify-start">

            {pricing || "Select pricing"}

          </Button>

        </DropdownMenuTrigger>

        <DropdownMenuContent>

          <DropdownMenuRadioGroup

            value={pricing}

            onValueChange={setPricing}

          >

            {Constants.public.Enums.Pricing.map((pricing) => (

              <DropdownMenuRadioItem key={pricing} value={pricing}>

                {pricing}

              </DropdownMenuRadioItem>

            ))}

          </DropdownMenuRadioGroup>

        </DropdownMenuContent>

      </DropdownMenu>

      <Input type="hidden" name="pricing" value={pricing} />



      <Label htmlFor="busyness">Busyness</Label>

      <DropdownMenu>

        <DropdownMenuTrigger asChild>

          <Button variant="outline" className="w-full mt-1 justify-start">

            {busyness || "Select busyness"}

          </Button>

        </DropdownMenuTrigger>

        <DropdownMenuContent>

          <DropdownMenuRadioGroup

            value={busyness}

            onValueChange={setBusyness}

          >

            {Constants.public.Enums.Busyness.map((busyness) => (

              <DropdownMenuRadioItem key={busyness} value={busyness}>

                {busyness}

              </DropdownMenuRadioItem>

            ))}

          </DropdownMenuRadioGroup>

        </DropdownMenuContent>

      </DropdownMenu>

      <Input type="hidden" name="busyness" value={busyness} />



      <div className="grid grid-cols-2 items-center gap-x-4 gap-y-2">

        <div className="flex items-center space-x-2">

          <Checkbox id="is_laptop_friendly" name="is_laptop_friendly" />

          <Label htmlFor="is_laptop_friendly" className="ml-2">

            Laptop Friendly?

          </Label>

        </div>

        <div className="flex items-center space-x-2">

          <Checkbox id="has_wifi" name="has_wifi" />

          <Label htmlFor="has_wifi" className="ml-2">

            Wifi?

          </Label>

        </div>

        <div className="flex items-center space-x-2">

          <Checkbox id="has_outlets" name="has_outlets" />

          <Label htmlFor="has_outlets" className="ml-2">

            Outlets?

          </Label>

        </div>

        <div className="flex items-center space-x-2">

          <Checkbox id="wine_bar" name="wine_bar" />

          <Label htmlFor="wine_bar" className="ml-2">

            Wine Bar?

          </Label>

        </div>

      </div>



      <SubmitButton />

    </form>

  );



  if (withDialog) {

    return (

      <Dialog open={isOpen} onOpenChange={onOpenChange}>

        <DialogContent className="max-h-[90vh] overflow-y-auto">

          <DialogHeader>

            <DialogTitle>Suggest a Cafe</DialogTitle>

            <DialogDescription>

              Fill out the form below to suggest a new cafe for our list.

            </DialogDescription>

          </DialogHeader>

          {form}

          {state?.message && <p>{state.message}</p>}

        </DialogContent>

      </Dialog>

    );

  }



  return (

    <>

      {form}

      {state?.message && <p>{state.message}</p>}

    </>

  );

}
