"use client";

import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBar } from "../search-bar";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));



describe("SearchBar", () => {
  it("should call router.replace with the search term", () => {
    const mockRouter = { replace: jest.fn() };
    const mockPathname = "/discover";
    const mockSearchParams = new URLSearchParams();

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue(mockPathname);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

    render(<SearchBar placeholder="Search..." />);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "test" } });

    expect(mockRouter.replace).toHaveBeenCalledWith("/discover?search=test");
  });
});
