"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { submitCafeUpdates } from "@/app/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function UpdateForm({ shopId }: { shopId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [updates, setUpdates] = useState([
    { field_name: "", suggested_value: "" },
  ]);
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (index: number, name: string, value: string) => {
    setUpdates((prev) =>
      prev.map((u, i) =>
        i === index
          ? {
              ...u,
              [name]: value,
              ...(name === "field_name" ? { suggested_value: "" } : {}),
            }
          : u
      )
    );
  };

  const addField = () => {
    setUpdates((prev) => [...prev, { field_name: "", suggested_value: "" }]);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("cafe_id", shopId.toString());
      formData.append("updates", JSON.stringify(updates));

      await submitCafeUpdates({ message: "" }, formData);

      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
      setUpdates([{ field_name: "", suggested_value: "" }]);
      setIsOpen(false);
    } catch (err) {
      console.error("Error submitting updates:", err);
    }
  };

  const optionsMap: Record<string, string[]> = {
    Vibe: ["Minimalistic", "Cool", "Corporate", "Cozy", "Beachy", "Trendy"],
    Pricing: ["$", "$$", "$$$"],
    Busyness: ["Quiet", "Medium", "Very"],
    Seating: ["None", "Some", "Plenty"],
    Parking: ["Easy", "Medium", "Hard"],
    WiFi: ["Yes", "No"],
    Outlets: ["Yes", "No"],
    "Laptop Friendly": ["Yes", "No"],
  };

  return (
    <>
      {/* button to open up the form */}
      <Button variant="outline" onClick={() => setIsOpen(true)} className="mx-auto w-fit">
        Update Cafe Info
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">Update Cafe Info</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-4">
            {updates.map((update, index) => (
              <div key={index} className="flex flex-col gap-2 pb-4">
                <label className="text-sm font-medium">
                  What would you like to update?
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full mt-1">
                        {update.field_name || "Select a detail"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuRadioGroup
                        value={update.field_name}
                        onValueChange={(value) =>
                          handleChange(index, "field_name", value)
                        }
                      >
                        {Object.keys(optionsMap).map((field) => (
                          <DropdownMenuRadioItem key={field} value={field}>
                            {field}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </label>

                <label className="text-sm font-medium">
                  What’s the correct info?
                  {optionsMap[update.field_name] ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full mt-1"
                          disabled={!update.field_name}
                        >
                          {update.suggested_value || "Select a value"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuRadioGroup
                          value={update.suggested_value}
                          onValueChange={(value) =>
                            handleChange(index, "suggested_value", value)
                          }
                        >
                          {optionsMap[update.field_name].map((opt) => (
                            <DropdownMenuRadioItem key={opt} value={opt}>
                              {opt}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Input
                      type="text"
                      value={update.suggested_value}
                      onChange={(e) =>
                        handleChange(index, "suggested_value", e.target.value)
                      }
                      className="mt-1"
                      placeholder="Pick something above first"
                      disabled={!update.field_name}
                    />
                  )}
                </label>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={addField}>
              + Add another update
            </Button>
            <Button onClick={handleSubmit}>Submit</Button>
          </div>
        </DialogContent>
      </Dialog>

      {showPopup && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          <div className="bg-[#f8f5f0] text-neutral-800 px-8 py-4 rounded-xl shadow-lg border border-neutral-300">
            We’ve logged your update — thank you!
          </div>
        </div>
      )}
    </>
  );
}
