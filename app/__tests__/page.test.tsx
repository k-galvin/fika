
import { render, screen } from "@testing-library/react";
import Home from "../page";
import { getUser } from "@/lib/supabase/server";

// Mock the Supabase server functions
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
  getUser: jest.fn(),
}));

// Mock the FeaturedCafes component
jest.mock("../featured-cafes", () => ({
  FeaturedCafes: () => <h2>Current Favorites</h2>,
}));

// Mock the FriendFeed component
jest.mock("@/components/friend-feed", () => ({
  FriendFeed: () => <div>Friend Feed</div>,
  FriendFeedSkeleton: () => <div>Loading Friends...</div>,
}));

// Mock the Footer component
jest.mock("@/components/footer", () => ({
  Footer: () => <footer>Mock Footer</footer>,
}));

describe("Home page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for getUser to return a user
    (getUser as jest.Mock).mockResolvedValue({ user: { id: "123" } });
  });

  it("should render the current favorites section", async () => {
    render(await Home());

    expect(screen.getByText("Current Favorites")).toBeInTheDocument();
    expect(screen.getByText("Mock Footer")).toBeInTheDocument();
  });
});
