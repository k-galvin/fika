import { redirect } from "next/navigation";
import React from "react";
import { render, screen } from "@testing-library/react";
import ProfilePage from "@/app/profile/page";
import { getSavedCafes, getVisitedCafes, getCafeCount } from "@/app/actions";
import { getUser, getProfile } from "@/lib/supabase/server";
import { UserVisit } from "@/lib/types";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: jest.fn(() => "/"),
  redirect: jest.fn(() => {
    throw new Error("redirected");
  }),
}));

// Mock server actions
jest.mock("@/app/actions");
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    rpc: jest.fn(() => Promise.resolve({ data: false, error: null })),
  })),
  getUser: jest.fn(),
  getProfile: jest.fn(),
}));

// Mock the ProfileCharts component
jest.mock("@/components/ProfileCharts", () => {
  const MockProfileCharts = ({
    visitedCafes,
  }: {
    visitedCafes: UserVisit[];
  }) => (
    <div
      data-testid="mock-profile-charts"
      data-visited-cafes={JSON.stringify(visitedCafes)}
    ></div>
  );
  MockProfileCharts.displayName = "ProfileCharts";
  return MockProfileCharts;
});

// Mock the ProfileCafes component
jest.mock("@/components/profile-cafes", () => ({
  ProfileCafes: () => <div data-testid="mock-profile-cafes"></div>,
}));

// Mock the FindFriends component
jest.mock("@/components/find-friends", () => ({
  FindFriends: () => <div data-testid="mock-find-friends"></div>,
}));

describe("ProfilePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to login if no user is authenticated", async () => {
    (getUser as jest.Mock).mockResolvedValue({ user: null });

    await expect(ProfilePage()).rejects.toThrow("redirected");
    expect(redirect).toHaveBeenCalledWith("/auth/login");
  });

  it("renders user profile information", async () => {
    (getUser as jest.Mock).mockResolvedValue({
      user: { id: "user-123", email: "test@example.com", created_at: new Date().toISOString() }
    });
    (getProfile as jest.Mock).mockResolvedValue({ profile: { username: "testuser" } });
    (getSavedCafes as jest.Mock).mockResolvedValue([]);
    (getVisitedCafes as jest.Mock).mockResolvedValue([]);
    (getCafeCount as jest.Mock).mockResolvedValue(0);

    render(await ProfilePage());

    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("Member Details")).toBeInTheDocument();
  });

  it("renders ProfileCharts with visited cafes", async () => {
    const mockVisitedCafes = [
      {
        id: "visit1",
        coffee_shop_id: 1,
        coffee_shops: { id: 1, name: "Cafe 1" },
      },
      {
        id: "visit2",
        coffee_shop_id: 2,
        coffee_shops: { id: 2, name: "Cafe 2" },
      },
    ];
    (getUser as jest.Mock).mockResolvedValue({
      user: { id: "user-123", email: "test@example.com", created_at: new Date().toISOString() }
    });
    (getProfile as jest.Mock).mockResolvedValue({ profile: { username: "testuser" } });
    (getSavedCafes as jest.Mock).mockResolvedValue([]);
    (getVisitedCafes as jest.Mock).mockResolvedValue(mockVisitedCafes);
    (getCafeCount as jest.Mock).mockResolvedValue(0);

    render(await ProfilePage());

    const profileCharts = screen.getByTestId("mock-profile-charts");
    expect(profileCharts).toBeInTheDocument();
    expect(JSON.parse(profileCharts.dataset.visitedCafes || "[]")).toEqual(
      mockVisitedCafes
    );
  });

  it("renders ProfileCafes with saved and visited cafes", async () => {
    const mockSavedCafes = [
      {
        id: "saved1",
        coffee_shop_id: 3,
        coffee_shops: { id: 3, name: "Cafe 3" },
      },
    ];
    const mockVisitedCafes = [
      {
        id: "visit1",
        coffee_shop_id: 1,
        coffee_shops: { id: 1, name: "Cafe 1" },
      },
    ];
    (getUser as jest.Mock).mockResolvedValue({
      user: { id: "user-123", email: "test@example.com", created_at: new Date().toISOString() }
    });
    (getProfile as jest.Mock).mockResolvedValue({ profile: { username: "testuser" } });
    (getSavedCafes as jest.Mock).mockResolvedValue(mockSavedCafes);
    (getVisitedCafes as jest.Mock).mockResolvedValue(mockVisitedCafes);
    (getCafeCount as jest.Mock).mockResolvedValue(0);

    render(await ProfilePage());
  });
});
