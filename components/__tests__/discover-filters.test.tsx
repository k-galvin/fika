import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DiscoverFilters } from "../discover-filters";

// Create a mock router
const mockRouter = {
  push: jest.fn(),
};

// Mock the next/navigation module
jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("DiscoverFilters", () => {
  it("renders filter dropdowns", () => {
    render(
      <DiscoverFilters
        cities={["Los Angeles", "New York"]}
        parkings={["Easy", "Medium", "Hard"]}
        seatings={["Plenty", "Some", "None"]}
        vibes={["Cozy", "Modern", "Industrial"]}
      />
    );

    expect(screen.getByText("City")).toBeInTheDocument();
    expect(screen.getByText("Parking")).toBeInTheDocument();
    expect(screen.getByText("Seating")).toBeInTheDocument();
    expect(screen.getByText("Vibe")).toBeInTheDocument();
    expect(screen.getByText("Wifi")).toBeInTheDocument();
    expect(screen.getByText("Outlets")).toBeInTheDocument();
  });

  it("updates the URL when a filter is selected", async () => {
    const user = userEvent.setup();
    render(
      <DiscoverFilters
        cities={["Los Angeles", "New York"]}
        parkings={["Easy", "Medium", "Hard"]}
        seatings={["Plenty", "Some", "None"]}
        vibes={["Cozy", "Modern", "Industrial"]}
      />
    );

    const cityTrigger = screen.getByText("City");
    await user.click(cityTrigger);

    const laOption = await screen.findByText("Los Angeles");
    await user.click(laOption);

    expect(mockRouter.push).toHaveBeenCalledWith("/?city=Los+Angeles");
  });

  it("renders 'Clear Filters' button and clears filters on click", async () => {
    const user = userEvent.setup();
    render(
      <DiscoverFilters
        cities={["Los Angeles", "New York"]}
        parkings={["Easy", "Medium", "Hard"]}
        seatings={["Plenty", "Some", "None"]}
        vibes={["Cozy", "Modern", "Industrial"]}
      />
    );

    const clearFiltersButton = screen.getByText("Clear Filters");
    expect(clearFiltersButton).toBeInTheDocument();

    await user.click(clearFiltersButton);

    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });
});
