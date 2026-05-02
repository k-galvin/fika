import { render, screen, fireEvent } from "@testing-library/react";
import { Footer } from "../footer";
import "@testing-library/jest-dom";
import { User } from "@supabase/supabase-js";

// Mock the next/navigation router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/mock-path", // Mock usePathname
}));

// Mock the SuggestCafeForm component
jest.mock("../suggest-cafe-form", () => ({
  SuggestCafeForm: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="suggest-cafe-form">Suggest Form</div> : null,
}));

const mockUser = { id: "123" } as User;

describe("Footer", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("should render the Suggest a Cafe link", () => {
    render(<Footer user={null} />);
    expect(
      screen.getByRole("button", {
        name: /know a great spot\? suggest it for our list!/i,
      })
    ).toBeInTheDocument();
  });

  describe("when user is logged in", () => {
    it("should open the modal when suggest button is clicked", () => {
      render(<Footer user={mockUser} />);
      const suggestButton = screen.getByRole("button", {
        name: /know a great spot\? suggest it for our list!/i,
      });

      fireEvent.click(suggestButton);

      expect(mockPush).not.toHaveBeenCalled();
      expect(screen.getByTestId("suggest-cafe-form")).toBeInTheDocument();
    });
  });

  describe("when user is logged out", () => {
    it("should redirect to /login when suggest button is clicked", () => {
      render(<Footer user={null} />);
      const suggestButton = screen.getByRole("button", {
        name: /know a great spot\? suggest it for our list!/i,
      });

      fireEvent.click(suggestButton);

      expect(mockPush).toHaveBeenCalledWith("/auth/login?redirect=/mock-path");
      expect(screen.queryByTestId("suggest-cafe-form")).not.toBeInTheDocument();
    });
  });
});
