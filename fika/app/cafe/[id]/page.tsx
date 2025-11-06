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
    .select("*, shop_photos(id, photo_url, is_primary, is_approved)")
    .eq("id", resolvedParams.id)
    .single();

  if (!shop) {
    notFound();
  }

  let isInitiallySaved = false;
  let isInitiallyVisited = false;

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
      .select("id")
      .eq("profile_id", user.id)
      .eq("coffee_shop_id", shop.id)
      .limit(1); // We only need to know if at least one visit exists
    isInitiallyVisited = !!visitedData && visitedData.length > 0;
  }

  return (
    <CafeDetailsClient
      shop={shop}
      user={user}
      userRole={userRole} // New prop
      isInitiallySaved={isInitiallySaved}
      isInitiallyVisited={isInitiallyVisited}
    />
  );
}
