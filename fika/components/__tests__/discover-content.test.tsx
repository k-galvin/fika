import { render, screen, fireEvent } from "@testing-library/react";
import { DiscoverContent } from "../discover-content";
import { CoffeeShop } from "@/lib/types";
import { useTheme } from "@/app/theme-context";

const createMockCoffeeShop = (id: number): CoffeeShop => ({
  id,
  name: `Cafe ${id}`,
  shop_photos: [{ photo_url: `https://example.com/cafe${id}.jpg` }],
  busyness: "Medium",
  city: "Los Angeles",
  has_outlets: true,
  has_wifi: true,
  is_featured: false,
  is_laptop_friendly: true,
  parking: "Easy",
  pricing: "$$",
  seating: "Plenty",
  summary: "A great place to work and drink coffee.",
  vibe: "Cozy",
  wine_bar: false,
  isInitiallySaved: false,
  isInitiallyVisited: false,
  ratings: [],
  address: "",
});

const MOCK_SHOPS: CoffeeShop[] = [
  createMockCoffeeShop(1),
  createMockCoffeeShop(2),
];

const MOCK_SHOPS_FULL_PAGE: CoffeeShop[] = Array.from({ length: 20 }, (_, i) =>
  createMockCoffeeShop(i + 1)
);

const MOCK_SHOPS_NEXT_PAGE: CoffeeShop[] = Array.from({ length: 5 }, (_, i) =>
  createMockCoffeeShop(i + 21)
);

// Mock the useTheme hook
jest.mock("@/app/theme-context", () => ({
  ...jest.requireActual("@/app/theme-context"),
  useTheme: jest.fn(),
}));

// Mock URLSearchParams for next/navigation
const mockSearchParams = new URLSearchParams();

// Mock the next/navigation module
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => mockSearchParams,
}));

// Mock the Supabase client
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn((tableName) => {
      if (tableName === "coffee_shops") {
        return {
          select: jest.fn(() => ({
            eq: jest.fn().mockReturnThis(),
            is: jest.fn().mockReturnThis(),
            range: jest.fn((from) => {
              if (from === 0) {
                return {
                  then: jest.fn((resolve) =>
                    resolve({ data: MOCK_SHOPS_FULL_PAGE, error: null })
                  ),
                };
              } else if (from === 20) {
                return {
                  then: jest.fn((resolve) =>
                    resolve({ data: MOCK_SHOPS_NEXT_PAGE, error: null })
                  ),
                };
              }
              return {
                then: jest.fn((resolve) => resolve({ data: [], error: null })),
              };
            }),
          })),
        };
      } else if (tableName === "ratings") {
        return {
          select: jest.fn(() => ({
            eq: jest.fn().mockReturnThis(),
            then: jest.fn((resolve) => resolve({ data: [], error: null })),
          })),
        };
      }
      return {};
    }),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
    },
  })),
}));

// Mock the server action
jest.mock("@/app/actions", () => ({
  toggleVisit: jest.fn(),
}));

// Mock Supabase database types
jest.mock("@/lib/supabase/database.types", () => ({
  Constants: {
    public: {
      Enums: {
        Cities: [],
        "Parking Difficulty": [],
        "Seating Availability": [],
        Vibe: [],
        Pricing: [],
        Busyness: [],
      },
    },
  },
}));

describe("DiscoverContent", () => {
  it("renders a list of cafe cards", async () => {
    (useTheme as jest.Mock).mockReturnValue({ isAfterHours: false });
    render(<DiscoverContent initialShops={MOCK_SHOPS} user={null} />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();

    expect(await screen.findByText("Cafe 1")).toBeInTheDocument();
    expect(await screen.findByText("Cafe 2")).toBeInTheDocument();
  });

  it("renders 'No shops found' message when initialShops is empty", () => {
    (useTheme as jest.Mock).mockReturnValue({ isAfterHours: false });
    render(<DiscoverContent initialShops={[]} user={null} />);
    expect(
      screen.getByText("No shops found matching your criteria.")
    ).toBeInTheDocument();
  });

  it("renders 'Load More' button when there are more shops to load", () => {
    (useTheme as jest.Mock).mockReturnValue({ isAfterHours: false });
    render(<DiscoverContent initialShops={MOCK_SHOPS_FULL_PAGE} user={null} />);
    expect(screen.getByText("Load More")).toBeInTheDocument();
  });

  it("clicking 'Load More' fetches and displays more shops", async () => {
    (useTheme as jest.Mock).mockReturnValue({ isAfterHours: false });
    render(<DiscoverContent initialShops={MOCK_SHOPS_FULL_PAGE} user={null} />);

    const loadMoreButton = screen.getByText("Load More");
    fireEvent.click(loadMoreButton);

    expect(await screen.findByText("Cafe 21")).toBeInTheDocument();
    expect(screen.getByText("Cafe 25")).toBeInTheDocument();
  });
});
