import {
  saveCafe,
  unsaveCafe,
  isCafeSaved,
  getSavedCafes,
  getVisitedCafes,
  hasUserVisitedCafe,
  logout,
  suggestCafe,
  getSuggestedCafes,
  approveSuggestion,
  denySuggestion,
  uploadShopPhoto,
} from "../actions";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceRoleClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Mock the Supabase client to prevent actual database calls during tests.
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

// Mock the revalidatePath function to prevent errors during tests.
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("saveCafe", () => {
    it("should return success: false if user is not authenticated", async () => {
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      });

      const result = await saveCafe(1);

      expect(result).toEqual({ success: false, message: "User not found" });
    });

    it("should return success: true if cafe is already saved", async () => {
      const user = { id: "123", email: "test@example.com" };
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user } }),
        },
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { id: 1 } }),
      });

      const result = await saveCafe(1);

      expect(result).toEqual({ success: true });
    });

    it("should insert a new saved cafe and return success: true", async () => {
      const user = { id: "123", email: "test@example.com" };
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user } }),
        },
        from: jest.fn((table: string) => {
          if (table === "user_saved_cafes") {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest
                .fn()
                .mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
              insert: jest.fn().mockResolvedValue({ error: null }),
            };
          }
          return {};
        }),
      });

      const result = await saveCafe(1);

      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/cafe/1");
      expect(revalidatePath).toHaveBeenCalledWith("/profile");
      expect(revalidatePath).toHaveBeenCalledWith("/discover");
    });

    it("should return success: false if there is a database error", async () => {
      const user = { id: "123", email: "test@example.com" };
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user } }),
        },
        from: jest.fn((table: string) => {
          if (table === "user_saved_cafes") {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest
                .fn()
                .mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
              insert: jest
                .fn()
                .mockResolvedValue({ error: { message: "Database error" } }),
            };
          }
          return {};
        }),
      });

      const result = await saveCafe(1);

      expect(result).toEqual({ success: false, message: "Database error" });
    });
  });

  describe("unsaveCafe", () => {
    it("should return success: false if user is not authenticated", async () => {
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      });

      const result = await unsaveCafe(1);

      expect(result).toEqual({ success: false, message: "User not found" });
    });

    it("should delete a saved cafe and return success: true", async () => {
      const user = { id: "123", email: "test@example.com" };
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user } }),
        },
        from: () => ({
          delete: () => ({
            eq: () => ({
              eq: () => Promise.resolve({ error: null }),
            }),
          }),
        }),
      });

      const result = await unsaveCafe(1);

      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/cafe/1");
      expect(revalidatePath).toHaveBeenCalledWith("/profile");
      expect(revalidatePath).toHaveBeenCalledWith("/discover");
    });

    it("should return success: false if there is a database error", async () => {
      const user = { id: "123", email: "test@example.com" };
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user } }),
        },
        from: () => ({
          delete: () => ({
            eq: () => ({
              eq: () =>
                Promise.resolve({ error: { message: "Database error" } }),
            }),
          }),
        }),
      });

      const result = await unsaveCafe(1);

      expect(result).toEqual({ success: false, message: "Database error" });
    });
  });

  describe("isCafeSaved", () => {
    it("should return false if user is not authenticated", async () => {
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      });

      const result = await isCafeSaved(1);

      expect(result).toBe(false);
    });

    it("should return true if cafe is saved", async () => {
      const user = { id: "123", email: "test@example.com" };
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user } }),
        },
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { id: 1 } }),
      });

      const result = await isCafeSaved(1);

      expect(result).toBe(true);
    });

    it("should return false if cafe is not saved", async () => {
      const user = { id: "123", email: "test@example.com" };
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user } }),
        },
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
      });

      const result = await isCafeSaved(1);

      expect(result).toBe(false);
    });

    it("should return false if there is a database error", async () => {
      const user = { id: "123", email: "test@example.com" };
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user } }),
        },
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      });

      const result = await isCafeSaved(1);

      expect(result).toBe(false);
    });
  });

  describe("getSavedCafes", () => {
    it("should return null if user is not authenticated", async () => {
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      });

      const result = await getSavedCafes();

      expect(result).toBeNull();
    });

    it("should return saved cafes if user is authenticated", async () => {
      const user = { id: "123", email: "test@example.com" };
      const savedCafes = [{ id: 1, name: "Test Cafe" }];
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user } }),
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: savedCafes, error: null }),
            }),
          }),
        }),
      });

      const result = await getSavedCafes();

      expect(result).toEqual(savedCafes);
    });

    it("should return null if there is a database error", async () => {
      const user = { id: "123", email: "test@example.com" };
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user } }),
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              order: () =>
                Promise.resolve({
                  data: null,
                  error: { message: "Database error" },
                }),
            }),
          }),
        }),
      });

      const result = await getSavedCafes();

      expect(result).toBeNull();
    });
  });

  describe("getVisitedCafes", () => {
    it("should return null if user is not authenticated", async () => {
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      });

      const result = await getVisitedCafes();

      expect(result).toBeNull();
    });

    it("should return visited cafes if user is authenticated", async () => {
      const user = { id: "123", email: "test@example.com" };
      const visitedCafes = [{ id: 1, name: "Test Cafe" }];
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user } }),
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: visitedCafes, error: null }),
            }),
          }),
        }),
      });

      const result = await getVisitedCafes();

      expect(result).toEqual(visitedCafes);
    });

    it("should return null if there is a database error", async () => {
      const user = { id: "123", email: "test@example.com" };
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user } }),
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              order: () =>
                Promise.resolve({
                  data: null,
                  error: { message: "Database error" },
                }),
            }),
          }),
        }),
      });

      const result = await getVisitedCafes();

      expect(result).toBeNull();
    });
  });

  describe("hasUserVisitedCafe", () => {
    it("should return false if user is not authenticated", async () => {
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      });

      const result = await hasUserVisitedCafe(1);

      expect(result).toBe(false);
    });

    it("should return true if user has visited cafe", async () => {
      const user = { id: "123", email: "test@example.com" };
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user } }),
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({ data: { has_visited: true }, error: null }),
              }),
            }),
          }),
        }),
      });

      const result = await hasUserVisitedCafe(1);

      expect(result).toBe(true);
    });

    it("should return false if user has not visited cafe", async () => {
      const user = { id: "123", email: "test@example.com" };
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user } }),
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({ data: null, error: { code: "PGRST116" } }),
              }),
            }),
          }),
        }),
      });

      const result = await hasUserVisitedCafe(1);

      expect(result).toBe(false);
    });

    it("should return false if there is a database error", async () => {
      const user = { id: "123", email: "test@example.com" };
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user } }),
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({
                    data: null,
                    error: { message: "Database error" },
                  }),
              }),
            }),
          }),
        }),
      });

      const result = await hasUserVisitedCafe(1);

      expect(result).toBe(false);
    });
  });

  describe("logout", () => {
    it("should call signOut and revalidate paths", async () => {
      const signOut = jest.fn();
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          signOut,
        },
      });

      await logout();

      expect(signOut).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/");
      expect(revalidatePath).toHaveBeenCalledWith("/discover");
    });
  });

  describe("suggestCafe", () => {
    const user = { id: "user-123" };
    const formData = new FormData();
    formData.append("name", "New Cafe");
    formData.append("address", "456 Suggestion Ave");

    it("should return an error if user is not authenticated", async () => {
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      });
      const result = await suggestCafe({ message: "" }, formData);
      expect(result.message).toContain("You must be logged in");
    });

    it("should successfully insert a new suggestion", async () => {
      const insert = jest.fn().mockResolvedValue({ error: null });
      (createClient as jest.Mock).mockReturnValue({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user } }) },
        from: jest.fn(() => ({ insert })),
      });

      const result = await suggestCafe({ message: "" }, formData);

      expect(insert).toHaveBeenCalled();
      expect(result.message).toContain("Thank you");
      expect(revalidatePath).toHaveBeenCalledWith("/discover");
    });

    it("should return an error message on insertion failure", async () => {
      const insert = jest
        .fn()
        .mockResolvedValue({ error: { message: "Insert failed" } });
      (createClient as jest.Mock).mockReturnValue({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user } }) },
        from: jest.fn(() => ({ insert })),
      });

      const result = await suggestCafe({ message: "" }, formData);
      expect(result.message).toContain("Insert failed");
    });
  });

  describe("getSuggestedCafes", () => {
    it("should return a list of suggestions", async () => {
      const mockData = [{ id: 1, name: "Suggestion 1" }];
      const order = jest
        .fn()
        .mockResolvedValue({ data: mockData, error: null });
      const select = jest.fn(() => ({ order }));
      (createClient as jest.Mock).mockReturnValue({ from: () => ({ select }) });

      const result = await getSuggestedCafes();
      expect(result).toEqual(mockData);
    });

    it("should return null on error", async () => {
      const order = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: "DB Error" } });
      const select = jest.fn(() => ({ order }));
      (createClient as jest.Mock).mockReturnValue({ from: () => ({ select }) });

      const result = await getSuggestedCafes();
      expect(result).toBeNull();
    });
  });

  describe("approveSuggestion", () => {
    const suggestion = { id: 1, name: "The Best Cafe" };

    interface MockSupabaseClient {
      from: jest.Mock;
    }
    let serviceRoleClient: MockSupabaseClient;

    beforeEach(() => {
      const single = jest
        .fn()
        .mockResolvedValue({ data: suggestion, error: null });
      const select = jest.fn(() => ({ eq: () => ({ single }) }));
      const insert = jest.fn().mockResolvedValue({ error: null });
      const del = jest.fn().mockResolvedValue({ error: null });
      const deleteFn = jest.fn(() => ({ eq: del }));

      serviceRoleClient = {
        from: jest.fn((table: string) => {
          if (table === "suggested_cafes") {
            return { select, delete: deleteFn };
          }
          if (table === "coffee_shops") {
            return { insert };
          }
        }),
      };
      (createServiceRoleClient as jest.Mock).mockReturnValue(serviceRoleClient);
    });

    it("should approve a suggestion successfully", async () => {
      const result = await approveSuggestion(1);

      expect(serviceRoleClient.from).toHaveBeenCalledWith("coffee_shops");
      expect(serviceRoleClient.from).toHaveBeenCalledWith("suggested_cafes");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/suggestions");
      expect(result.success).toBe(true);
    });

    it("should fail if suggestion not found", async () => {
      const single = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: "Not found" } });
      const select = jest.fn(() => ({ eq: () => ({ single }) }));
      serviceRoleClient.from.mockImplementation((table: string) => {
        if (table === "suggested_cafes") return { select };
        return {};
      });

      const result = await approveSuggestion(1);
      expect(result.success).toBe(false);
      expect(result.message).toBe("Not found");
    });
  });

  describe("denySuggestion", () => {
    it("should deny a suggestion successfully", async () => {
      const del = jest.fn().mockResolvedValue({ error: null });
      const deleteFn = jest.fn(() => ({ eq: del }));
      (createServiceRoleClient as jest.Mock).mockReturnValue({
        from: () => ({ delete: deleteFn }),
      });

      const result = await denySuggestion(1);

      expect(deleteFn).toHaveBeenCalled();
      expect(del).toHaveBeenCalledWith("id", 1);
      expect(revalidatePath).toHaveBeenCalledWith("/admin/suggestions");
      expect(result.success).toBe(true);
    });
  });

  describe("uploadShopPhoto", () => {
    it("should successfully insert a new shop photo", async () => {
      const insert = jest.fn().mockResolvedValue({ error: null });
      (createClient as jest.Mock).mockReturnValue({
        from: jest.fn(() => ({ insert })),
      });

      const result = await uploadShopPhoto(1, "http://example.com/photo.jpg", "user-123");

      expect(insert).toHaveBeenCalledWith([
        {
          shop_id: 1,
          photo_url: "http://example.com/photo.jpg",
          user_id: "user-123",
          is_primary: false,
          is_approved: false,
        },
      ]);
      expect(revalidatePath).toHaveBeenCalledWith("/cafe/1");
      expect(result).toEqual({ success: true });
    });

    it("should return success: false if there is a database error", async () => {
      const insert = jest.fn().mockResolvedValue({ error: { message: "DB error" } });
      (createClient as jest.Mock).mockReturnValue({
        from: jest.fn(() => ({ insert })),
      });

      const result = await uploadShopPhoto(1, "http://example.com/photo.jpg", "user-123");

      expect(insert).toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false, message: "DB error" });
    });
  });
});
