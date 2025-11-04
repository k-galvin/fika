import React from "react";
import { render, screen } from "@testing-library/react";
import ProfilePage from "../page";
import { getSavedCafes, getVisitedCafes } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UserVisit } from "@/lib/types";

// Mock server actions and supabase client
jest.mock("@/app/actions", () => ({
  getSavedCafes: jest.fn(),
  getVisitedCafes: jest.fn(),
}));
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => {
    const mockSingle = jest.fn(() => Promise.resolve({ data: { username: 'testuser' }, error: null }));
    const mockEq = jest.fn(() => ({
      single: mockSingle,
    }));
    const mockSelect = jest.fn(() => ({
      eq: mockEq,
    }));
    const mockFrom = jest.fn(() => ({
      select: mockSelect,
    }));

    return {
      auth: {
        getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'user-123', email: 'test@example.com', created_at: new Date().toISOString() } }, error: null })),
      },
      from: mockFrom,
    };
  }),
}));
jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => { throw new Error("redirected"); }),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  usePathname: jest.fn(() => "/"),
}));

// Mock the ProfileCharts component
jest.mock("@/components/ProfileCharts", () => {
  const MockProfileCharts = ({ visitedCafes }: { visitedCafes: UserVisit[] }) => (
    <div
      data-testid="mock-profile-charts"
      data-visited-cafes={JSON.stringify(visitedCafes)}
    ></div>
  );
  MockProfileCharts.displayName = 'ProfileCharts';
  return MockProfileCharts;
});

describe("ProfilePage", () => {
  it("redirects to login if no user is authenticated", async () => {
    (createClient as jest.Mock).mockImplementationOnce(() => ({
      auth: {
        getUser: jest.fn(() =>
          Promise.resolve({ data: { user: null }, error: null })
        ),
      },
      from: jest.fn(() => {
        throw new Error("supabase.from should not be called when user is null");
      }),
    }));

    await expect(ProfilePage()).rejects.toThrow("redirected");
    expect(redirect).toHaveBeenCalledWith("/auth/login");
  });

  it("renders user profile information", async () => {
    (getSavedCafes as jest.Mock).mockResolvedValue([]);
    (getVisitedCafes as jest.Mock).mockResolvedValue([]);

    render(await ProfilePage());

    expect(screen.getByText("testuser's Profile")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("Account Information")).toBeInTheDocument();
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
    (getSavedCafes as jest.Mock).mockResolvedValue([]);
    (getVisitedCafes as jest.Mock).mockResolvedValue(mockVisitedCafes);

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
    (getSavedCafes as jest.Mock).mockResolvedValue(mockSavedCafes);
    (getVisitedCafes as jest.Mock).mockResolvedValue(mockVisitedCafes);

    render(await ProfilePage());
  });
});
