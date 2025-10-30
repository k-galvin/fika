import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react";
import { SuggestCafeForm } from "../suggest-cafe-form";
import "@testing-library/jest-dom";
import * as actions from "@/app/actions";

// Mock the server action
jest.mock("@/app/actions", () => ({
  suggestCafe: jest.fn(),
}));

// Mock the useFormStatus hook
jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  useFormStatus: () => ({ pending: false }),
}));

describe("SuggestCafeForm", () => {
  const mockSetOpen = jest.fn();
  const suggestCafeMock = actions.suggestCafe as jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    suggestCafeMock.mockClear();
  });

  it("renders all form fields", () => {
    render(<SuggestCafeForm isOpen={true} onOpenChange={mockSetOpen} />);

    expect(screen.getByLabelText(/cafe name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/seating/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/parking/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/vibe/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pricing/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/busyness/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/laptop friendly/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/wifi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/outlets/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/wine bar/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("shows a success message on successful submission", async () => {
    // Setup mock to return success message
    suggestCafeMock.mockResolvedValue({ message: "Success!" });

    render(<SuggestCafeForm isOpen={true} onOpenChange={mockSetOpen} />);

    const form = screen.getByTestId("suggest-form");
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(await screen.findByText("Success!")).toBeInTheDocument();
  });

  it("shows an error message on failed submission", async () => {
    // Setup mock to return error message
    suggestCafeMock.mockResolvedValue({ message: "Error!" });

    render(<SuggestCafeForm isOpen={true} onOpenChange={mockSetOpen} />);

    const form = screen.getByTestId("suggest-form");
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(await screen.findByText("Error!")).toBeInTheDocument();
  });
});
