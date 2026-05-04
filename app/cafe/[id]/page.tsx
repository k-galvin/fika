import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CafeDetailsClient from "./cafe-details-client";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CafeDetailsPage({ params }: Props) {
  const resolvedParams = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: "user" | "admin" | null = null;
  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profileData) {
      userRole = profileData.role;
    }
  }

  const { data: shop } = await supabase
    .from("coffee_shops")
    .select("*, shop_photos(id, photo_url, is_primary, is_approved, sort_order, uploaded_at)")
    .eq("id", resolvedParams.id)
    .single();

  if (shop && shop.shop_photos) {
    // Sort photos: strictly follow sort_order, fall back to uploaded_at
    shop.shop_photos.sort((a: any, b: any) => {
      const orderA = a.sort_order ?? 0;
      const orderB = b.sort_order ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      
      // Fallback for photos with same sort_order (e.g. newly uploaded)
      const dateA = new Date(a.uploaded_at || 0).getTime();
      const dateB = new Date(b.uploaded_at || 0).getTime();
      return dateB - dateA; // Newer first
    });
  }

  if (!shop) {
    notFound();
  }

  let isInitiallySaved = false;
  let isInitiallyVisited = false;
  let initialRating: number | null = null;
  let journalEntries: Database["public"]["Tables"]["journal_entries"]["Row"][] = [];

  if (user) {
    // Check if cafe is saved by the user
    const { data: savedData } = await supabase
      .from("user_saved_cafes")
      .select("id")
      .eq("profile_id", user.id)
      .eq("coffee_shop_id", shop.id)
      .single();
    isInitiallySaved = !!savedData;

    // Check if cafe has been visited by the user
    const { data: visitedData } = await supabase
      .from("user_visits")
      .select("id, rating")
      .eq("profile_id", user.id)
      .eq("coffee_shop_id", shop.id)
      .single();
    isInitiallyVisited = !!visitedData;
    initialRating = visitedData?.rating || null;

    // Fetch journal entries for the user
    const { data: journalData } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("profile_id", user.id)
      .eq("coffee_shop_id", shop.id)
      .order("visit_date", { ascending: false });
    journalEntries = journalData || [];
  }

  return (
    <CafeDetailsClient
      shop={shop}
      user={user}
      userRole={userRole} // New prop
      isInitiallySaved={isInitiallySaved}
      isInitiallyVisited={isInitiallyVisited}
      initialRating={initialRating}
      journalEntries={journalEntries}
    />
  );
}
