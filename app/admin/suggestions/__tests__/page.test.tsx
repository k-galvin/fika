import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SuggestionsPage from "../page";
import "@testing-library/jest-dom";
import * as actions from "@/app/actions";
import { SuggestedCafe } from "@/lib/types";

// Mock the server actions
jest.mock("@/app/actions", () => ({
  getSuggestedCafes: jest.fn(),
  approveSuggestion: jest.fn(),
  denySuggestion: jest.fn(),
}));

const mockSuggestions: SuggestedCafe[] = [
  {
    id: 1,
    name: "Test Cafe 1",
    address: "123 Test St",
    description: "A great test cafe",
    city: "Los Angeles",
    seating: "Plenty",
    parking: "Easy",
    vibe: "Cozy",
    pricing: "$$",
    busyness: "Quiet",
    is_laptop_friendly: true,
    has_wifi: true,
    has_outlets: true,
    wine_bar: false,
    submitted_by: "user-1",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Test Cafe 2",
    address: "456 Test Ave",
    description: "Another test cafe",
    city: "Copenhagen",
    seating: "Some",
    parking: "Hard",
    vibe: "Corporate",
    pricing: "$$$",
    busyness: "Very",
    is_laptop_friendly: false,
    has_wifi: true,
    has_outlets: false,
    wine_bar: true,
    submitted_by: "user-2",
    created_at: new Date().toISOString(),
  },
];

describe("SuggestionsPage", () => {
  beforeEach(() => {
    // Reset mocks before each test
    (actions.getSuggestedCafes as jest.Mock).mockResolvedValue(mockSuggestions);
    (actions.approveSuggestion as jest.Mock).mockResolvedValue({
      success: true,
    });
    (actions.denySuggestion as jest.Mock).mockResolvedValue({ success: true });
  });

  it("fetches and displays suggested cafes", async () => {
    render(<SuggestionsPage />);

    // Wait for the suggestions to be loaded and displayed
    await waitFor(() => {
      expect(screen.getByText("Test Cafe 1")).toBeInTheDocument();
      expect(screen.getByText("Test Cafe 2")).toBeInTheDocument();
    });

    // Check if details are rendered
    expect(screen.getByText("A great test cafe")).toBeInTheDocument();
    expect(screen.getByTestId("parking-1")).toHaveTextContent("Easy");
    expect(screen.getByTestId("vibe-2")).toHaveTextContent("Corporate");
  });

  it("calls approveSuggestion when the approve button is clicked", async () => {
    render(<SuggestionsPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Cafe 1")).toBeInTheDocument();
    });

    const approveButtons = screen.getAllByRole("button", { name: /approve/i });
    fireEvent.click(approveButtons[0]); // Click the first approve button

    await waitFor(() => {
      expect(actions.approveSuggestion).toHaveBeenCalledWith(
        mockSuggestions[0].id
      );
    });
  });

  it("calls denySuggestion when the deny button is clicked", async () => {
    render(<SuggestionsPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Cafe 2")).toBeInTheDocument();
    });

    const denyButtons = screen.getAllByRole("button", { name: /deny/i });
    fireEvent.click(denyButtons[1]); // Click the second deny button

    await waitFor(() => {
      expect(actions.denySuggestion).toHaveBeenCalledWith(
        mockSuggestions[1].id
      );
    });
  });
});
