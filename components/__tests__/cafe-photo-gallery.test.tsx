/* eslint-disable @typescript-eslint/no-explicit-any */
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      upload: jest.fn((path: any, file: any) => Promise.resolve({ data: {}, error: null })),
      getPublicUrl: jest.fn((path: string) => ({ data: { publicUrl: "http://mock.url/" + path } })),
    })),
  },
};
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => mockSupabase,
}));

// Mock server actions
const mockUploadShopPhoto = jest.fn();
const mockUploadShopPhotosBatch = jest.fn();
const mockSetPrimaryPhoto = jest.fn();
jest.mock("@/app/actions", () => ({
  uploadShopPhoto: (shopId: number, photoUrl: string, userId: string) =>
    mockUploadShopPhoto(shopId, photoUrl, userId),
  uploadShopPhotosBatch: (shopId: number, photoUrls: string[], userId: string) =>
    mockUploadShopPhotosBatch(shopId, photoUrls, userId),
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

// Mock URL methods for jsdom
if (typeof window !== "undefined") {
  window.URL.createObjectURL = jest.fn(() => "http://mock.url/preview");
  window.URL.revokeObjectURL = jest.fn();
}

const mockUser: User = {
  id: "user-123",
  email: "test@example.com",
  aud: "authenticated",
  role: "authenticated",
  app_metadata: {},
  user_metadata: {},
  created_at: "",
  updated_at: "",
} as any;

const mockAdminUser: User = {
  ...mockUser,
  id: "admin-123",
} as any;

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
      screen.getByText(/No approved photos yet/i)
    ).toBeInTheDocument();
  });

  it("renders photos in a grid when provided", () => {
    render(
      <CafePhotoGallery
        shopId={1}
        photos={mockPhotos}
        user={null}
        userRole={null}
      />
    );
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2); // Should show both in the grid
    expect(images[0]).toHaveAttribute("src", mockPhotos[0].photo_url);
    expect(images[1]).toHaveAttribute("src", mockPhotos[1].photo_url);
  });

  it("shows 'Add Photo' button only for logged-in users", () => {
    const { rerender } = render(
      <CafePhotoGallery shopId={1} photos={[]} user={null} userRole={null} />
    );
    expect(
      screen.queryByRole("button", { name: /Add Photos/i })
    ).not.toBeInTheDocument();

    rerender(
      <CafePhotoGallery shopId={1} photos={[]} user={mockUser} userRole={"user"} />
    );
    expect(
      screen.getByRole("button", { name: /Add Photos/i })
    ).toBeInTheDocument();
  });

  it("opens file dialog when 'Add Photos' is clicked", () => {
    render(
      <CafePhotoGallery shopId={1} photos={[]} user={mockUser} userRole={"user"} />
    );
    fireEvent.click(screen.getByRole("button", { name: /Add Photos/i }));
    expect(screen.getByTestId("file-input")).toBeInTheDocument();
  });

  it("handles file upload successfully", async () => {
    mockUploadShopPhotosBatch.mockResolvedValue({ success: true });

    render(
      <CafePhotoGallery shopId={1} photos={[]} user={mockUser} userRole={"user"} />
    );

    const addPhotosBtn = await screen.findByRole("button", { name: /Add Photos/i });
    fireEvent.click(addPhotosBtn);
    
    const fileInput = screen.getByTestId("file-input");

    const file = new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Review step: Click the upload button that now appears
    const uploadBtn = screen.getByRole("button", { name: /Upload 1 Photo/i });
    fireEvent.click(uploadBtn);

    await waitFor(() => {
      expect(mockSupabase.storage.from).toHaveBeenCalledWith("images");
      const storageInstance = (mockSupabase.storage.from as any).mock.results[0].value;
      expect(storageInstance.upload).toHaveBeenCalledWith(
        expect.stringContaining("1/"),
        file
      );
      expect(mockUploadShopPhotosBatch).toHaveBeenCalledWith(
        1,
        [expect.stringContaining("http://mock.url/1/")],
        mockUser.id
      );
      expect(mockToastSuccess).toHaveBeenCalledWith("Successfully uploaded 1 photo!");
    });
  });

  it("shows admin actions only for admins", () => {
    const { rerender } = render(
      <CafePhotoGallery
        shopId={1}
        photos={mockPhotos}
        user={mockUser}
        userRole={"user"}
      />
    );
    expect(screen.queryByRole("button", { name: /Set as Primary/i })).not.toBeInTheDocument();

    rerender(
      <CafePhotoGallery
        shopId={1}
        photos={mockPhotos}
        user={mockAdminUser}
        userRole={"admin"}
      />
    );
    expect(screen.getAllByRole("button", { name: /Set as Primary/i })).toHaveLength(2);
  });

  it("handles setting a photo as primary (Admin only)", async () => {
    mockSetPrimaryPhoto.mockResolvedValue({ success: true });

    render(
      <CafePhotoGallery
        shopId={1}
        photos={mockPhotos}
        user={mockAdminUser}
        userRole={"admin"}
      />
    );

    const setPrimaryButtons = screen.getAllByRole("button", {
      name: /Set as Primary/i,
    });
    fireEvent.click(setPrimaryButtons[0]);

    await waitFor(() => {
      expect(mockSetPrimaryPhoto).toHaveBeenCalledWith(mockPhotos[0].id, 1);
      expect(mockToastSuccess).toHaveBeenCalledWith("Primary photo updated!");
    });
  });
});
