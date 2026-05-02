import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { User } from "@supabase/supabase-js";
import { NavBar } from "../nav-bar";

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
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(() => "/mock-path"),
}));

describe("NavBar", () => {
  const authButton = <button>auth</button>;

  it("should render navigation links and auth button for logged-out user", async () => {
    render(<NavBar user={null} authButton={authButton} />);

    // Desktop view assertions
    const fikaLink = screen.getByRole("link", { name: "fika" });
    const discoverLinkDesktop = screen.getByRole("link", { name: "discover" });
    const authButtonDesktop = screen.getByRole("button", { name: "auth" });

    expect(fikaLink).toBeInTheDocument();
    expect(discoverLinkDesktop).toBeInTheDocument();
    expect(authButtonDesktop).toBeInTheDocument();

    // Mobile dropdown assertions (logged out)
    const toggleMenuButton = screen.getByRole("button", {
      name: "Toggle menu",
    });
    await userEvent.click(toggleMenuButton); // Open the dropdown

    const discoverLinkMobile = await screen.findByRole("menuitem", {
      name: "discover",
    });
    const signInLinkMobile = screen.queryByRole("menuitem", {
      name: "sign in",
    });
    const profileLinkMobile = screen.queryByRole("menuitem", {
      name: "profile",
    });
    const logoutTextMobile = screen.queryByRole("menuitem", {
      name: "log out",
    });

    expect(discoverLinkMobile).toBeInTheDocument();
    expect(signInLinkMobile).toBeInTheDocument();
    expect(profileLinkMobile).not.toBeInTheDocument();
    expect(logoutTextMobile).not.toBeInTheDocument();
  });

  it("should render navigation links and auth button for logged-in user", async () => {
    // Mock a logged-in user
    const loggedInUser = {
      id: "123",
      email: "test@example.com",
      user_metadata: {
        username: "testuser",
      },
    };

    render(<NavBar user={loggedInUser as User} authButton={authButton} />); // Cast to any to satisfy User type expectation

    // Desktop view assertions (same as logged-out)
    const fikaLink = screen.getByRole("link", { name: "fika" });
    const discoverLinkDesktop = screen.getByRole("link", { name: "discover" });
    const authButtonDesktop = screen.getByRole("button", { name: "auth" });

    expect(fikaLink).toBeInTheDocument();
    expect(discoverLinkDesktop).toBeInTheDocument();
    expect(authButtonDesktop).toBeInTheDocument();

    // Mobile dropdown assertions (logged in)
    const toggleMenuButton = screen.getByRole("button", {
      name: "Toggle menu",
    });
    await userEvent.click(toggleMenuButton); // Open the dropdown

    const discoverLinkMobile = await screen.findByRole("menuitem", {
      name: "discover",
    });
    const profileLinkMobile = await screen.findByRole("menuitem", {
      name: "profile",
    });
    const logoutTextMobile = screen.queryByRole("menuitem", {
      name: "log out",
    });
    const signInLinkMobile = screen.queryByRole("menuitem", {
      name: "sign in",
    });

    expect(discoverLinkMobile).toBeInTheDocument();
    expect(profileLinkMobile).toBeInTheDocument();
    expect(logoutTextMobile).toBeInTheDocument();
    expect(signInLinkMobile).not.toBeInTheDocument();
  });
});
