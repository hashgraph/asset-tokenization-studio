process.env.VITE_API_URL = "http://localhost:8080/api/v1";
import Select from "react-select";

// Polyfill for TextEncoder and TextDecoder
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

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
