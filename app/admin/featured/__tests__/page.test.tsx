import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import FeaturedAdminPage from "../page";
import { searchCafes, toggleFeaturedCafe, getFeaturedCafes } from "@/app/actions";

// Mock actions
jest.mock("@/app/actions", () => ({
  searchCafes: jest.fn(),
  toggleFeaturedCafe: jest.fn(),
  getFeaturedCafes: jest.fn(),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("FeaturedAdminPage", () => {
  const mockFeatured = [
    { id: 1, name: "Cafe A", city: "LA", is_featured: true },
    { id: 2, name: "Cafe B", city: "NY", is_featured: true },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getFeaturedCafes as jest.Mock).mockResolvedValue(mockFeatured);
  });

  it("renders currently featured cafes", async () => {
    await act(async () => {
      render(<FeaturedAdminPage />);
    });
    
    await waitFor(() => {
      expect(screen.getByText("Cafe A")).toBeInTheDocument();
      expect(screen.getByText("Cafe B")).toBeInTheDocument();
      expect(screen.getByText(/Currently Featured \(2\/3\)/i)).toBeInTheDocument();
    });
  });

  it("handles searching for cafes", async () => {
    const mockResults = [{ id: 3, name: "Cafe C", city: "SF" }];
    (searchCafes as jest.Mock).mockResolvedValue(mockResults);

    await act(async () => {
      render(<FeaturedAdminPage />);
    });

    const input = screen.getByPlaceholderText(/Search by cafe name/i);
    fireEvent.change(input, { target: { value: "Cafe C" } });
    
    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /Search/i }));
    });

    await waitFor(() => {
      expect(searchCafes).toHaveBeenCalledWith("Cafe C");
      expect(screen.getByText("Cafe C")).toBeInTheDocument();
    });
  });

  it("handles toggling featured status", async () => {
    (toggleFeaturedCafe as jest.Mock).mockResolvedValue({ success: true });
    
    await act(async () => {
      render(<FeaturedAdminPage />);
    });
    
    await waitFor(() => screen.getByText("Cafe A"));
    
    const removeButtons = screen.getAllByRole("button").filter(b => b.querySelector('svg.lucide-x'));
    
    await act(async () => {
      fireEvent.click(removeButtons[0]);
    });

    expect(toggleFeaturedCafe).toHaveBeenCalledWith(1, false);
  });
});
