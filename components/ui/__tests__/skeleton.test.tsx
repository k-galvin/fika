
import { render, screen } from "@testing-library/react";

import { Skeleton } from "../skeleton";

describe("Skeleton", () => {
  it("should render with the correct class", () => {
    render(<Skeleton data-testid="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");

    expect(skeleton).toHaveClass("animate-pulse rounded-md bg-skeleton-brown");
  });
});
