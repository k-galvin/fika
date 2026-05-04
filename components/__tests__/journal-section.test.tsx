import { render, screen, fireEvent } from "@testing-library/react";
import { JournalSection } from "../journal-section";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock app actions
jest.mock("@/app/actions", () => ({
  addJournalEntry: jest.fn(),
  updateJournalEntry: jest.fn(),
  deleteJournalEntry: jest.fn(),
}));

const mockUser = {
  id: "user-1",
  email: "test@example.com",
} as User;

const mockEntries = [
  {
    id: "entry-1",
    profile_id: "user-1",
    coffee_shop_id: 1,
    content: "Great coffee today!",
    visit_date: "2024-05-01",
    created_at: "2024-05-01T12:00:00Z",
  },
];

describe("JournalSection", () => {
  const mockRefresh = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      refresh: mockRefresh,
    });
  });

  it("renders nothing if user is not logged in", () => {
    const { container } = render(
      <JournalSection cafeId={1} user={null} entries={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders empty state when there are no entries", () => {
    render(<JournalSection cafeId={1} user={mockUser} entries={[]} />);
    expect(screen.getByText(/No entries yet/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /New Entry/i })).toBeInTheDocument();
  });

  it("renders list of entries", () => {
    render(<JournalSection cafeId={1} user={mockUser} entries={mockEntries} />);
    expect(screen.getByText("Great coffee today!")).toBeInTheDocument();
    expect(screen.getByText(/May 1, 2024/i)).toBeInTheDocument();
  });

  it("opens modal when 'New Entry' is clicked", () => {
    render(<JournalSection cafeId={1} user={mockUser} entries={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /New Entry/i }));
    expect(screen.getByText("New Journal Entry")).toBeInTheDocument();
  });
});
