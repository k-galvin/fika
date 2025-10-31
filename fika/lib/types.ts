import { Database } from "./supabase/database.types";

export type SuggestedCafe = Database["public"]["Tables"]["suggested_cafes"]["Row"];
export type UserSavedCafe = Database["public"]["Tables"]["user_saved_cafes"]["Row"] & {
  coffee_shops: CoffeeShop;
};
export type UserVisit = Database["public"]["Tables"]["user_visits"]["Row"] & {
  coffee_shops: CoffeeShop;
};

export type CoffeeShop = Database["public"]["Tables"]["coffee_shops"]["Row"];

