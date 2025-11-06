"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceRoleClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { SuggestedCafe, UserSavedCafe, UserVisit } from "@/lib/types"; // Import new types
import { Database } from "@/lib/supabase/database.types";

type ShopPhoto = Database["public"]["Tables"]["shop_photos"]["Row"];
type CoffeeShop = Database["public"]["Tables"]["coffee_shops"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type UnapprovedPhoto = ShopPhoto & {
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
  revalidatePath("/discover");
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

  revalidatePath(`/cafe/${cafeId}`);
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

  console.log("Fetched unapproved photos:", data); // Added log
  data?.forEach((photo) =>
    console.log("Unapproved photo URL:", photo.photo_url)
  );

  return data;
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
