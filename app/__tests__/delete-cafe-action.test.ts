import { deleteCafe, getAllCafes } from "../actions";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceRoleClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Mock the Supabase clients
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

// Mock the revalidatePath function
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("deleteCafe Action", () => {
  let mockSupabase: any;
  let mockServiceRoleSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSupabase = {
      rpc: jest.fn(),
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    // Create a mock chainable object
    const mockChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      then: (cb: any) => Promise.resolve(cb({ data: null, error: null })),
    };

    // Cast to any to avoid TS issues with the mock
    (mockChain as any).mockResolvedValue = (val: any) => {
      mockChain.eq.mockResolvedValue(val);
      return mockChain;
    };

    mockServiceRoleSupabase = {
      from: jest.fn(() => mockChain),
      storage: {
        from: jest.fn().mockReturnThis(),
        remove: jest.fn().mockResolvedValue({ error: null }),
      },
    };
    
    (createServiceRoleClient as jest.Mock).mockReturnValue(mockServiceRoleSupabase);
    
    // Store references to mockChain methods for easier setup in tests
    (mockServiceRoleSupabase as any).mockChain = mockChain;
  });

  it("should return unauthorized if user is not an admin", async () => {
    mockSupabase.rpc.mockResolvedValue({ data: false });

    const result = await deleteCafe(1);

    expect(result).toEqual({ success: false, message: "Unauthorized" });
  });

  it("should delete cafe and its photos successfully", async () => {
    mockSupabase.rpc.mockResolvedValue({ data: true });
    
    const mockPhotos = [{ photo_url: "http://example.com/storage/v1/object/public/images/cafe1/photo1.jpg" }];
    
    // Setup the mock chain to return photos when fetching, then success for deletes
    mockServiceRoleSupabase.from.mockImplementation((table: string) => {
      if (table === "shop_photos") {
        return {
          select: jest.fn().mockReturnThis(),
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn()
            .mockResolvedValueOnce({ data: mockPhotos }) // First call: fetch photos
            .mockResolvedValue({ error: null }),       // Subsequent calls: delete
        };
      }
      return {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
    });

    const result = await deleteCafe(1);

    expect(result.success).toBe(true);
    expect(mockServiceRoleSupabase.storage.from).toHaveBeenCalledWith("images");
    expect(mockServiceRoleSupabase.storage.remove).toHaveBeenCalledWith(["cafe1/photo1.jpg"]);
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/discover");
  });

  it("should return error if database deletion fails", async () => {
    mockSupabase.rpc.mockResolvedValue({ data: true });
    
    mockServiceRoleSupabase.from.mockImplementation((table: string) => {
      if (table === "shop_photos") {
        return {
          select: jest.fn().mockReturnThis(),
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn()
            .mockResolvedValueOnce({ data: [] }) // Fetch photos
            .mockResolvedValue({ error: null }),  // Delete photos
        };
      }
      if (table === "coffee_shops") {
        return {
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ error: { message: "Delete failed" } }),
        };
      }
      return {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
    });

    const result = await deleteCafe(1);

    expect(result.success).toBe(false);
    expect(result.message).toBe("Delete failed");
  });
});

describe("getAllCafes Action", () => {
  it("should return all cafes ordered by name", async () => {
    const mockCafes = [{ id: 1, name: "Cafe A" }, { id: 2, name: "Cafe B" }];
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockCafes, error: null }),
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    const result = await getAllCafes();

    expect(result).toEqual(mockCafes);
    expect(mockSupabase.from).toHaveBeenCalledWith("coffee_shops");
    expect(mockSupabase.order).toHaveBeenCalledWith("name");
  });
});
