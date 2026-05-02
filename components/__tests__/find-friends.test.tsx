import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { FindFriends } from "@/components/find-friends";
import { useSearchParams } from "next/navigation";
import { sendFriendRequest } from "@/app/actions";

jest.mock("@/app/actions", () => ({
  acceptFriendRequest: jest.fn(),
  denyFriendRequest: jest.fn(),
  unfriendUser: jest.fn(),
  sendFriendRequest: jest.fn(() => Promise.resolve({ success: true, message: "Request sent" })),
  unsendFriendRequest: jest.fn(() => Promise.resolve({ success: true, message: "Request unsent" })),
}));



jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: "user-123" } },
      }),
    },
    from: jest.fn((tableName) => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({ data: [], error: null }),
        or: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        then: jest.fn((cb) => cb({ data: [], error: null })), // Default empty data
      };

      if (tableName === "profiles") {
        mockQuery.ilike = jest.fn().mockResolvedValue({
          data: [
            { id: "user-456", username: "testuser", full_name: "Test User", avatar_url: null },
          ],
          error: null,
        });
      }
      return mockQuery;
    }),
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


  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the search bar", async () => {
    await act(async () => {
      render(<FindFriends />);
    });
    expect(
      screen.getByPlaceholderText("Search for friends...")
    ).toBeInTheDocument();
  });

  it("searches for users and displays them", async () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("search=test")
    );
    await act(async () => {
      render(<FindFriends />);
    });

    await waitFor(() => {
      expect(screen.getByText("testuser")).toBeInTheDocument();
    });
  });

  it('sends a friend request when "Add Friend" is clicked', async () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("search=test")
    );
    await act(async () => {
      render(<FindFriends />);
    });

    await waitFor(() => {
      expect(screen.getByText("testuser")).toBeInTheDocument();
    });

    const addButton = screen.getByText("Add Friend");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(sendFriendRequest).toHaveBeenCalledWith("user-456");
    });

    expect(await screen.findByText("Request Sent")).toBeInTheDocument();
  });
});
