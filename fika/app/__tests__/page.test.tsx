
import { render, screen } from "@testing-library/react";
import Home from "../page";
import { createClient } from "@/lib/supabase/server";

// Mock the Supabase client
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

// Mock the FeaturedCafes component
jest.mock("../featured-cafes", () => ({
  FeaturedCafes: () => <div>Featured Cafes</div>,
}));

// Mock the Footer component
jest.mock("@/components/footer", () => ({
  Footer: () => <footer>Mock Footer</footer>,
}));

describe("Home page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for createClient to return a user
    (createClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: "123" } } }),
      },
    });
  });

  it("should render the welcome message and featured cafes", async () => {
    render(await Home());

    expect(
      screen.getByRole("heading", { name: /welcome to fika/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Featured Cafes")).toBeInTheDocument();
    expect(screen.getByText("Mock Footer")).toBeInTheDocument();
  });
});
