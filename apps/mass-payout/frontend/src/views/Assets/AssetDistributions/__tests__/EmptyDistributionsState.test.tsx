// SPDX-License-Identifier: Apache-2.0

import { screen } from "@testing-library/react";
import { EmptyDistributionsState } from "../components/EmptyDistributionsState";
import { render } from "@/test-utils";

// Mock io-bricks-ui components
jest.mock("io-bricks-ui", () => ({
  Text: ({ children, textStyle, color, textAlign, ...props }: any) => (
    <p data-testid="text" data-text-style={textStyle} data-color={color} data-text-align={textAlign} {...props}>
      {children}
    </p>
  ),
}));

// Mock Chakra UI components
jest.mock("@chakra-ui/react", () => ({
  ...jest.requireActual("@chakra-ui/react"),
  Box: ({ children, display, alignItems, justifyContent, flex, minHeight, ...props }: any) => (
    <div
      data-testid="box"
      data-display={display}
      data-align-items={alignItems}
      data-justify-content={justifyContent}
      data-flex={flex}
      data-min-height={minHeight}
      {...props}
    >
      {children}
    </div>
  ),
}));

const mockT = jest.fn((key: string) => {
  const translations: Record<string, string> = {
    "assets:noDistributionsYet": "No distributions available yet",
  };
  return translations[key] || key;
});

const defaultProps = {
  t: mockT as any,
};

const renderEmptyDistributionsState = (props = {}) => {
  return render(<EmptyDistributionsState {...defaultProps} {...props} />);
};

describe("EmptyDistributionsState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should match snapshot", () => {
      const component = render(<EmptyDistributionsState {...defaultProps} />);
      expect(component.asFragment()).toMatchSnapshot();
    });
    it("should render empty state message", () => {
      renderEmptyDistributionsState();

      expect(screen.getByTestId("text")).toBeInTheDocument();
      expect(screen.getByText("No distributions available yet")).toBeInTheDocument();
    });

    it("should render container box", () => {
      renderEmptyDistributionsState();

      expect(screen.getByTestId("box")).toBeInTheDocument();
    });

    it("should call translation function with correct key", () => {
      renderEmptyDistributionsState();

      expect(mockT).toHaveBeenCalledWith("assets:noDistributionsYet");
    });
  });

  describe("Props Integration", () => {
    it("should handle t function prop correctly", () => {
      const customT = jest.fn((key: string) => `Translated: ${key}`);
      renderEmptyDistributionsState({ t: customT });

      expect(customT).toHaveBeenCalledTimes(1);
      expect(customT).toHaveBeenCalledWith("assets:noDistributionsYet");
    });
  });
});
