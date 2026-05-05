"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceRoleClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { SuggestedCafe, UserSavedCafe, UserVisit } from "@/lib/types"; // Import new types
import { Database } from "@/lib/supabase/database.types";
import { sendAdminNotification, sendFriendRequestNotification } from "@/lib/notifications";

type ShopPhoto = Database["public"]["Tables"]["shop_photos"]["Row"];
type CoffeeShop = Database["public"]["Tables"]["coffee_shops"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type UnapprovedPhoto = ShopPhoto & {
  coffee_shops: Pick<CoffeeShop, "name"> | null;
  profiles: Pick<Profile, "username"> | null;
};

export async function searchProfiles(searchTerm: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username")
    .like("username", `%${searchTerm}%`)
    .limit(10);

  if (error) {
    console.error("Error searching profiles:", error);
    return [];
  }

  return data;
}

export async function searchCafes(searchTerm: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coffee_shops")
    .select("id, name, city")
    .ilike("name", `%${searchTerm}%`)
    .limit(10);

  if (error) {
    console.error("Error searching cafes:", error);
    return [];
  }

  return data;
}

export async function toggleFeaturedCafe(cafeId: number, isFeatured: boolean) {
  const supabase = await createClient();
  
  // Verify admin status
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return { success: false, message: "Unauthorized" };

  const adminSupabase = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await adminSupabase
    .from("coffee_shops")
    .update({ is_featured: isFeatured })
    .eq("id", cafeId);

  if (error) {
    console.error("Error toggling featured status:", error.message);
    return { success: false, message: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/featured");
  return { success: true };
}

export async function getFeaturedCafes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coffee_shops")
    .select("id, name, city, is_featured")
    .eq("is_featured", true)
    .order("name");

  if (error) {
    console.error("Error fetching featured cafes:", error.message);
    return [];
  }

  return data;
}

// --- Cafe Suggestion Actions ---

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

  // Extract form values
  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const seating = formData.get("seating") as string;
  const parking = formData.get("parking") as string;
  const vibe = formData.get("vibe") as string;
  const pricing = formData.get("pricing") as string;
  const busyness = formData.get("busyness") as string;
  const is_laptop_friendly = formData.get("is_laptop_friendly") === "yes";
  const has_wifi = formData.get("has_wifi") === "yes";
  const has_outlets = formData.get("has_outlets") === "yes";
  const wine_bar = formData.get("wine_bar") === "yes";
  
  // Extract photo URLs if provided
  const photo_urls_raw = formData.get("photo_urls") as string;
  const photo_urls = photo_urls_raw ? JSON.parse(photo_urls_raw) : [];

  // Server-side validation for required fields
  const requiredFields = {
    name,
    address,
    city,
    seating,
    parking,
    vibe,
    pricing,
    busyness,
  };

  const missingFields = [];
  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value || String(value).trim() === "") {
      missingFields.push(key.replace(/_/g, " "));
    }
  }

  if (missingFields.length > 0) {
    return { message: `Missing input: ${missingFields.join(", ")}` };
  }

  const { error } = await supabase.from("suggested_cafes").insert([
    {
      name,
      address,
      city,
      seating,
      parking,
      vibe,
      pricing,
      busyness,
      is_laptop_friendly,
      has_wifi,
      has_outlets,
      wine_bar,
      submitted_by: user.id,
      photo_urls: photo_urls,
    },
  ]);

  if (error) {
    console.error("Supabase insert error:", error); // Log the detailed error
    return { message: `Failed to submit suggestion: ${error.message}` };
  }

  // Send email notification to admin
  await sendAdminNotification({
    type: "suggestion",
    details: `${name} in ${city}`,
  });

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

  // Use select() and single() after insert to get the created cafe's ID
  const { data: newCafe, error: insertError } = await supabase
    .from("coffee_shops")
    .insert([
      {
        name: suggestion.name,
        address: suggestion.address,
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
    ])
    .select()
    .single();

  if (insertError) {
    // Log the detailed error to the server console for debugging
    console.error("Error approving suggestion:", insertError.message);
    return {
      success: false,
      message: `Failed to approve: ${insertError.message}`,
    };
  }

  // Handle photos if any
  if (suggestion.photo_urls && suggestion.photo_urls.length > 0) {
    const photoInserts = suggestion.photo_urls.map((url: string, index: number) => ({
      shop_id: newCafe.id,
      photo_url: url,
      user_id: suggestion.submitted_by,
      is_primary: index === 0, // First one is primary
      is_approved: true, // Auto-approved since the cafe is being approved
      sort_order: index,
    }));

    await supabase.from("shop_photos").insert(photoInserts);
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
  revalidatePath("/discover");
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
  revalidatePath("/discover");
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

export async function getSavedCafes(
  userId?: string
): Promise<UserSavedCafe[] | null> {
  const supabase = await createClient();

  let idToUse = userId;
  if (!idToUse) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }
    idToUse = user.id;
  }

  const { data, error } = await supabase
    .from("user_saved_cafes")
    .select("*, coffee_shops(*)") // Select all from user_saved_cafes and join coffee_shops
    .eq("profile_id", idToUse)
    .order("saved_at", { ascending: false });

  if (error) {
    return null;
  }

  return data as UserSavedCafe[];
}

// --- Visited Cafes Actions ---

export async function getVisitedCafes(
  userId?: string
): Promise<UserVisit[] | null> {
  const supabase = await createClient();

  let idToUse = userId;
  if (!idToUse) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }
    idToUse = user.id;
  }

  const { data, error } = await supabase
    .from("user_visits")
    .select("*, coffee_shops(*)") // Select all from user_visits and join coffee_shops
    .eq("profile_id", idToUse)
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
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 means no rows found
    return false;
  }

  return !!data;
}

export async function getUserRatingForCafe(
  cafeId: number
): Promise<number | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_visits")
    .select("rating")
    .eq("profile_id", user.id)
    .eq("coffee_shop_id", cafeId)
    .single();

  if (error) {
    return null;
  }

  return data?.rating || null;
}

// --- Existing Logout Action ---

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  revalidatePath("/discover");
}

export async function logVisit(
  cafeId: number
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "User not found" };
  }

  const upsertData = {
    profile_id: user.id,
    coffee_shop_id: cafeId,
  };

  const { error } = await supabase
    .from("user_visits")
    .upsert(upsertData, { onConflict: "profile_id,coffee_shop_id" });

  if (error) {
    console.error("logVisit: Supabase operation error:", error); // Verbose log
    return { success: false, message: error.message };
  }

  revalidatePath(`/cafe/${cafeId}`);
  revalidatePath("/profile");
  return { success: true };
}

// --- City Management Actions ---

export async function getCities() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching cities:", error.message);
    return [];
  }

  return data;
}

export async function addCity(name: string) {
  const supabase = await createClient();
  
  // Verify admin status
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return { success: false, message: "Unauthorized" };

  const adminSupabase = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await adminSupabase
    .from("cities")
    .insert([{ name }])
    .select()
    .single();

  if (error) {
    console.error("Error adding city:", error.message);
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/cities");
  revalidatePath("/discover");
  return { success: true, data };
}

export async function deleteCity(id: number) {
  const supabase = await createClient();
  
  // Verify admin status
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return { success: false, message: "Unauthorized" };

  const adminSupabase = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await adminSupabase
    .from("cities")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting city:", error.message);
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/cities");
  revalidatePath("/discover");
  return { success: true };
}

// --- Cafe Rating Actions ---

export async function rateCafe(
  cafeId: number,
  rating: number
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "User not found" };
  }

  if (rating < 1 || rating > 5) {
    return { success: false, message: "Rating must be between 1 and 5" };
  }

  // Upsert the rating
  const upsertData = {
    profile_id: user.id,
    coffee_shop_id: cafeId,
    rating: rating,
  };

  const { error } = await supabase
    .from("user_visits")
    .upsert(upsertData, { onConflict: "profile_id,coffee_shop_id" });

  if (error) {
    console.error("rateCafe: Supabase operation error:", error); // Verbose log
    return { success: false, message: error.message };
  }

  revalidatePath(`/cafe/${cafeId}`);
  revalidatePath("/profile");
  return { success: true };
}

export async function unlogVisit(
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
    .from("user_visits")
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

// --- Updating Cafes Info ---

function getUpdateValue(value: FormDataEntryValue | null): string | null {
  if (typeof value === "string" && value.trim() !== "") {
    return value;
  }
  return null;
}

export async function submitCafeUpdates(
  _prevState: { message: string },
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be logged in to submit an update." };
  }

  const cafeId = formData.get("cafe_id");
  const updatesRaw = formData.get("updates");

  if (!updatesRaw) {
    return { message: "No updates provided." };
  }

  let updates;
  try {
    updates = JSON.parse(updatesRaw as string);
  } catch {
    return { message: "Invalid update data format." };
  }

  if (!Array.isArray(updates) || updates.length === 0) {
    return { message: "No valid updates provided." };
  }

  type CafeUpdate = {
    field_name: string;
    suggested_value: string;
  };

  const formattedUpdates = updates.map((update: CafeUpdate) => ({
    cafe_id: cafeId,
    field_name: getUpdateValue(update.field_name),
    suggested_value: getUpdateValue(update.suggested_value),
    approved: false,
    user_id: user.id,
  }));

  const validUpdates = formattedUpdates.filter(
    (u) => u.field_name && u.suggested_value
  );

  if (validUpdates.length === 0) {
    return { message: "No valid updates found to submit." };
  }

  const { error } = await supabase.from("cafe_updates").insert(validUpdates);

  if (error) {
    console.error("Error submitting cafe updates:", error.message);
    return { message: `Failed to submit updates: ${error.message}` };
  }

  // Fetch cafe name for better notification
  const { data: cafe } = await supabase
    .from("coffee_shops")
    .select("name")
    .eq("id", cafeId)
    .single();

  await sendAdminNotification({
    type: "update",
    details: `Updates for ${cafe?.name || `Cafe #${cafeId}`}`,
  });

  revalidatePath(`/cafe/${cafeId}`);
  revalidatePath("/discover");
}

export async function uploadShopPhoto(
  cafeId: number,
  photoUrl: string,
  userId: string
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("shop_photos").insert([
    {
      shop_id: cafeId,
      photo_url: photoUrl,
      user_id: userId,
      is_primary: false, // New photos are not primary by default
      is_approved: false, // New photos are not approved by default
    },
  ]);

  if (error) {
    console.error("Error uploading shop photo:", error.message);
    return { success: false, message: error.message };
  }

  // Fetch cafe name for notification
  const { data: cafe } = await supabase
    .from("coffee_shops")
    .select("name")
    .eq("id", cafeId)
    .single();

  await sendAdminNotification({
    type: "photo",
    details: `New photo for ${cafe?.name || `Cafe #${cafeId}`}`,
  });

  revalidatePath(`/cafe/${cafeId}`);
  revalidatePath("/admin/photos"); // Added to update admin count
  return { success: true };
}

export async function uploadShopPhotosBatch(
  cafeId: number,
  photoUrls: string[],
  userId: string
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();

  const inserts = photoUrls.map((url) => ({
    shop_id: cafeId,
    photo_url: url,
    user_id: userId,
    is_primary: false,
    is_approved: false,
  }));

  const { error } = await supabase.from("shop_photos").insert(inserts);

  if (error) {
    console.error("Error batch uploading shop photos:", error.message);
    return { success: false, message: error.message };
  }

  // Fetch cafe name for notification
  const { data: cafe } = await supabase
    .from("coffee_shops")
    .select("name")
    .eq("id", cafeId)
    .single();

  await sendAdminNotification({
    type: "photo",
    details: `New photos for ${cafe?.name || `Cafe #${cafeId}`}`,
    count: photoUrls.length,
  });

  revalidatePath(`/cafe/${cafeId}`);
  revalidatePath("/admin/photos");
  return { success: true };
}

export async function setPrimaryPhoto(
  photoId: number,
  cafeId: number
): Promise<{ success: boolean; message?: string }> {
  // Use createClient for auth operations
  const authSupabase = await createClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    return { success: false, message: "User not found" };
  }

  // Use createServiceRoleClient for privileged database operations
  const supabase = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check if user is admin
  // The is_admin RPC function also needs to be called with the regular client
  // because it checks the role of the *current* user.
  const { data: isAdminData, error: isAdminError } = await authSupabase.rpc(
    "is_admin"
  );

  if (isAdminData === null || isAdminError) {
    return { success: false, message: "Unauthorized: Not an admin" };
  }

  // 1. Set all photos for this cafe to not primary
  const { error: resetError } = await supabase
    .from("shop_photos")
    .update({ is_primary: false })
    .eq("shop_id", cafeId);

  if (resetError) {
    console.error("Error resetting primary photos:", resetError.message);
    return { success: false, message: resetError.message };
  }

  // 2. Set the selected photo as primary
  const { error: setError } = await supabase
    .from("shop_photos")
    .update({ is_primary: true })
    .eq("id", photoId)
    .eq("shop_id", cafeId); // Ensure we're updating the correct photo for the cafe

  if (setError) {
    console.error("Error setting primary photo:", setError.message);
    return { success: false, message: setError.message };
  }

  revalidatePath(`/cafe/${cafeId}`);
  return { success: true };
}

export async function updatePhotoOrder(
  shopId: number,
  photoOrders: { id: number; sort_order: number }[]
): Promise<{ success: boolean; message?: string }> {
  const authSupabase = await createClient();
  const { data: { user } } = await authSupabase.auth.getUser();

  if (!user) return { success: false, message: "User not found" };

  const { data: isAdmin } = await authSupabase.rpc("is_admin");
  if (!isAdmin) return { success: false, message: "Unauthorized" };

  const supabase = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const updates = photoOrders.map((p) =>
    supabase.from("shop_photos").update({ sort_order: p.sort_order }).eq("id", p.id)
  );

  const results = await Promise.all(updates);
  const error = results.find((r) => r.error)?.error;

  if (error) {
    console.error("Error updating photo order:", error.message);
    return { success: false, message: error.message };
  }

  revalidatePath(`/cafe/${shopId}`);
  return { success: true };
}

export async function getUnapprovedPhotos(): Promise<UnapprovedPhoto[] | null> {
  const supabase = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("shop_photos")
    .select("*, coffee_shops(name), profiles(username)")
    .eq("is_approved", false)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("Error fetching unapproved photos:", error.message);
    return null;
  }

  return data;
}

export async function approvePhotosBatch(
  photoIds: number[]
): Promise<{ success: boolean; message?: string }> {
  const supabase = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get shop IDs to revalidate their pages later
  const { data: photos, error: fetchError } = await supabase
    .from("shop_photos")
    .select("shop_id")
    .in("id", photoIds);

  if (fetchError || !photos) {
    return { success: false, message: "Could not find selected photos." };
  }

  const { error } = await supabase
    .from("shop_photos")
    .update({ is_approved: true })
    .in("id", photoIds);

  if (error) {
    console.error("Error batch approving photos:", error.message);
    return { success: false, message: error.message };
  }

  // Revalidate admin and unique shop pages
  revalidatePath("/admin/photos");
  const uniqueShopIds = [...new Set(photos.map((p) => p.shop_id))];
  uniqueShopIds.forEach((shopId) => revalidatePath(`/cafe/${shopId}`));

  return { success: true };
}

export async function denyPhotosBatch(
  photos: { id: number; url: string }[]
): Promise<{ success: boolean; message?: string }> {
  const supabase = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const photoIds = photos.map((p) => p.id);
  const filePaths = photos.map((p) => {
    try {
      return new URL(p.url).pathname.split("/images/")[1];
    } catch {
      return null;
    }
  }).filter(Boolean) as string[];

  // 1. Delete photos from storage
  if (filePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("images")
      .remove(filePaths);

    if (storageError) {
      console.error("Error batch deleting photos from storage:", storageError.message);
    }
  }

  // 2. Delete photos from the database
  const { error: dbError } = await supabase
    .from("shop_photos")
    .delete()
    .in("id", photoIds);

  if (dbError) {
    console.error("Error batch deleting photos from database:", dbError.message);
    return { success: false, message: dbError.message };
  }

  revalidatePath("/admin/photos");
  return { success: true };
}

export async function approvePhoto(
  photoId: number
): Promise<{ success: boolean; message?: string }> {
  const supabase = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // First, get the shop_id from the photo
  const { data: photoData, error: fetchError } = await supabase
    .from("shop_photos")
    .select("shop_id")
    .eq("id", photoId)
    .single();

  if (fetchError || !photoData) {
    console.error("Error fetching photo for approval:", fetchError?.message);
    return {
      success: false,
      message: fetchError?.message || "Photo not found.",
    };
  }

  const shopId = photoData.shop_id;

  const { error } = await supabase
    .from("shop_photos")
    .update({ is_approved: true })
    .eq("id", photoId);

  if (error) {
    console.error("Error approving photo:", error.message);
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/photos");
  revalidatePath(`/cafe/${shopId}`); // Use the fetched shopId here
  return { success: true };
}

export async function denyPhoto(
  photoId: number,
  photoUrl: string
): Promise<{ success: boolean; message?: string }> {
  const supabase = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Extract the file path from the URL
  const filePath = new URL(photoUrl).pathname.split("/images/")[1];

  // 1. Delete the photo from storage
  const { error: storageError } = await supabase.storage
    .from("images")
    .remove([filePath]);

  if (storageError) {
    console.error("Error deleting photo from storage:", storageError.message);
    // Don't return here, still try to delete from db
  }

  // 2. Delete the photo from the database
  const { error: dbError } = await supabase
    .from("shop_photos")
    .delete()
    .eq("id", photoId);

  if (dbError) {
    console.error("Error deleting photo from database:", dbError.message);
    return { success: false, message: dbError.message };
  }

  revalidatePath("/admin/photos");
  return { success: true };
}

export async function sendFriendRequest(friendId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "You must be logged in to send a friend request." };
  }

  if (user.id === friendId) {
    return { success: false, message: "You cannot send a friend request to yourself." };
  }

  // Check if a request already exists to prevent duplicates or conflicting states
  const { data: existingFriendship, error: existingError } = await supabase
    .from("friendships")
    .select("status")
    .or(
      `and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`
    )
    .maybeSingle();

  if (existingError && existingError.code !== "PGRST116") { // PGRST116 is 'no rows found'
    console.error("Error checking existing friendship:", existingError.message);
    return { success: false, message: "Error checking existing friendship." };
  }

  if (existingFriendship) {
    if (existingFriendship.status === "pending") {
      return { success: false, message: "Friend request already pending." };
    }
    if (existingFriendship.status === "friends") {
      return { success: false, message: "You are already friends with this user." };
    }
    if (existingFriendship.status === "denied") {
        // If a previous request was denied, allow a new one to be sent.
        // First delete the old denied request to allow a new one to be inserted.
        const { error: deleteError } = await supabase
            .from("friendships")
            .delete()
            .or(
                `and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`
            );

        if (deleteError) {
            console.error("Error deleting old denied request:", deleteError.message);
            return { success: false, message: "Error resending request." };
        }
    }
  }

  const { error } = await supabase
    .from("friendships")
    .insert([{ user_id: user.id, friend_id: friendId, status: "pending" }]);

  if (error) {
    console.error("Error sending friend request:", error.message);
    return { success: false, message: error.message };
  }

  // Send notification email to the recipient
  try {
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    const senderName = senderProfile?.username || user.email || "A Fika user";
    await sendFriendRequestNotification(friendId, senderName);
  } catch (notifyError) {
    console.error("Error triggering friend request notification:", notifyError);
    // We don't return error here because the request was actually sent in the DB
  }

  revalidatePath("/discover");
  revalidatePath("/friends");
  return { success: true, message: "Friend request sent." };
}

export async function unsendFriendRequest(friendId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "You must be logged in to unsend a friend request." };
  }

  const { error } = await supabase
    .from("friendships")
    .delete()
    .match({ user_id: user.id, friend_id: friendId, status: "pending" });

  if (error) {
    console.error("Error unsending friend request:", error.message);
    return { success: false, message: error.message };
  }

  revalidatePath("/discover");
  revalidatePath("/friends");
  return { success: true, message: "Friend request unsent." };
}

// --- Friend Request Actions ---

export async function acceptFriendRequest(requestId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return { success: false, message: "You must be logged in to accept." };

  const { error } = await supabase
    .from("friendships")
    .update({ status: "friends" })
    .eq("user_id", requestId)
    .eq("friend_id", user.id);

  if (error) {
    console.error("Error accepting friend request:", error.message);
    return { success: false, message: error.message };
  }

  revalidatePath("/friends");
  return { success: true, message: "Friend request accepted." };
}

export async function denyFriendRequest(friendId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return { success: false, message: "You must be logged in to deny." };

  const { error } = await supabase
    .from("friendships")
    .delete()
    .match({ user_id: friendId, friend_id: user.id });

  if (error) {
    console.error("Error denying friend request:", error.message);
    return { success: false, message: error.message };
  }

  revalidatePath("/friends");
  return { success: true, message: "Friend request denied." };
}

export async function unfriendUser(friendId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return { success: false, message: "You must be logged in to unfriend." };

  const { error } = await supabase
    .from("friendships")
    .delete()
    .or(
      `and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`
    );

  if (error) {
    console.error("Error unfriending user:", error.message);
    return { success: false, message: error.message };
  }

  revalidatePath("/friends");
  revalidatePath("/discover");

  return { success: true, message: "Friend removed successfully." };
}

export type FriendActivity = {
  id: string;
  type: "visit" | "save";
  timestamp: string;
  username: string;
  cafe_name: string;
  cafe_id: number;
};

export async function getFriendActivity(): Promise<FriendActivity[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // 1. Get confirmed friend IDs
  const { data: friendships } = await supabase
    .from("friendships")
    .select("user_id, friend_id")
    .eq("status", "friends")
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

  if (!friendships) return [];

  const friendIds = friendships.map(f => 
    f.user_id === user.id ? f.friend_id : f.user_id
  ).filter(id => id !== null) as string[];

  if (friendIds.length === 0) return [];

  // 2. Fetch recent visits
  const { data: visits } = await supabase
    .from("user_visits")
    .select("id, visited_at, profiles(username), coffee_shops(name, id)")
    .in("profile_id", friendIds)
    .order("visited_at", { ascending: false })
    .limit(10);

  // 3. Fetch recent saves
  const { data: saves } = await supabase
    .from("user_saved_cafes")
    .select("id, saved_at, profiles(username), coffee_shops(name, id)")
    .in("profile_id", friendIds)
    .order("saved_at", { ascending: false })
    .limit(10);

  const activity: FriendActivity[] = [];

  visits?.forEach(v => {
    const profile = Array.isArray(v.profiles) ? v.profiles[0] : v.profiles;
    const shop = Array.isArray(v.coffee_shops) ? v.coffee_shops[0] : v.coffee_shops;
    activity.push({
      id: v.id,
      type: "visit",
      timestamp: v.visited_at,
      username: profile?.username || "Someone",
      cafe_name: shop?.name || "a cafe",
      cafe_id: shop?.id || 0
    });
  });

  saves?.forEach(s => {
    const profile = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
    const shop = Array.isArray(s.coffee_shops) ? s.coffee_shops[0] : s.coffee_shops;
    activity.push({
      id: s.id,
      type: "save",
      timestamp: s.saved_at,
      username: profile?.username || "Someone",
      cafe_name: shop?.name || "a cafe",
      cafe_id: shop?.id || 0
    });
  });

  return activity.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 15);
}

// --- Updates Page Admin ---
export async function getCafeUpdates() {
  const supabase = await createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("cafe_updates")
    .select(
      `
      id,
      cafe_id,
      field_name,
      suggested_value,
      approved,
      user_id,
      created_at,
      coffee_shops (name)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching cafe updates:", error.message);
    return [];
  }

  // Flatten nested structure so it's easier to use on your admin page
  return data.map((u) => {
    const shop = Array.isArray(u.coffee_shops)
      ? u.coffee_shops[0]
      : u.coffee_shops;
    return {
      id: u.id,
      cafe_id: u.cafe_id,
      cafe_name: shop?.name ?? "Unknown Café",
      field: u.field_name,
      new_value: u.suggested_value,
      user_id: u.user_id,
      created_at: u.created_at,
    };
  });
}

// Helper to parse suggested_value to the correct type
function parseSuggestedValue(fieldName: string, suggestedValue: string) {
  switch (fieldName) {
    case "WiFi":
    case "Outlets":
    case "Laptop Friendly":
    case "Wine Bar":
      return suggestedValue === "Yes";
    default:
      return suggestedValue;
  }
}

export async function approveUpdateAndDenyOthers(
  updateId: number,
  otherUpdateIds: number[]
) {
  const supabase = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Get the winning update record
  const { data: update, error: fetchError } = await supabase
    .from("cafe_updates")
    .select("cafe_id, field_name, suggested_value")
    .eq("id", updateId)
    .single();

  if (fetchError || !update) {
    console.error("Error fetching update for approval:", fetchError?.message);
    return { success: false, message: "Update not found." };
  }
  // Map user-friendly field names to actual database column names
  const dbColumnMap: { [key: string]: string } = {
    Address: "address",
    Vibe: "vibe",
    Pricing: "pricing",
    Busyness: "busyness",
    Seating: "seating",
    Parking: "parking",
    WiFi: "has_wifi",
    Outlets: "has_outlets",
    "Laptop Friendly": "is_laptop_friendly",
    "Wine Bar": "wine_bar",
  };

  const dbColumnName =
    dbColumnMap[update.field_name] ||
    update.field_name.toLowerCase().replace(/\s/g, "_"); // Fallback for other fields if not explicitly mapped.

  // Parse the suggested value to its correct type
  const parsedValue = parseSuggestedValue(
    update.field_name,
    update.suggested_value
  );
  console.log("Parsed value for update:", {
    originalFieldName: update.field_name,
    dbColumnName,
    suggestedValue: update.suggested_value,
    parsedValue,
  });

  // 2. Apply the update to the coffee_shops table
  const { error: updateError } = await supabase
    .from("coffee_shops")
    .update({ [dbColumnName]: parsedValue })
    .eq("id", update.cafe_id);

  if (updateError) {
    console.error("Error applying approved update:", updateError.message);
    return { success: false, message: updateError.message };
  }

  // 3. Delete all updates in the group (the approved one and all others)
  const allIds = [updateId, ...otherUpdateIds];
  const { error: deleteError } = await supabase
    .from("cafe_updates")
    .delete()
    .in("id", allIds);

  if (deleteError) {
    console.error(
      "Failed to delete updates after approval:",
      deleteError.message
    );
    // Note: The update was applied, but cleanup failed. Manual check might be needed.
    return { success: false, message: deleteError.message };
  }

  revalidatePath("/admin/updates");
  revalidatePath("/discover");
  revalidatePath(`/cafe/${update.cafe_id}`);
  return { success: true };
}

export async function denyUpdates(updateIds: number[]) {
  const supabase = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from("cafe_updates")
    .delete()
    .in("id", updateIds);

  if (error) {
    console.error("Error denying updates:", error.message);
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/updates");
  return { success: true };
}

export async function deleteCafe(cafeId: number): Promise<{ success: boolean; message?: string }> {
  const authSupabase = await createClient();
  const { data: isAdmin } = await authSupabase.rpc("is_admin");
  if (!isAdmin) return { success: false, message: "Unauthorized" };

  const supabase = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Fetch photos to delete from storage
  const { data: photos } = await supabase
    .from("shop_photos")
    .select("photo_url")
    .eq("shop_id", cafeId);

  if (photos && photos.length > 0) {
    const filePaths = photos.map(p => {
      try {
        // Extract file path from URL. Assuming structure: .../images/<filePath>
        return new URL(p.photo_url).pathname.split("/images/")[1];
      } catch {
        return null;
      }
    }).filter(Boolean) as string[];

    if (filePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("images")
        .remove(filePaths);
      
      if (storageError) {
        console.error("Error deleting cafe photos from storage:", storageError.message);
      }
    }
  }

  // 2. Explicitly delete dependent records from database tables
  // We do this because the database might not have ON DELETE CASCADE set up.
  await Promise.all([
    supabase.from("shop_photos").delete().eq("shop_id", cafeId),
    supabase.from("cafe_updates").delete().eq("cafe_id", cafeId),
    supabase.from("journal_entries").delete().eq("coffee_shop_id", cafeId),
    supabase.from("user_saved_cafes").delete().eq("coffee_shop_id", cafeId),
    supabase.from("user_visits").delete().eq("coffee_shop_id", cafeId),
  ]);

  // 3. Delete the cafe
  const { error } = await supabase
    .from("coffee_shops")
    .delete()
    .eq("id", cafeId);

  if (error) {
    console.error("Error deleting cafe:", error.message);
    return { success: false, message: error.message };
  }

  revalidatePath("/");
  revalidatePath("/discover");
  revalidatePath("/admin/featured");
  revalidatePath(`/cafe/${cafeId}`);
  
  return { success: true };
}

export async function getCafeCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("coffee_shops")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error fetching cafe count:", error.message);
    return 0;
  }

  return count || 0;
}

export async function getAllCafes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coffee_shops")
    .select("id, name, city")
    .order("name");

  if (error) {
    console.error("Error fetching all cafes:", error.message);
    return [];
  }

  return data;
}

export async function checkUserLoggedIn(): Promise<{
  success: boolean;
  message?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "User not found" };
  }
  return { success: true };
}

// --- Journal Actions ---

export async function getJournalEntries(cafeId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("profile_id", user.id)
    .eq("coffee_shop_id", cafeId)
    .order("visit_date", { ascending: false });

  if (error) {
    console.error("Error fetching journal entries:", error.message);
    return [];
  }

  return data;
}

export async function getAllUserJournalEntries() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*, coffee_shops(name, city, shop_photos(photo_url, is_primary, is_approved))")
    .eq("profile_id", user.id)
    .order("visit_date", { ascending: false });

  if (error) {
    console.error("Error fetching all journal entries:", error.message);
    return [];
  }

  return data;
}

export async function addJournalEntry(
  cafeId: number,
  content: string,
  visitDate: string
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "User not found" };

  const { error } = await supabase.from("journal_entries").insert([
    {
      profile_id: user.id,
      coffee_shop_id: cafeId,
      content,
      visit_date: visitDate,
    },
  ]);

  if (error) {
    console.error("Error adding journal entry:", error.message);
    return { success: false, message: error.message };
  }

  revalidatePath(`/cafe/${cafeId}`);
  return { success: true };
}

export async function updateJournalEntry(
  entryId: string,
  content: string,
  visitDate: string
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "User not found" };

  const { data: entry } = await supabase
    .from("journal_entries")
    .select("coffee_shop_id")
    .eq("id", entryId)
    .single();

  const { error } = await supabase
    .from("journal_entries")
    .update({ content, visit_date: visitDate })
    .eq("id", entryId)
    .eq("profile_id", user.id);

  if (error) {
    console.error("Error updating journal entry:", error.message);
    return { success: false, message: error.message };
  }

  if (entry) {
    revalidatePath(`/cafe/${entry.coffee_shop_id}`);
  }
  return { success: true };
}

export async function deleteJournalEntry(
  entryId: string
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "User not found" };

  const { data: entry } = await supabase
    .from("journal_entries")
    .select("coffee_shop_id")
    .eq("id", entryId)
    .single();

  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", entryId)
    .eq("profile_id", user.id);

  if (error) {
    console.error("Error deleting journal entry:", error.message);
    return { success: false, message: error.message };
  }

  if (entry) {
    revalidatePath(`/cafe/${entry.coffee_shop_id}`);
  }
  return { success: true };
}
