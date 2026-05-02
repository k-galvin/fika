
import { render, screen, waitFor } from "@testing-library/react";
import { CafeMap } from "../cafe-map";

// Mock the fetch function
global.fetch = jest.fn();

// Mock react-leaflet components to avoid rendering actual map
jest.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="marker">{children}</div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
}));

const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (/Warning: ReactDOM.render is no longer supported in React 18./.test(args[0])) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

describe("CafeMap", () => {
  beforeEach(() => {
    // Reset mocks before each test
    (global.fetch as jest.Mock).mockClear();
  });

  it("should render the loading state initially", async () => {
    // Provide a deterministic fetch mock so async state updates are flushed within act
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          lat: "34.0522",
          lon: "-118.2437",
        },
      ],
    });

    render(<CafeMap address="123 Main St" cafeName="Test Cafe" />);

    // Initial loading state should be visible immediately
    expect(screen.getByText("Loading map...")).toBeInTheDocument();

    // Wait for the async effect to complete to avoid act warnings
    await waitFor(() => {
      expect(screen.getByTestId("map-container")).toBeInTheDocument();
    });
  });

  it("should render the map on successful geocoding", async () => {
    const mockSuccessResponse = [
      {
        lat: "34.0522",
        lon: "-118.2437",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    render(<CafeMap address="123 Main St" cafeName="Test Cafe" />);

    // Wait for the map container to be rendered
    await waitFor(() => {
      expect(screen.getByTestId("map-container")).toBeInTheDocument();
    });

    // Check if other map components are also rendered
    expect(screen.getByTestId("tile-layer")).toBeInTheDocument();
    expect(screen.getByTestId("marker")).toBeInTheDocument();
    expect(screen.getByTestId("popup")).toBeInTheDocument();
    expect(screen.getByText("Test Cafe")).toBeInTheDocument();
  });

  it('should show "Address not found" message for valid but unlocatable address', async () => {
    // Simulate an empty array response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<CafeMap address="Invalid Address" cafeName="Test Cafe" />);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText("Address not found")).toBeInTheDocument();
    });
  });

  it("should show a generic error message on geocoding API failure", async () => {
    // Simulate a failed network request
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to fetch")
    );

    render(<CafeMap address="123 Main St" cafeName="Test Cafe" />);

    // Wait for the generic error message to appear
    await waitFor(() => {
      expect(
        screen.getByText("Failed to load map location")
      ).toBeInTheDocument();
    });
  });

  it('should show "No address provided" if address is empty', async () => {
    render(<CafeMap address="" cafeName="Test Cafe" />);

    // Wait for the specific error message to appear
    await waitFor(() => {
      expect(screen.getByText("No address provided")).toBeInTheDocument();
    });
  });
});
