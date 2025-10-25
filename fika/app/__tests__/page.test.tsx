
import { render, screen } from "@testing-library/react";
import Home from "../page";

// Mock the FeaturedCafes component to prevent it from making actual database calls.
jest.mock("../featured-cafes", () => ({
  FeaturedCafes: () => <div>Featured Cafes</div>,
}));

describe("Home page", () => {
  it("should render the welcome message and featured cafes", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /welcome to fika/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Featured Cafes")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
