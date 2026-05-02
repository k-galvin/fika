import { render, screen } from "@testing-library/react";
import { ForgotPasswordForm } from "../forgot-password-form";

describe("ForgotPasswordForm", () => {
  it("renders form elements", () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send reset email" })
    ).toBeInTheDocument();
  });
});
