import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

/* eslint-disable @typescript-eslint/no-explicit-any */

if (typeof (global as any).Request === "undefined") {
  (global as any).Request = class Request {};
}
if (typeof (global as any).Response === "undefined") {
  (global as any).Response = class Response {};
}

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder as typeof global.TextDecoder;

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => "",
}));

const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});

(global as any).window = global.window || {};
(global as any).window.IntersectionObserver = mockIntersectionObserver;