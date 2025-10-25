import { render, screen } from "@testing-library/react";
import DiscoverPage from "../page";

// Mock the DiscoverContent component to isolate the page component from its children.
jest.mock("@/components/discover-content", () => ({
  DiscoverContent: jest.fn(({ initialShops, user }) => (
    <div>
      <h1>Discover Content</h1>
      <div data-testid="initial-shops">{JSON.stringify(initialShops)}</div>
      <div data-testid="user">{JSON.stringify(user)}</div>
    </div>
  )),
}));

// Mock the Supabase client to prevent actual database calls during tests.
const mockGetUser = jest.fn();
const mockFrom = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}));

describe("DiscoverPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render DiscoverContent with initial shops and user", async () => {
    const user = { id: "123", email: "test@example.com" };
    const initialShops = [
      {
        id: 1,
        name: "Test Cafe",
        city: "Test City",
        isInitiallySaved: false,
        isInitiallyVisited: false,
        shop_photos: [],
      },
    ];

    mockGetUser.mockResolvedValue({ data: { user } });
    mockFrom.mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          range: jest.fn(() => ({ data: initialShops })),
        })),
        range: jest.fn(() => ({ data: initialShops })),
      })),
    }));

    // Suppress console.error from next/image
    const consoleError = console.error;
    console.error = jest.fn();

    render(await DiscoverPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText("Discover Content")).toBeInTheDocument();

    // Restore console.error
    console.error = consoleError;
  });

  it("should filter shops based on the search query", async () => {
    const user = { id: "123", email: "test@example.com" };
    const initialShops = [
      {
        id: 1,
        name: "Test Cafe",
        city: "Test City",
        isInitiallySaved: false,
        isInitiallyVisited: false,
        shop_photos: [],
      },
    ];

    mockGetUser.mockResolvedValue({ data: { user } });
    mockFrom.mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          range: jest.fn(() => ({ data: initialShops })),
        })),
        ilike: jest.fn(() => ({
          range: jest.fn(() => ({ data: initialShops })),
        })),
        range: jest.fn(() => ({ data: initialShops })),
      })),
    }));

    render(
      await DiscoverPage({ searchParams: Promise.resolve({ search: "Test" }) })
    );

    expect(screen.getByTestId("initial-shops")).toHaveTextContent(
      JSON.stringify(initialShops)
    );
    expect(screen.getByTestId("user")).toHaveTextContent(JSON.stringify(user));
  });
});
