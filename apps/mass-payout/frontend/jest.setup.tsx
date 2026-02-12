// SPDX-License-Identifier: Apache-2.0

import "@testing-library/jest-dom";
import React from "react";
import { mockTranslations } from "./mockTranslations";

(globalThis as any).importMeta = {
  env: {
    VITE_API_URL: "http://localhost:3000/api",
  },
};

Object.defineProperty(globalThis, "import", {
  value: {
    meta: {
      env: {
        VITE_API_URL: "http://localhost:3000/api",
      },
    },
  },
  writable: true,
  configurable: true,
});

(global as any).import = {
  meta: {
    env: {
      VITE_API_URL: "http://localhost:3000/api",
    },
  },
};

jest.mock("i18next", () => ({
  use: jest.fn().mockReturnThis(),
  init: jest.fn(),
  t: jest.fn((key) => mockTranslations[key] || key),
  changeLanguage: jest.fn(),
  language: "en",
  getFixedT: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: (namespace?: string) => ({
    t: jest.fn((key) => {
      const fullKey = namespace ? `${namespace}:${key}` : key;
      return mockTranslations[key] || mockTranslations[fullKey] || key;
    }),
    i18n: {
      changeLanguage: jest.fn(),
      language: "en",
    },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: {
    type: "i18next",
    init: jest.fn(),
  },
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("i18next-browser-languagedetector", () => jest.fn());

jest.mock("./src/i18n/config", () => ({
  __esModule: true,
  default: {
    use: jest.fn().mockReturnThis(),
    init: jest.fn(),
    t: jest.fn((key) => mockTranslations[key] || key),
    changeLanguage: jest.fn(),
    language: "en",
    getFixedT: jest.fn(),
  },
}));

jest.mock("./src/router/RouterManager", () => ({
  RouterManager: {
    to: jest.fn(),
    getUrl: jest.fn(),
    goBack: jest.fn(),
  },
}));

jest.mock("lodash/omit", () => ({
  __esModule: true,
  default: (obj: Record<string, any>, keys: string | string[]) => {
    const result = { ...obj };
    if (Array.isArray(keys)) {
      keys.forEach((key: string) => delete result[key]);
    } else {
      delete result[keys];
    }
    return result;
  },
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

const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === "string" && args[0].includes("ReactDOMTestUtils.act")) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
