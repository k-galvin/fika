import { render, screen, fireEvent } from "@testing-library/react";
import { ProfileCafes } from "../profile-cafes";
import { UserSavedCafe, UserVisit } from "@/lib/types";

const MOCK_VISITED_CAFES: UserVisit[] = [
  {
    id: "visit1",
    coffee_shop_id: 1,
    profile_id: "user1",
    visited_at: "2023-01-01T12:00:00Z",
    coffee_shops: {
      id: 1,
      name: "Visited Cafe 1",
      shop_photos: [],
      busyness: "Medium",
      city: "Los Angeles",
      has_outlets: true,
      has_wifi: true,
      is_featured: false,
      is_laptop_friendly: true,
      parking: "Easy",
      pricing: "$$",
      seating: "Plenty",
      summary: "",
      vibe: "Cozy",
      wine_bar: false,
      isInitiallySaved: false,
      isInitiallyVisited: true,
      ratings: [],
    },
  },
  {
    id: "visit2",
    coffee_shop_id: 2,
    profile_id: "user1",
    visited_at: "2023-02-01T12:00:00Z",
    coffee_shops: {
      id: 2,
      name: "Visited Cafe 2",
      shop_photos: [],
      busyness: "Medium",
      city: "London",
      has_outlets: true,
      has_wifi: true,
      is_featured: false,
      is_laptop_friendly: true,
      parking: "Easy",
      pricing: "$$",
      seating: "Plenty",
      summary: "",
      vibe: "Cozy",
      wine_bar: false,
      isInitiallySaved: false,
      isInitiallyVisited: true,
      ratings: [],
    },
  },
];

const MOCK_SAVED_CAFES: UserSavedCafe[] = [
  {
    id: "saved1",
    coffee_shop_id: 3,
    profile_id: "user1",
    saved_at: "2023-03-01T12:00:00Z",
    coffee_shops: {
      id: 3,
      name: "Saved Cafe 1",
      shop_photos: [],
      busyness: "Medium",
      city: "Los Angeles",
      has_outlets: true,
      has_wifi: true,
      is_featured: false,
      is_laptop_friendly: true,
      parking: "Easy",
      pricing: "$$",
      seating: "Plenty",
      summary: "",
      vibe: "Cozy",
      wine_bar: false,
      isInitiallySaved: true,
      isInitiallyVisited: false,
      ratings: [],
    },
  },
  {
    id: "saved2",
    coffee_shop_id: 4,
    profile_id: "user1",
    saved_at: "2023-04-01T12:00:00Z",
    coffee_shops: {
      id: 4,
      name: "Saved Cafe 2",
      shop_photos: [],
      busyness: "Medium",
      city: "Copenhagen",
      has_outlets: true,
      has_wifi: true,
      is_featured: false,
      is_laptop_friendly: true,
      parking: "Easy",
      pricing: "$$",
      seating: "Plenty",
      summary: "",
      vibe: "Cozy",
      wine_bar: false,
      isInitiallySaved: true,
      isInitiallyVisited: false,
      ratings: [],
    },
  },
];

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/profile",
}));

// Mock SaveButton (since it's a child component)
jest.mock("@/components/save-button", () => ({
  SaveButton: ({
    shopId,
    isInitiallySaved,
  }: {
    shopId: number;
    isInitiallySaved: boolean;
  }) => (
    <button data-testid={`save-button-${shopId}`}>
      {isInitiallySaved ? "Saved" : "Unsaved"}
    </button>
  ),
}));

describe("ProfileCafes", () => {
  it("renders 'You haven't logged any visits yet!' when visitedCafes is empty", () => {
    render(<ProfileCafes savedCafes={[]} visitedCafes={[]} />);
    expect(
      screen.getByText("You haven't logged any visits yet!")
    ).toBeInTheDocument();
  });

  it("renders 'You haven't saved any cafes yet!' when savedCafes is empty and saved tab is active", () => {
    render(<ProfileCafes savedCafes={[]} visitedCafes={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /Saved Cafes/i }));
    expect(
      screen.getByText("You haven't saved any cafes yet!")
    ).toBeInTheDocument();
  });

  it("renders visited cafes when provided", () => {
    render(<ProfileCafes savedCafes={[]} visitedCafes={MOCK_VISITED_CAFES} />);
    expect(screen.getByText("Visited Cafe 1")).toBeInTheDocument();
    expect(screen.getByText("Visited Cafe 2")).toBeInTheDocument();
  });

  it("renders saved cafes when provided and saved tab is active", () => {
    render(<ProfileCafes savedCafes={MOCK_SAVED_CAFES} visitedCafes={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /Saved Cafes/i }));
    expect(screen.getByText("Saved Cafe 1")).toBeInTheDocument();
    expect(screen.getByText("Saved Cafe 2")).toBeInTheDocument();
    expect(screen.getByTestId("save-button-3")).toBeInTheDocument();
    expect(screen.getByTestId("save-button-4")).toBeInTheDocument();
  });

  it("switches between 'Visited Cafes' and 'Saved Cafes' tabs", () => {
    render(
      <ProfileCafes
        savedCafes={MOCK_SAVED_CAFES}
        visitedCafes={MOCK_VISITED_CAFES}
      />
    );

    // Initially on Visited Cafes tab
    expect(screen.getByText("Visited Cafe 1")).toBeInTheDocument();
    expect(screen.queryByText("Saved Cafe 1")).not.toBeInTheDocument();

    // Switch to Saved Cafes tab
    fireEvent.click(screen.getByRole("button", { name: /Saved Cafes/i }));
    expect(screen.queryByText("Visited Cafe 1")).not.toBeInTheDocument();
    expect(screen.getByText("Saved Cafe 1")).toBeInTheDocument();

    // Switch back to Visited Cafes tab
    fireEvent.click(screen.getByRole("button", { name: /Visited Cafes/i }));
    expect(screen.getByText("Visited Cafe 1")).toBeInTheDocument();
    expect(screen.queryByText("Saved Cafe 1")).not.toBeInTheDocument();
  });
});
