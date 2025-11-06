import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FindFriends } from "@/components/find-friends";
import { useSearchParams } from "next/navigation";

const from = jest.fn();
const insert = jest.fn();
const ilike = jest.fn();

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: "user-123" } },
      }),
    },
    from: from,
  })),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  })),
  useSearchParams: jest.fn(() => new URLSearchParams("")),
  usePathname: jest.fn(() => ""),
}));

describe("FindFriends", () => {
  beforeEach(() => {
    from.mockImplementation((tableName) => {
      if (tableName === "profiles") {
        return {
          select: jest.fn().mockReturnThis(),
          ilike,
        };
      }

      if (tableName === "friendships") {
        return {
          select: jest.fn().mockReturnThis(),
          insert,
          or: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      }

      return {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockReturnThis(),
      };
    });

    ilike.mockResolvedValue({
      data: [
        {
          id: "user-456",
          username: "testuser",
          full_name: "Test User",
          avatar_url: null,
        },
      ],
      error: null,
    });

    insert.mockResolvedValue({ data: [], error: null });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the search bar", () => {
    render(<FindFriends />);
    expect(
      screen.getByPlaceholderText("Search for friends...")
    ).toBeInTheDocument();
  });

  it("searches for users and displays them", async () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("search=test")
    );
    render(<FindFriends />);

    await waitFor(() => {
      expect(screen.getByText("testuser")).toBeInTheDocument();
    });
  });

  it('sends a friend request when "Add Friend" is clicked', async () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("search=test")
    );
    render(<FindFriends />);

    await waitFor(() => {
      expect(screen.getByText("testuser")).toBeInTheDocument();
    });

    const addButton = screen.getByText("Add Friend");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(from).toHaveBeenCalledWith("friendships");
      expect(insert).toHaveBeenCalledWith([
        { user_id: "user-123", friend_id: "user-456", status: "pending" },
      ]);
    });

    expect(await screen.findByText("Request Sent")).toBeInTheDocument();
  });
});
