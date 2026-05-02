
import { render } from "@testing-library/react";
import { CafeCardSkeleton } from "../cafe-card-skeleton";


describe("CafeCardSkeleton", () => {
  it("should render the skeleton card", () => {
    const { container } = render(<CafeCardSkeleton />);
    expect(container.firstChild).toHaveClass("animate-pulse");
  });
});
