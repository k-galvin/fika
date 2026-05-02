import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CafeQuickView } from "../cafe-quick-view";
import { CoffeeShop } from "@/lib/types";
import { useTheme } from "@/app/theme-context";
import { User } from "@supabase/supabase-js";

const MOCK_USER: User = {
  id: "1",
  email: "test@example.com",
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
  phone: "",
  role: "authenticated",
  updated_at: new Date().toISOString(),
  identities: [],
  factors: [],
};

const MOCK_SHOP: CoffeeShop = {
  id: 1,
  name: "Fika Cafe",
  address: "123 Main St",
  shop_photos: [
    {
      id: 1,
      photo_url: "https://example.com/cafe.jpg",
      is_primary: true,
      is_approved: true,
    },
  ],
  busyness: "Medium",
  city: "Los Angeles",
  has_outlets: true,
  has_wifi: true,
  is_featured: false,
  is_laptop_friendly: true,
  parking: "Easy",
  pricing: "$",
  seating: "Plenty",
  summary: "A great place to work and drink coffee.",
  vibe: "Cozy",
  wine_bar: false,
  isInitiallySaved: false,
  isInitiallyVisited: false,
  ratings: [],
};

// Mock the useTheme hook
jest.mock("@/app/theme-context", () => ({
  ...jest.requireActual("@/app/theme-context"),
  useTheme: jest.fn(),
}));

const mockPush = jest.fn();
const mockRefresh = jest.fn();

// Mock the useRouter hook directly
jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"), // Use actual module for other exports like usePathname
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  usePathname: () => "/", // Keep usePathname mock if needed
}));

// Mock next/link to ensure clicks on Link components trigger mockPush
jest.mock("next/link", () => {
  // Directly return a named functional component
  const Link = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => {
    return (
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault(); // Prevent default link behavior
          mockPush(href); // Call our mocked router push
        }}
      >
        {children}
      </a>
    );
  };
  Link.displayName = 'Link'; // Set display name
  return Link; // Return the named component
});

// Mock the Supabase client
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      delete: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
}));

// Mock the server action
jest.mock("@/app/actions", () => ({
  toggleVisit: jest.fn(),
  rateCafe: jest.fn(),
  getUserRatingForCafe: jest.fn(),
  saveCafe: jest.fn(),
  unsaveCafe: jest.fn(),
}));

describe("CafeQuickView", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockRefresh.mockClear();
    // Clear other mocks if they are also jest.fn() defined outside and used across tests
  });
  it("renders cafe name and photo", () => {
    (useTheme as jest.Mock).mockReturnValue({ isAfterHours: false });
    render(
      <CafeQuickView
        shop={MOCK_SHOP}
        user={null}
        isInitiallySaved={false}
        isInitiallyVisited={false}
      />
    );

    expect(screen.getByText("Fika Cafe")).toBeInTheDocument();
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("src");
  });

  it("navigates to the correct cafe page on card click", async () => {
    (useTheme as jest.Mock).mockReturnValue({ isAfterHours: false });
    render(
      <CafeQuickView
        shop={MOCK_SHOP}
        user={null}
        isInitiallySaved={false}
        isInitiallyVisited={false}
      />
    );

    // Find the Link wrapping the entire card
    const cardLink = screen.getByRole("link", { name: /fika cafe/i });
    expect(cardLink).toHaveAttribute("href", "/cafe/1");

    // Simulate a click on the link
    await userEvent.click(cardLink);

    // Assert that mockPush was called
    expect(mockPush).toHaveBeenCalledWith("/cafe/1");
  });

  it("renders log visit and save buttons when a user is provided", () => {
    (useTheme as jest.Mock).mockReturnValue({ isAfterHours: false });
    render(
      <CafeQuickView
        shop={MOCK_SHOP}
        user={MOCK_USER}
        isInitiallySaved={false}
        isInitiallyVisited={false}
      />
    );

    expect(screen.getByTestId("plus-icon")).toBeInTheDocument();
    expect(screen.getByTestId("bookmark-icon")).toBeInTheDocument();
  });
});
