import {
  saveCafe,
  unsaveCafe,
  isCafeSaved,
  getSavedCafes,
  toggleVisitedCafe,
  getVisitedCafes,
  hasUserVisitedCafe,
  logout,
} from "../actions";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Mock the Supabase client to prevent actual database calls during tests.
jest.mock("@/lib/supabase/server", () => ({
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
        single: jest
          .fn()
          .mockResolvedValue({
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

  describe("toggleVisitedCafe", () => {
    it("should return success: false if user is not authenticated", async () => {
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      });

      const result = await toggleVisitedCafe(1, false);

      expect(result).toEqual({ success: false, message: "User not found" });
    });

    it("should insert a new visited cafe and return success: true", async () => {
      const user = { id: "123", email: "test@example.com" };
      (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user } }),
        },
        from: () => ({
          insert: () => Promise.resolve({ error: null }),
        }),
      });

      const result = await toggleVisitedCafe(1, false);

      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/cafe/1");
      expect(revalidatePath).toHaveBeenCalledWith("/profile");
    });

    it("should delete a visited cafe and return success: true", async () => {
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

      const result = await toggleVisitedCafe(1, true);

      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/cafe/1");
      expect(revalidatePath).toHaveBeenCalledWith("/profile");
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
                limit: () =>
                  Promise.resolve({ data: [{ id: 1 }], error: null }),
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
                limit: () => Promise.resolve({ data: [], error: null }),
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
                limit: () =>
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
});
