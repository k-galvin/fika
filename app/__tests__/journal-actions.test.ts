import {
  getJournalEntries,
  getAllUserJournalEntries,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "../actions";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Mock the Supabase client
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

// Mock revalidatePath
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("Journal Server Actions", () => {
  const mockUser = { id: "user-123" };
  const mockEntry = { id: "entry-1", coffee_shop_id: 1, content: "Test", visit_date: "2024-05-04" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getJournalEntries", () => {
    it("should return journal entries for a specific cafe", async () => {
      const mockData = [mockEntry];
      (createClient as jest.Mock).mockReturnValue({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      const result = await getJournalEntries(1);
      expect(result).toEqual(mockData);
    });

    it("should return empty array if user not found", async () => {
      (createClient as jest.Mock).mockReturnValue({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
      });

      const result = await getJournalEntries(1);
      expect(result).toEqual([]);
    });
  });

  describe("getAllUserJournalEntries", () => {
    it("should return all journal entries for the user", async () => {
      const mockData = [{ ...mockEntry, coffee_shops: { name: "Cafe", city: "LA" } }];
      (createClient as jest.Mock).mockReturnValue({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      const result = await getAllUserJournalEntries();
      expect(result).toEqual(mockData);
    });
  });

  describe("addJournalEntry", () => {
    it("should add a journal entry successfully", async () => {
      (createClient as jest.Mock).mockReturnValue({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({ error: null }),
      });

      const result = await addJournalEntry(1, "Great!", "2024-05-04");
      expect(result.success).toBe(true);
      expect(revalidatePath).toHaveBeenCalledWith("/cafe/1");
    });
  });

  describe("updateJournalEntry", () => {
    it("should update a journal entry successfully", async () => {
      const mockSingle = jest.fn().mockResolvedValue({ data: { coffee_shop_id: 1 } });
      const mockSelect = jest.fn(() => ({ eq: () => ({ single: mockSingle }) }));
      
      (createClient as jest.Mock).mockReturnValue({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
        from: jest.fn((table) => {
          if (table === "journal_entries") {
            return {
              select: mockSelect,
              update: () => ({ eq: () => ({ eq: () => Promise.resolve({ error: null }) }) }),
            };
          }
          return {};
        }),
      });

      const result = await updateJournalEntry("entry-1", "Updated", "2024-05-04");
      expect(result.success).toBe(true);
      expect(revalidatePath).toHaveBeenCalledWith("/cafe/1");
    });
  });

  describe("deleteJournalEntry", () => {
    it("should delete a journal entry successfully", async () => {
      (createClient as jest.Mock).mockReturnValue({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
        from: jest.fn(() => ({
          select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { coffee_shop_id: 1 } }) }) }),
          delete: () => ({ eq: () => ({ eq: () => Promise.resolve({ error: null }) }) }),
        })),
      });

      const result = await deleteJournalEntry("entry-1");
      expect(result.success).toBe(true);
      expect(revalidatePath).toHaveBeenCalledWith("/cafe/1");
    });
  });
});
