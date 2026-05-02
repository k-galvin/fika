import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CafePhotoGallery } from "../cafe-photo-gallery";
import { User } from "@supabase/supabase-js";

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ""} />;
  },
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

// Mock Supabase client
const mockSupabase = {
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      getPublicUrl: jest.fn(),
    })),
  },
};
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => mockSupabase,
}));

// Mock server actions
const mockUploadShopPhoto = jest.fn();
const mockSetPrimaryPhoto = jest.fn();
jest.mock("@/app/actions", () => ({
  uploadShopPhoto: (shopId: number, photoUrl: string, userId: string) =>
    mockUploadShopPhoto(shopId, photoUrl, userId),
  setPrimaryPhoto: (photoId: number, cafeId: number) =>
    mockSetPrimaryPhoto(photoId, cafeId),
}));

// Mock sonner toast
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
jest.mock("sonner", () => ({
  toast: {
    success: (message: string) => mockToastSuccess(message),
    error: (message: string) => mockToastError(message),
  },
}));

const mockUser: User = {
  id: "user-123",
  email: "test@example.com",
  aud: "authenticated",
  role: "authenticated",
  app_metadata: {},
  user_metadata: {},
  created_at: "",
  updated_at: "",
};

const mockAdminUser: User = {
  ...mockUser,
  id: "admin-123",
};

const mockPhotos = [
  {
    id: 1,
    shop_id: 1,
    photo_url: "http://example.com/photo1.jpg",
    user_id: "user-123",
    is_primary: true,
    is_approved: true,
    uploaded_at: "",
  },
  {
    id: 2,
    shop_id: 1,
    photo_url: "http://example.com/photo2.jpg",
    user_id: "user-123",
    is_primary: false,
    is_approved: true,
    uploaded_at: "",
  },
];

describe("CafePhotoGallery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders 'No photos yet' message when no approved photos are provided", () => {
    render(
      <CafePhotoGallery shopId={1} photos={[]} user={null} userRole={null} />
    );
    expect(
      screen.getByText("No photos yet. Be the first to upload one!")
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Add Photo/i })).not.toBeInTheDocument();
  });

  it("renders 'Add Photo' button when user is logged in and no photos exist", () => {
    render(
      <CafePhotoGallery shopId={1} photos={[]} user={mockUser} userRole={"user"} />
    );
    expect(screen.getByRole("button", { name: /Add Photo/i })).toBeInTheDocument();
  });

  it("renders approved photos and primary badge", () => {
    render(
      <CafePhotoGallery
        shopId={1}
        photos={mockPhotos}
        user={mockUser}
        userRole={"user"}
      />
    );
    expect(screen.getByAltText(/Photo of 1/i)).toHaveAttribute(
      "src",
      mockPhotos[0].photo_url
    );
    expect(screen.getByText("Primary")).toBeInTheDocument();
  });

  it("allows navigation through photos when multiple approved photos exist", () => {
    render(
      <CafePhotoGallery
        shopId={1}
        photos={mockPhotos}
        user={mockUser}
        userRole={"user"}
      />
    );

    const nextButton = screen.getByTestId("next-button");
    fireEvent.click(nextButton);
    expect(screen.getByAltText(/Photo of 1/i)).toHaveAttribute(
      "src",
      mockPhotos[1].photo_url
    );

    const prevButton = screen.getByTestId("prev-button");
    fireEvent.click(prevButton);
    expect(screen.getByAltText(/Photo of 1/i)).toHaveAttribute(
      "src",
      mockPhotos[0].photo_url
    );
  });

  it("shows 'Set as Primary' button for admin users", () => {
    render(
      <CafePhotoGallery
        shopId={1}
        photos={mockPhotos}
        user={mockAdminUser}
        userRole={"admin"}
      />
    );
    expect(screen.getByRole("button", { name: /Set as Primary/i })).toBeInTheDocument();
  });

  it("does not show 'Set as Primary' button for non-admin users", () => {
    render(
      <CafePhotoGallery
        shopId={1}
        photos={mockPhotos}
        user={mockUser}
        userRole={"user"}
      />
    );
    expect(screen.queryByRole("button", { name: /Set as Primary/i })).not.toBeInTheDocument();
  });

  it("handles photo upload success", async () => {
    mockSupabase.storage.from.mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: { path: "some/path.jpg" }, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: "http://mock.url/some/path.jpg" } }),
    });
    mockUploadShopPhoto.mockResolvedValue({ success: true });

    render(
      <CafePhotoGallery shopId={1} photos={[]} user={mockUser} userRole={"user"} />
    );

    fireEvent.click(screen.getByRole("button", { name: /Add Photo/i }));
    const fileInput = screen.getByTestId("file-input");

    const file = new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockSupabase.storage.from("images").upload).toHaveBeenCalledWith(
        expect.stringContaining("1/"),
        file
      );
      expect(mockUploadShopPhoto).toHaveBeenCalledWith(
        1,
        "http://mock.url/some/path.jpg",
        mockUser.id
      );
      expect(mockToastSuccess).toHaveBeenCalledWith("Photo uploaded successfully!");
    });
  });

  it("handles photo upload failure during storage upload", async () => {
    mockSupabase.storage.from.mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: null, error: { message: "Upload failed" } }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: "http://mock.url/some/path.jpg" } }),
    });

    render(
      <CafePhotoGallery shopId={1} photos={[]} user={mockUser} userRole={"user"} />
    );

    fireEvent.click(screen.getByRole("button", { name: /Add Photo/i }));
    const fileInput = screen.getByTestId("file-input");

    const file = new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Failed to upload photo.");
      expect(mockUploadShopPhoto).not.toHaveBeenCalled();
    });
  });

  it("handles photo upload failure during database insertion", async () => {
    mockSupabase.storage.from.mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: { path: "some/path.jpg" }, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: "http://mock.url/some/path.jpg" } }),
    });
    mockUploadShopPhoto.mockResolvedValue({ success: false, message: "DB insert failed" });

    render(
      <CafePhotoGallery shopId={1} photos={[]} user={mockUser} userRole={"user"} />
    );

    fireEvent.click(screen.getByRole("button", { name: /Add Photo/i }));
    const fileInput = screen.getByTestId("file-input");

    const file = new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockUploadShopPhoto).toHaveBeenCalled();
      expect(mockToastError).toHaveBeenCalledWith("DB insert failed");
    });
  });

  it("handles setting primary photo success for admin", async () => {
    mockSetPrimaryPhoto.mockResolvedValue({ success: true });

    render(
      <CafePhotoGallery
        shopId={1}
        photos={mockPhotos}
        user={mockAdminUser}
        userRole={"admin"}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Set as Primary/i }));

    await waitFor(() => {
      expect(mockSetPrimaryPhoto).toHaveBeenCalledWith(mockPhotos[0].id, 1);
      expect(mockToastSuccess).toHaveBeenCalledWith("Primary photo updated!");
    });
  });

  it("handles setting primary photo failure for admin", async () => {
    mockSetPrimaryPhoto.mockResolvedValue({ success: false, message: "Failed to set primary" });

    render(
      <CafePhotoGallery
        shopId={1}
        photos={mockPhotos}
        user={mockAdminUser}
        userRole={"admin"}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Set as Primary/i }));

    await waitFor(() => {
      expect(mockSetPrimaryPhoto).toHaveBeenCalledWith(mockPhotos[0].id, 1);
      expect(mockToastError).toHaveBeenCalledWith("Failed to set primary");
    });
  });
});
