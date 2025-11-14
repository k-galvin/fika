import { Database } from "./supabase/database.types";

export type CoffeeShop = Database["public"]["Tables"]["coffee_shops"]["Row"] & {
  shop_photos: { id: number; photo_url: string; is_primary: boolean | null; is_approved: boolean | null }[];
  isInitiallySaved: boolean;
  isInitiallyVisited: boolean;
  ratings: { user_id: string; drinks_quality: number | null }[];
};

export type SuggestedCafe =
  Database["public"]["Tables"]["suggested_cafes"]["Row"];

// New types for user_visits and user_saved_cafes
export type UserVisit = Database["public"]["Tables"]["user_visits"]["Row"] & {
  coffee_shops: CoffeeShop | null;
  rating?: number | null;
};
export type UserSavedCafe =
  Database["public"]["Tables"]["user_saved_cafes"]["Row"] & {
    coffee_shops: CoffeeShop | null;
  };