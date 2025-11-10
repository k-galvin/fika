import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UpdatesPage from "../page";
import {
  getCafeUpdates,
  approveUpdateAndDenyOthers,
  denyUpdates,
} from "@/app/actions";

// Mock the actions module
jest.mock("@/app/actions", () => ({
  getCafeUpdates: jest.fn(),
  approveUpdateAndDenyOthers: jest.fn(),
  denyUpdates: jest.fn(),
}));

const mockUpdates = [
  // Companion, parking
  {
    id: 1,
    cafe_name: "Companion",
    field: "parking",
    new_value: "hard",
    cafe_id: 101,
    user_id: "user1",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    cafe_name: "Companion",
    field: "parking",
    new_value: "hard",
    cafe_id: 101,
    user_id: "user2",
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    cafe_name: "Companion",
    field: "parking",
    new_value: "medium",
    cafe_id: 101,
    user_id: "user3",
    created_at: new Date().toISOString(),
  },
  // Canyon Coffee, seating
  {
    id: 4,
    cafe_name: "Canyon Coffee",
    field: "seating",
    new_value: "limited",
    cafe_id: 102,
    user_id: "user4",
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    cafe_name: "Canyon Coffee",
    field: "seating",
    new_value: "plenty",
    cafe_id: 102,
    user_id: "user5",
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    cafe_name: "Canyon Coffee",
    field: "seating",
    new_value: "limited",
    cafe_id: 102,
    user_id: "user6",
    created_at: new Date().toISOString(),
  },
];

describe("UpdatesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially", () => {
    (getCafeUpdates as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<UpdatesPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("groups and displays cafe updates correctly", async () => {
    (getCafeUpdates as jest.Mock).mockResolvedValue(mockUpdates);
    render(<UpdatesPage />);

    await waitFor(() => {
      // Companion group
      const companionGroup = screen.getByTestId("group-Companion-parking");
      within(companionGroup).getByText("Companion");
      expect(within(companionGroup).getByTestId("field")).toHaveTextContent(
        "Field: parking"
      );
      expect(within(companionGroup).getByText(/hard/i)).toBeInTheDocument();
      expect(
        within(companionGroup).getByText(/Suggested by 2 users/i)
      ).toBeInTheDocument();
      expect(within(companionGroup).getByText(/medium/i)).toBeInTheDocument();
      expect(
        within(companionGroup).getByText(/Suggested by 1 user/i)
      ).toBeInTheDocument();
      expect(
        within(companionGroup).getByText(/Total suggestions: 3/i)
      ).toBeInTheDocument();

      // Canyon Coffee group
      const canyonCoffeeGroup = screen.getByTestId(
        "group-Canyon Coffee-seating"
      );
      within(canyonCoffeeGroup).getByText("Canyon Coffee");
      expect(within(canyonCoffeeGroup).getByTestId("field")).toHaveTextContent(
        "Field: seating"
      );
      expect(
        within(canyonCoffeeGroup).getByText(/limited/i)
      ).toBeInTheDocument();
      expect(
        within(canyonCoffeeGroup).getByText(/Suggested by 2 users/i)
      ).toBeInTheDocument();
      expect(
        within(canyonCoffeeGroup).getByText(/plenty/i)
      ).toBeInTheDocument();
      expect(
        within(canyonCoffeeGroup).getByText(/Suggested by 1 user/i)
      ).toBeInTheDocument();
      expect(
        within(canyonCoffeeGroup).getByText(/Total suggestions: 3/i)
      ).toBeInTheDocument();
    });
  });

  it("calls approveUpdateAndDenyOthers with correct IDs on approve", async () => {
    const user = userEvent.setup();
    (getCafeUpdates as jest.Mock).mockResolvedValue(mockUpdates);
    render(<UpdatesPage />);

    await waitFor(async () => {
      const approveButtons = screen.getAllByRole("button", {
        name: /approve most voted/i,
      });
      await user.click(approveButtons[0]); // Companion is first
    });

    expect(approveUpdateAndDenyOthers).toHaveBeenCalledWith(1, [2, 3]);
  });

  it("calls denyUpdates with all group IDs on deny", async () => {
    const user = userEvent.setup();
    (getCafeUpdates as jest.Mock).mockResolvedValue(mockUpdates);
    render(<UpdatesPage />);

    await waitFor(async () => {
      const denyButtons = screen.getAllByRole("button", { name: /deny all/i });
      await user.click(denyButtons[1]); // Canyon Coffee is second
    });

    expect(denyUpdates).toHaveBeenCalledWith([4, 5, 6]);
  });
});
