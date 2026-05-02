
import { render, screen } from "@testing-library/react";
import { CafeCardSkeleton } from "../cafe-card-skeleton";


describe("CafeCardSkeleton", () => {
  it("should render the skeleton card", () => {
    render(<CafeCardSkeleton />);

    const skeleton = screen.getByRole("figure"); 

    expect(skeleton).toBeInTheDocument();
  });
});
