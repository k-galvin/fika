import { render, screen } from "@testing-library/react";
import { AuthButton } from "../auth-button";

const mockUser = { id: "1", email: "test@example.com" };

// Mock the next/navigation module to control router and pathname hooks
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
  usePathname: () => "/",
}));

// Mock the Supabase client and its methods
const mockSupabase = {
  auth: {
    onAuthStateChange: jest.fn().mockReturnValue({
      data: {
        subscription: {
          unsubscribe: jest.fn(),
        },
      },
    }),
    getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
    signOut: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() =>
          Promise.resolve({ data: { username: "testuser" } })
        ),
      })),
    })),
  })),
};

// Mock the Supabase client creation to ensure our mock is used
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => mockSupabase,
}));

describe("AuthButton", () => {
  it("renders sign in button when user is not authenticated", async () => {
    render(<AuthButton />);
    expect(await screen.findByText("Sign in")).toBeInTheDocument();
  });

  it("renders logout button when user is authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    render(<AuthButton />);
    expect(await screen.findByText("Logout")).toBeInTheDocument();
  });

  it("directs to login page when user is not logged in", async () => {
    render(<AuthButton />);
    const signInButton = await screen.findByText("Sign in");
    expect(signInButton.closest("a")).toHaveAttribute(
      "href",
      "/auth/login?redirect=/"
    );
  });

  it("clicking logout signs the user out", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    render(<AuthButton />);
    const logoutButton = await screen.findByText("Logout");
    logoutButton.click();
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });
});
