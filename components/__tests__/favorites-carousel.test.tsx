import { render, screen } from "@testing-library/react";
import { FavoritesCarousel } from "../favorites-carousel";
import { CoffeeShop } from "@/lib/types";

jest.mock("@/app/theme-context", () => ({
  useTheme: () => ({ isAfterHours: false, setIsAfterHours: jest.fn() }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/",
}));

const makeShop = (id: number, name: string): CoffeeShop =>
  ({
    id,
    name,
    city: "Los Angeles",
    shop_photos: [
      { id, photo_url: `https://example.com/${id}.jpg`, is_primary: true, is_approved: true },
    ],
    isInitiallySaved: false,
    isInitiallyVisited: false,
    ratings: [],
  }) as unknown as CoffeeShop;

describe("FavoritesCarousel", () => {
  const shops = [makeShop(1, "Alpha"), makeShop(2, "Bravo"), makeShop(3, "Charlie")];

  it("renders a polaroid linking to each favorite cafe", () => {
    render(<FavoritesCarousel shops={shops} />);

    expect(screen.getByRole("link", { name: /Alpha/ })).toHaveAttribute("href", "/cafe/1");
    expect(screen.getByRole("link", { name: /Bravo/ })).toHaveAttribute("href", "/cafe/2");
    expect(screen.getByRole("link", { name: /Charlie/ })).toHaveAttribute("href", "/cafe/3");
  });

  it("renders a link to browse all cafes", () => {
    render(<FavoritesCarousel shops={shops} />);

    expect(screen.getByRole("link", { name: /browse all cafes/i })).toHaveAttribute("href", "/discover");
  });
});
