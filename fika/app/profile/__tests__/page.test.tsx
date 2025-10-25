import { render, screen } from "@testing-library/react";
import ProfilePage from "../page";
import { createClient } from "@/lib/supabase/server";
import { getSavedCafes, getVisitedCafes } from "@/app/actions";
import { redirect } from "next/navigation";

// Mock the Supabase client to prevent actual database calls during tests.
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

// Mock the server actions to isolate the page component from the actions.
jest.mock("@/app/actions", () => ({
  getSavedCafes: jest.fn(),
  getVisitedCafes: jest.fn(),
}));

// Mock the redirect function to assert that it's called and to prevent errors.
jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

// Mock the ProfileCafes component to isolate the page component from its children.
jest.mock("@/components/profile-cafes", () => ({
  ProfileCafes: jest.fn(() => <div>Profile Cafes</div>),
}));

describe("ProfilePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should redirect to login if user is not authenticated", async () => {
    (createClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: null }),
          })),
        })),
      })),
    });

    try {
      render(await ProfilePage());
    } catch (error) {
      expect((error as Error).message).toBe("NEXT_REDIRECT");
    }

    expect(redirect).toHaveBeenCalledWith("/auth/login");
  });

  it("should render profile information if user is authenticated", async () => {
    const user = {
      id: "123",
      email: "test@example.com",
      created_at: new Date().toISOString(),
    };
    const profile = { username: "testuser" };
    const savedCafes = [{ id: 1, name: "Saved Cafe" }];
    const visitedCafes = [{ id: 2, name: "Visited Cafe" }];

    (createClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user } }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: profile }),
    });

    (getSavedCafes as jest.Mock).mockResolvedValue(savedCafes);
    (getVisitedCafes as jest.Mock).mockResolvedValue(visitedCafes);

    render(await ProfilePage());

    expect(screen.getByText("testuser's Profile")).toBeInTheDocument();
    expect(screen.getByText("Account Information")).toBeInTheDocument();
    expect(screen.getByText("Profile Cafes")).toBeInTheDocument();
  });
});
