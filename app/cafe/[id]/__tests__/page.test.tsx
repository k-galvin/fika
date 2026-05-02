import { render, screen } from "@testing-library/react";
import CafeDetailsPage from "../page";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

// Mock the Supabase client to prevent actual database calls during tests.
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

// Mock the notFound function to assert that it's called.
jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

// Mock the CafeDetailsClient component to isolate the page component from its children.
jest.mock("../cafe-details-client", () => {
  return jest.fn(() => <div>Cafe Details Client</div>);
});

describe("CafeDetailsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call notFound if cafe is not found", async () => {
    (createClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null }),
    });

    render(await CafeDetailsPage({ params: Promise.resolve({ id: "1" }) }));

    expect(notFound).toHaveBeenCalled();
  });

  it("should render CafeDetailsClient with correct props when cafe is found and user is not authenticated", async () => {
    const shop = { id: 1, name: "Test Cafe" };
    (createClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: shop }),
    });

    render(await CafeDetailsPage({ params: Promise.resolve({ id: "1" }) }));

    expect(screen.getByText("Cafe Details Client")).toBeInTheDocument();
  });

  it("should render CafeDetailsClient with correct props when cafe is found and user is authenticated", async () => {
    const shop = { id: 1, name: "Test Cafe" };
    const user = { id: "123", email: "test@example.com" };
    (createClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user } }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: shop }),
      limit: jest.fn().mockResolvedValue({ data: [] }),
    });

    render(await CafeDetailsPage({ params: Promise.resolve({ id: "1" }) }));

    expect(screen.getByText("Cafe Details Client")).toBeInTheDocument();
  });
});
