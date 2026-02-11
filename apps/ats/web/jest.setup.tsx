// SPDX-License-Identifier: Apache-2.0

// Mock @zag-js/focus-visible to avoid JSDOM focus property issues
jest.mock("@zag-js/focus-visible", () => ({
  trackFocusVisible: () => () => {},
}));

process.env.VITE_API_URL = "http://localhost:8080/api/v1";

// Mock Terminal3 modules to avoid LRU cache issues
jest.mock("@terminal3/verify_vc");
jest.mock("@terminal3/bbs_vc");

import Select from "react-select";

// Polyfill for TextEncoder and TextDecoder
import { TextEncoder, TextDecoder } from "util";
if (typeof (global as any).TextEncoder === "undefined") {
  (global as any).TextEncoder = TextEncoder;
}
if (typeof (global as any).TextDecoder === "undefined") {
  (global as any).TextDecoder = TextDecoder;
}

jest.doMock("chakra-react-select", () => ({
  ...jest.requireActual("chakra-react-select"),
  // @ts-ignore
  Select: ({ _components, ...props }) => <Select {...props} />,
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const noop = () => {};
Object.defineProperty(window, "scrollTo", { value: noop, writable: true });
