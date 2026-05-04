import { render, screen } from "@testing-library/react";
import JournalPage from "../page";
import { getAllUserJournalEntries } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Mock dependencies
jest.mock("@/app/actions", () => ({
  getAllUserJournalEntries: jest.fn(),
}));

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => {
    throw new Error("redirected");
  }),
}));

jest.mock("@/components/footer", () => ({
  Footer: () => <footer data-testid="footer" />,
}));

describe("JournalPage", () => {
  const mockUser = { id: "user-123", email: "test@example.com" };
  const mockEntries = [
    {
      id: "entry-1",
      coffee_shop_id: 1,
      content: "Lovely latte!",
      visit_date: "2024-05-04",
      coffee_shops: { name: "Cafe One", city: "London" },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should redirect to login if user is not authenticated", async () => {
    (createClient as jest.Mock).mockReturnValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
    });

    await expect(JournalPage()).rejects.toThrow("redirected");

    expect(redirect).toHaveBeenCalledWith("/auth/login?redirect=/journal");
  });

  it("should render empty state when no entries exist", async () => {
    (createClient as jest.Mock).mockReturnValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
    });
    (getAllUserJournalEntries as jest.Mock).mockResolvedValue([]);

    render(await JournalPage());

    expect(screen.getByText(/Your journal is waiting for its first entry/i)).toBeInTheDocument();
  });

  it("should render journal entries when they exist", async () => {
    (createClient as jest.Mock).mockReturnValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
    });
    (getAllUserJournalEntries as jest.Mock).mockResolvedValue(mockEntries);

    render(await JournalPage());

    expect(screen.getByText("Cafe One")).toBeInTheDocument();
    expect(screen.getByText(/Lovely latte!/i)).toBeInTheDocument();
    expect(screen.getByText("London")).toBeInTheDocument();
  });
});
