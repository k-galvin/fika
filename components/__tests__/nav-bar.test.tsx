import { render, screen, within } from "@testing-library/react";
import { User } from "@supabase/supabase-js";
import { NavBar } from "../nav-bar";
import { usePathname } from "next/navigation";

// Mock Supabase client
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    auth: {
      onAuthStateChange: jest.fn(() => ({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })),
      signOut: jest.fn(),
    },
  })),
}));

// Mock Next.js navigation hooks
const mockBack = jest.fn();
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    refresh: jest.fn(),
    back: mockBack,
    push: mockPush,
  })),
  usePathname: jest.fn(() => "/mock-path"),
}));

jest.mock("@/app/theme-context", () => ({
  useTheme: () => ({ isAfterHours: false, setIsAfterHours: jest.fn() }),
}));

describe("NavBar", () => {
  const authButton = <button>auth</button>;

  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue("/mock-path");
  });

  it("should render navigation links and auth button for logged-out user", () => {
    render(<NavBar user={null} profile={null} authButton={authButton} />);

    // Desktop view assertions
    expect(screen.getByRole("link", { name: "fika" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "auth" })).toBeInTheDocument();

    // Mobile tab bar assertions (logged out)
    const tabBar = screen.getByRole("navigation", { name: "Primary" });
    expect(within(tabBar).getByRole("link", { name: "home" })).toHaveAttribute("href", "/");
    expect(within(tabBar).getByRole("link", { name: "discover" })).toHaveAttribute("href", "/discover");
    expect(within(tabBar).getByRole("link", { name: "sign in" })).toHaveAttribute(
      "href",
      "/auth/login?redirect=/mock-path"
    );
    expect(within(tabBar).queryByRole("link", { name: "profile" })).not.toBeInTheDocument();
    expect(within(tabBar).queryByRole("link", { name: "journal" })).not.toBeInTheDocument();
  });

  it("should render navigation links and auth button for logged-in user", () => {
    const loggedInUser = {
      id: "123",
      email: "test@example.com",
      user_metadata: {
        username: "testuser",
      },
    };

    render(<NavBar user={loggedInUser as unknown as User} profile={null} authButton={authButton} />);

    // Desktop view assertions
    expect(screen.getByRole("link", { name: "fika" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "auth" })).toBeInTheDocument();

    // Mobile tab bar assertions (logged in)
    const tabBar = screen.getByRole("navigation", { name: "Primary" });
    expect(within(tabBar).getByRole("link", { name: "discover" })).toBeInTheDocument();
    expect(within(tabBar).getByRole("link", { name: "journal" })).toHaveAttribute("href", "/journal");
    expect(within(tabBar).getByRole("link", { name: "profile" })).toHaveAttribute("href", "/profile");
    expect(within(tabBar).queryByRole("link", { name: "sign in" })).not.toBeInTheDocument();
  });

  it("marks the current tab as active", () => {
    (usePathname as jest.Mock).mockReturnValue("/discover");
    render(<NavBar user={null} profile={null} authButton={authButton} />);

    const tabBar = screen.getByRole("navigation", { name: "Primary" });
    expect(within(tabBar).getByRole("link", { name: "discover" })).toHaveAttribute("aria-current", "page");
    expect(within(tabBar).getByRole("link", { name: "home" })).not.toHaveAttribute("aria-current");
  });

  it("shows a back button on cafe pages and hides it elsewhere", async () => {
    const { rerender } = render(
      <NavBar user={null} profile={null} authButton={authButton} />
    );
    expect(screen.queryByRole("button", { name: "Go back" })).not.toBeInTheDocument();

    (usePathname as jest.Mock).mockReturnValue("/cafe/42");
    rerender(<NavBar user={null} profile={null} authButton={authButton} />);

    const back = screen.getByRole("button", { name: "Go back" });
    back.click();
    // jsdom starts with a single history entry, so we fall back to /discover.
    expect(mockPush).toHaveBeenCalledWith("/discover");
  });
});
