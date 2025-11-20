import { render, screen } from "@testing-library/react";
import { SuggestCafeForm } from "../suggest-cafe-form";
import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("SuggestCafeForm", () => {
  it("renders all form fields", () => {
    render(<SuggestCafeForm isOpen={true} onOpenChange={() => {}} withDialog={false} />);

    expect(screen.getByLabelText(/cafe name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /select a city/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /select seating/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /select parking/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /select vibe/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /select pricing/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /select busyness/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/laptop friendly/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/wifi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/outlets/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/wine bar/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });
});

