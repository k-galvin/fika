import { Database } from "./supabase/database.types";

export type CoffeeShop = Database["public"]["Tables"]["coffee_shops"]["Row"] & {
  shop_photos: { photo_url: string }[];
  isInitiallySaved: boolean;
  isInitiallyVisited: boolean;
  ratings: { user_id: string; drinks_quality: number | null }[];
};

export type SuggestedCafe = Database["public"]["Tables"]["suggested_cafes"]["Row"];

// New types for user_visits and user_saved_cafes
export type UserVisit = Database["public"]["Tables"]["user_visits"]["Row"] & {
  coffee_shops: CoffeeShop | null;
};
export type UserSavedCafe = Database["public"]["Tables"]["user_saved_cafes"]["Row"] & {
  coffee_shops: CoffeeShop | null;
};
