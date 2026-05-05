import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DiscoverContent } from "@/components/discover-content";
import { act } from "react";
import { useTheme } from "@/app/theme-context";
import { CoffeeShop } from "@/lib/types";

jest.mock("@/app/theme-context", () => ({
  useTheme: jest.fn(),
}));

const createMockCoffeeShop = (id: number): CoffeeShop => ({
  id,
  name: `Cafe ${id}`,
  shop_photos: [
    {
      photo_url: `https://example.com/cafe${id}.jpg`,
      id: 0,
      is_primary: null,
      is_approved: null,
    },
  ],
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
  createMockCoffeeShop(i)
);

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
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          ilike: jest.fn(() => ({
            order: jest.fn(() => ({
              range: jest.fn((from, to) => {
                const data = Array.from({ length: to - from + 1 }, (_, i) => ({
                  id: i + from,
                  name: `Cafe ${i + from}`,
                }));
                return Promise.resolve({ data });
              }),
            })),
          })),
          order: jest.fn(() => ({
            range: jest.fn((from, to) => {
              const data = Array.from({ length: to - from + 1 }, (_, i) => ({
                id: i + from,
                name: `Cafe ${i + from}`,
              }));
              return Promise.resolve({ data });
            }),
          })),
        })),
        ilike: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn((from, to) => {
              const data = Array.from({ length: to - from + 1 }, (_, i) => ({
                id: i + from,
                name: `Cafe ${i + from}`,
              }));
              return Promise.resolve({ data });
            }),
          })),
        })),
        order: jest.fn(() => ({
          range: jest.fn((from, to) => {
            const data = Array.from({ length: to - from + 1 }, (_, i) => ({
              id: i + from,
              name: `Cafe ${i + from}`,
            }));
            return Promise.resolve({ data });
          }),
        })),
        range: jest.fn((from, to) => {
          const data = Array.from({ length: to - from + 1 }, (_, i) => ({
            id: i + from,
            name: `Cafe ${i + from}`,
          }));
          return Promise.resolve({ data });
        }),
      })),
    })),
  })),
}));

jest.mock("@/app/actions", () => ({
  getCities: jest.fn(() => Promise.resolve([])),
  suggestCafe: jest.fn(),
  getSuggestedCafes: jest.fn(),
  approveSuggestion: jest.fn(),
  denySuggestion: jest.fn(),
  toggleFeaturedCafe: jest.fn(),
  getFeaturedCafes: jest.fn(),
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

import { User } from "@supabase/supabase-js";

describe("DiscoverContent", () => {
  const mockUser: User = { id: "user-1" } as User;

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ isAfterHours: false });
  });

  it("renders a list of cafe cards", async () => {
    (useTheme as jest.Mock).mockReturnValue({ isAfterHours: false });
    render(<DiscoverContent initialShops={MOCK_SHOPS} user={null} cities={[]} />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();

    expect(await screen.findByText("Cafe 1")).toBeInTheDocument();
    expect(await screen.findByText("Cafe 2")).toBeInTheDocument();
  });

  it("renders 'No shops found' message when initialShops is empty", () => {
    (useTheme as jest.Mock).mockReturnValue({ isAfterHours: false });
    render(<DiscoverContent initialShops={[]} user={null} cities={[]} />);
    expect(
      screen.getByText("No shops found matching your criteria.")
    ).toBeInTheDocument();
  });

  it("renders 'Load More' button when there are more shops to load", () => {
    (useTheme as jest.Mock).mockReturnValue({ isAfterHours: false });
    render(<DiscoverContent initialShops={MOCK_SHOPS_FULL_PAGE} user={null} cities={[]} />);
    expect(screen.getByText("load more")).toBeInTheDocument();
  });

  it("clicking 'Load More' fetches and displays more shops", async () => {
    (useTheme as jest.Mock).mockReturnValue({ isAfterHours: false });
    render(<DiscoverContent initialShops={MOCK_SHOPS_FULL_PAGE} user={null} cities={[]} />);

    const loadMoreButton = screen.getByText("load more");
    await act(async () => {
      fireEvent.click(loadMoreButton);
    });

    expect(await screen.findByText("Cafe 21")).toBeInTheDocument();
  });

  test("should not collapse the list when a cafe is saved after loading more", async () => {
    const initialShops = Array.from({ length: 20 }, (_, i) =>
      createMockCoffeeShop(i)
    );
    const { rerender } = render(
      <DiscoverContent initialShops={initialShops} user={mockUser} cities={[]} />
    );

    const loadMoreButton = screen.getByText("load more");
    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(screen.getAllByText(/Cafe \d+/)).toHaveLength(40);
    });

    const refreshedInitialShops = Array.from({ length: 20 }, (_, i) => ({
      ...createMockCoffeeShop(i),
      isInitiallySaved: i === 0 ? true : false,
    }));

    rerender(
      <DiscoverContent initialShops={refreshedInitialShops} user={mockUser} cities={[]} />
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Cafe \d+/)).toHaveLength(40);
    });
  });

  test("should not collapse the list when a cafe visit is logged after loading more", async () => {
    const initialShops = Array.from({ length: 20 }, (_, i) =>
      createMockCoffeeShop(i)
    );
    const { rerender } = render(
      <DiscoverContent initialShops={initialShops} user={mockUser} cities={[]} />
    );

    const loadMoreButton = screen.getByText("load more");
    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(screen.getAllByText(/Cafe \d+/)).toHaveLength(40);
    });

    const refreshedInitialShops = Array.from({ length: 20 }, (_, i) => ({
      ...createMockCoffeeShop(i),
      isInitiallyVisited: i === 0 ? true : false,
    }));

    rerender(
      <DiscoverContent initialShops={refreshedInitialShops} user={mockUser} cities={[]} />
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Cafe \d+/)).toHaveLength(40);
    });
  });
});
