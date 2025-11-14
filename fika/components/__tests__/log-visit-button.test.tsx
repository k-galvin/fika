import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { LogVisitButton } from "../log-visit-button";
import * as actions from "@/app/actions";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/",
}));

// Mock the server actions
jest.mock("@/app/actions", () => ({
  ...jest.requireActual("@/app/actions"),
  rateCafe: jest.fn(),
  getUserRatingForCafe: jest.fn(),
}));

const mockedActions = actions as jest.Mocked<typeof actions>;

describe("LogVisitButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedActions.rateCafe.mockResolvedValue({ success: true });
    mockedActions.getUserRatingForCafe.mockResolvedValue(null);
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

  it("renders with check icon if rated", async () => {
    mockedActions.getUserRatingForCafe.mockResolvedValue(4);
    render(<LogVisitButton shopId={1} isInitiallyVisited={false} initialRating={4} />);
    await waitFor(() => {
      expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    });
  });

  it("opens rating dialog on button click", async () => {
    render(<LogVisitButton shopId={1} isInitiallyVisited={false} initialRating={null} />);
    const button = await screen.findByTestId("plus-icon");
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText("Rate your experience")).toBeInTheDocument();
      expect(screen.getByText("Save")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getAllByTestId(/star-icon/)).toHaveLength(5);
    });
  });

  it("calls rateCafe with correct rating on save", async () => {
    render(<LogVisitButton shopId={1} isInitiallyVisited={false} initialRating={null} />);
    const button = await screen.findByTestId("plus-icon");
    fireEvent.click(button);

    const stars = await screen.findAllByTestId(/star-icon/);
    fireEvent.click(stars[3]); // Click the 4th star

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockedActions.rateCafe).toHaveBeenCalledWith(1, 4);
    });
  });

  it("closes rating dialog on cancel", async () => {
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
      expect(screen.getByTestId("plus-icon")).toBeInTheDocument();
    });
  });

  it("redirects to login when rateCafe fails with 'User not found'", async () => {
    mockedActions.rateCafe.mockResolvedValueOnce({
      success: false,
      message: "User not found",
    });
    render(<LogVisitButton shopId={1} isInitiallyVisited={false} initialRating={null} />);
    const button = await screen.findByTestId("plus-icon");
    fireEvent.click(button);

    const stars = await screen.findAllByTestId(/star-icon/);
    fireEvent.click(stars[0]); // Rate 1 star

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/login?redirect=/");
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
});
