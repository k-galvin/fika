import { render, screen, fireEvent } from "@testing-library/react";
import { SafeImage } from "../safe-image";

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ""} />;
  },
}));

describe("SafeImage", () => {
  it("renders with the provided src and alt", () => {
    render(<SafeImage src="/test-photo.jpg" alt="Test Cafe" width={200} height={200} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/test-photo.jpg");
    expect(img).toHaveAttribute("alt", "Test Cafe");
  });

  it("automatically converts signed Supabase URLs to public URLs", () => {
    const signedUrl =
      "https://xpptwypcquohsegdzzwo.supabase.co/storage/v1/object/sign/images/blackbird.jpeg?token=abc123token";
    const expectedPublicUrl =
      "https://xpptwypcquohsegdzzwo.supabase.co/storage/v1/object/public/images/blackbird.jpeg";

    render(<SafeImage src={signedUrl} alt="Blackbird" width={200} height={200} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", expectedPublicUrl);
  });

  it("falls back to /hotLatte.png when image error occurs", () => {
    render(<SafeImage src="https://example.com/broken.jpg" alt="Broken Cafe" width={200} height={200} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/broken.jpg");

    // Trigger error event
    fireEvent.error(img);

    expect(img).toHaveAttribute("src", "/hotLatte.png");
  });

  it("falls back to custom fallbackSrc when provided", () => {
    render(
      <SafeImage
        src="https://example.com/broken.jpg"
        fallbackSrc="/custom-fallback.png"
        alt="Broken Cafe"
        width={200}
        height={200}
      />
    );
    const img = screen.getByRole("img");

    fireEvent.error(img);

    expect(img).toHaveAttribute("src", "/custom-fallback.png");
  });

  it("invokes external onError handler if supplied", () => {
    const onErrorMock = jest.fn();
    render(
      <SafeImage
        src="https://example.com/broken.jpg"
        alt="Broken Cafe"
        onError={onErrorMock}
        width={200}
        height={200}
      />
    );
    const img = screen.getByRole("img");

    fireEvent.error(img);

    expect(onErrorMock).toHaveBeenCalledTimes(1);
    expect(img).toHaveAttribute("src", "/hotLatte.png");
  });
});
