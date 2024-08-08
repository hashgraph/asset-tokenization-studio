// @ts-nocheck
import React from "react";
import Select from "react-select";

// To prevent TypeError: env.window.matchMedia is not a function
export default global.matchMedia =
  global.matchMedia ||
  function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
  };

// react-select-event is not working correctly with custom components in select
jest.mock("chakra-react-select", () => ({
  ...jest.requireActual("chakra-react-select"),
  Select: ({ components, ...props }) => <Select {...props} />,
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
