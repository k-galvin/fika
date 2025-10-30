"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceRoleClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { SuggestedCafe, UserSavedCafe, UserVisit } from "@/lib/types"; // Import new types

// --- Cafe Suggestion Actions ---

// Helper to convert empty strings to null
function getFormValue(value: FormDataEntryValue | null): string | null {
  if (typeof value === "string" && value.trim() !== "") {
    return value;
  }
  return null;
}

export async function suggestCafe(
  _prevState: { message: string },
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be logged in to suggest a cafe." };
  }

  const { error } = await supabase.from("suggested_cafes").insert([
    {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      description: getFormValue(formData.get("description")),
      city: formData.get("city") as string,
      seating: getFormValue(formData.get("seating")),
      parking: getFormValue(formData.get("parking")),
      vibe: getFormValue(formData.get("vibe")),
      pricing: getFormValue(formData.get("pricing")),
      busyness: getFormValue(formData.get("busyness")),
      is_laptop_friendly: formData.get("is_laptop_friendly") === "on",
      has_wifi: formData.get("has_wifi") === "on",
      has_outlets: formData.get("has_outlets") === "on",
      wine_bar: formData.get("wine_bar") === "on",
      submitted_by: user.id,
    },
  ]);

  if (error) {
    return { message: `Failed to submit suggestion: ${error.message}` };
  }

  revalidatePath("/discover");
  return { message: "Thank you for your suggestion!" };
}

export async function getSuggestedCafes(): Promise<SuggestedCafe[] | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suggested_cafes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return null;
  }

  return data;
}

export async function approveSuggestion(id: number) {
  const supabase = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: suggestion, error: suggestionError } = await supabase
    .from("suggested_cafes")
    .select("*")
    .eq("id", id)
    .single();

  if (suggestionError) {
    return { success: false, message: suggestionError.message };
  }

  const { error: insertError } = await supabase.from("coffee_shops").insert([
    {
      name: suggestion.name,
      address: suggestion.address,
      summary: suggestion.description,
      city: suggestion.city,
      seating: suggestion.seating,
      parking: suggestion.parking,
      vibe: suggestion.vibe,
      pricing: suggestion.pricing,
      busyness: suggestion.busyness,
      is_laptop_friendly: suggestion.is_laptop_friendly,
      has_wifi: suggestion.has_wifi,
      has_outlets: suggestion.has_outlets,
      wine_bar: suggestion.wine_bar,
    },
  ]);

  if (insertError) {
    // Log the detailed error to the server console for debugging
    console.error("Error approving suggestion:", insertError.message);
    return {
      success: false,
      message: `Failed to approve: ${insertError.message}`,
    };
  }

  const { error: deleteError } = await supabase
    .from("suggested_cafes")
    .delete()
    .eq("id", id);

  if (deleteError) {
    // If insert succeeded but delete failed, we have a problem.
    // Log this for manual cleanup.
    console.error(
      "CRITICAL: Failed to delete suggestion after approval:",
      deleteError.message
    );
    return { success: false, message: deleteError.message };
  }

  revalidatePath("/admin/suggestions");
  return { success: true };
}

export async function denySuggestion(id: number) {
  const supabase = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { error } = await supabase
    .from("suggested_cafes")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/suggestions");
  return { success: true };
}

// --- Saved Cafes Actions ---

export async function saveCafe(
  cafeId: number
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "User not found" };
  }

  // Check if already saved to prevent unique constraint violation
  const alreadySaved = await isCafeSaved(cafeId);
  if (alreadySaved) {
    return { success: true }; // Already saved, so consider it a success
  }

  const { error } = await supabase.from("user_saved_cafes").insert([
    {
      profile_id: user.id,
      coffee_shop_id: cafeId,
    },
  ]);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(`/cafe/${cafeId}`);
  revalidatePath("/profile");
  return { success: true };
}

export async function unsaveCafe(
  cafeId: number
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "User not found" };
  }

  const { error } = await supabase
    .from("user_saved_cafes")
    .delete()
    .eq("profile_id", user.id)
    .eq("coffee_shop_id", cafeId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(`/cafe/${cafeId}`);
  revalidatePath("/profile");
  return { success: true };
}

export async function isCafeSaved(cafeId: number): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false; // If no user, it's not saved
  }

  const { data, error } = await supabase
    .from("user_saved_cafes")
    .select("id")
    .eq("profile_id", user.id)
    .eq("coffee_shop_id", cafeId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 means no rows found
    return false;
  }

  return !!data;
}

export async function getSavedCafes(): Promise<UserSavedCafe[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_saved_cafes")
    .select("*, coffee_shops(*)") // Select all from user_saved_cafes and join coffee_shops
    .eq("profile_id", user.id)
    .order("saved_at", { ascending: false });

  if (error) {
    return null;
  }

  return data as UserSavedCafe[];
}

// --- Visited Cafes Actions ---

export async function toggleVisitedCafe(
  cafeId: number,
  isCurrentlyVisited: boolean
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "User not found" };
  }

  let error: { message: string } | null = null;

  if (isCurrentlyVisited) {
    const { error: deleteError } = await supabase
      .from("user_visits")
      .delete()
      .eq("profile_id", user.id)
      .eq("coffee_shop_id", cafeId);
    error = deleteError;
  } else {
    const { error: insertError } = await supabase.from("user_visits").insert([
      {
        profile_id: user.id,
        coffee_shop_id: cafeId,
      },
    ]);
    error = insertError;
  }

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(`/cafe/${cafeId}`);
  revalidatePath("/profile");
  return { success: true };
}

export async function getVisitedCafes(): Promise<UserVisit[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_visits")
    .select("*, coffee_shops(*)") // Select all from user_visits and join coffee_shops
    .eq("profile_id", user.id)
    .order("visited_at", { ascending: false });

  if (error) {
    return null;
  }

  return data as UserVisit[];
}

export async function hasUserVisitedCafe(cafeId: number): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false; // If no user, it's not visited
  }

  const { data, error } = await supabase
    .from("user_visits")
    .select("id")
    .eq("profile_id", user.id)
    .eq("coffee_shop_id", cafeId)
    .limit(1); // We only need to know if at least one visit exists

  if (error) {
    return false;
  }

  return data !== null && data.length > 0;
}

// --- Existing Logout Action ---

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  revalidatePath("/discover");
}
