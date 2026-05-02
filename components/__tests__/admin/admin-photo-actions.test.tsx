import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminPhotoActions } from "../../admin/admin-photo-actions";

// Mock server actions
const mockApprovePhoto = jest.fn();
const mockDenyPhoto = jest.fn();
jest.mock("@/app/actions", () => ({
  approvePhoto: (photoId: number) => mockApprovePhoto(photoId),
  denyPhoto: (photoId: number, photoUrl: string) =>
    mockDenyPhoto(photoId, photoUrl),
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

describe("AdminPhotoActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Approve and Deny buttons", () => {
    render(<AdminPhotoActions photoId={1} photoUrl="http://example.com/photo.jpg" />);
    expect(screen.getByRole("button", { name: /Approve/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Deny/i })).toBeInTheDocument();
  });

  it("handles approve photo success", async () => {
    mockApprovePhoto.mockResolvedValue({ success: true });

    render(<AdminPhotoActions photoId={1} photoUrl="http://example.com/photo.jpg" />);
    fireEvent.click(screen.getByRole("button", { name: /Approve/i }));

    await waitFor(() => {
      expect(mockApprovePhoto).toHaveBeenCalledWith(1);
      expect(mockToastSuccess).toHaveBeenCalledWith("Photo approved successfully!");
    });
  });

  it("handles approve photo failure", async () => {
    mockApprovePhoto.mockResolvedValue({ success: false, message: "Approval failed" });

    render(<AdminPhotoActions photoId={1} photoUrl="http://example.com/photo.jpg" />);
    fireEvent.click(screen.getByRole("button", { name: /Approve/i }));

    await waitFor(() => {
      expect(mockApprovePhoto).toHaveBeenCalledWith(1);
      expect(mockToastError).toHaveBeenCalledWith("Approval failed");
    });
  });

  it("handles deny photo success", async () => {
    mockDenyPhoto.mockResolvedValue({ success: true });

    render(<AdminPhotoActions photoId={1} photoUrl="http://example.com/photo.jpg" />);
    fireEvent.click(screen.getByRole("button", { name: /Deny/i }));

    await waitFor(() => {
      expect(mockDenyPhoto).toHaveBeenCalledWith(1, "http://example.com/photo.jpg");
      expect(mockToastSuccess).toHaveBeenCalledWith("Photo denied and deleted.");
    });
  });

  it("handles deny photo failure", async () => {
    mockDenyPhoto.mockResolvedValue({ success: false, message: "Denial failed" });

    render(<AdminPhotoActions photoId={1} photoUrl="http://example.com/photo.jpg" />);
    fireEvent.click(screen.getByRole("button", { name: /Deny/i }));

    await waitFor(() => {
      expect(mockDenyPhoto).toHaveBeenCalledWith(1, "http://example.com/photo.jpg");
      expect(mockToastError).toHaveBeenCalledWith("Denial failed");
    });
  });
});
