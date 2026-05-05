import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { LogVisitButton } from "../log-visit-button";
import * as actions from "@/app/actions";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: jest.fn() }), // Added refresh mock
  usePathname: () => "/",
}));

// Mock the server actions
jest.mock("@/app/actions", () => ({
  ...jest.requireActual("@/app/actions"),
  rateCafe: jest.fn(),
  getUserRatingForCafe: jest.fn(),
  logVisit: jest.fn(), // Added mock
  checkUserLoggedIn: jest.fn(), // Added mock
}));

const mockedActions = actions as jest.Mocked<typeof actions>;

describe("LogVisitButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedActions.rateCafe.mockResolvedValue({ success: true });
    mockedActions.getUserRatingForCafe.mockResolvedValue(null);
    // Set default successful mocks for new actions
    mockedActions.logVisit.mockResolvedValue({ success: true });
    mockedActions.checkUserLoggedIn.mockResolvedValue({ success: true });
  });

  it("renders with plus icon if not visited and no rating", async () => {
    render(<LogVisitButton shopId={1} isInitiallyVisited={false} initialRating={null} />);
    await waitFor(() => {
      expect(screen.getByTestId("plus-icon")).toBeInTheDocument();
    });
  });

  it("renders with check icon if visited", async () => {
    render(<LogVisitButton shopId={1} isInitiallyVisited={true} initialRating={null} />);
    await waitFor(() => {
      expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    });
  });

  it("renders with plus icon if rated but not visited", async () => {
    render(<LogVisitButton shopId={1} isInitiallyVisited={false} initialRating={4} />);
    await waitFor(() => {
      expect(screen.getByTestId("plus-icon")).toBeInTheDocument();
    });
  });

  it("opens rating dialog and logs visit on button click", async () => {
    render(<LogVisitButton shopId={1} isInitiallyVisited={false} initialRating={null} />);
    const button = await screen.findByTestId("plus-icon");
    fireEvent.click(button);
    await waitFor(() => {
      expect(mockedActions.logVisit).toHaveBeenCalledWith(1);
      expect(screen.getByText("Rate your experience")).toBeInTheDocument();
      expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    });
  });

  it("calls rateCafe with correct rating on save", async () => {
    render(<LogVisitButton shopId={1} isInitiallyVisited={false} initialRating={null} />);
    const button = await screen.findByTestId("plus-icon");
    fireEvent.click(button);

    await waitFor(() => expect(screen.getByText("Rate your experience")).toBeInTheDocument());

    const stars = screen.getAllByTestId(/star-icon/);
    fireEvent.click(stars[3]); // Click the 4th star

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockedActions.rateCafe).toHaveBeenCalledWith(1, 4);
    });
  });

  it("closes rating dialog on cancel but keeps visit logged", async () => {
    render(<LogVisitButton shopId={1} isInitiallyVisited={false} initialRating={null} />);
    const button = await screen.findByTestId("plus-icon");
    act(() => {
      fireEvent.click(button);
    });

    const cancelButton = await screen.findByText("Cancel");
    act(() => {
      fireEvent.click(cancelButton);
    });


    await waitFor(() => {
      expect(screen.queryByText("Rate your experience")).not.toBeInTheDocument();
      expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    });
  });

  it("shows checkmark after successfully saving a rating", async () => {
    render(<LogVisitButton shopId={1} isInitiallyVisited={false} initialRating={null} />);
    const button = await screen.findByTestId("plus-icon");
    fireEvent.click(button);

    const stars = await screen.findAllByTestId(/star-icon/);
    fireEvent.click(stars[4]); // 5 stars

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockedActions.rateCafe).toHaveBeenCalledWith(1, 5);
      expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    });
  });

  it("redirects to login if user is not logged in when clicking button", async () => {
    mockedActions.checkUserLoggedIn.mockResolvedValueOnce({
      success: false,
      message: "User not found",
    });
    render(<LogVisitButton shopId={1} isInitiallyVisited={false} initialRating={null} />);
    const button = await screen.findByTestId("plus-icon");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/login?redirect=/");
      expect(screen.queryByText("Rate your experience")).not.toBeInTheDocument(); // Dialog should not open
    });
  });
});
