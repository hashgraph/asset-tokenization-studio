// SPDX-License-Identifier: Apache-2.0

import { screen, fireEvent } from "@testing-library/react";
import { DistributionHeader } from "../components/DistributionHeader";
import { ProcessStatus } from "@/types/status";
import { render } from "@/test-utils";

describe("DistributionHeader", () => {
  const mockT = jest.fn((key: string) => {
    const translations: Record<string, string> = {
      failedMessage: "This distribution has failed",
      retryButton: "Retry all",
    };
    return translations[key] || key;
  });

  const mockOnGoBack = jest.fn();
  const mockOnRetryAll = jest.fn();

  const defaultProps = {
    breadcrumbItems: [
      { label: "Assets", link: "/assets" },
      { label: "Distribution Details", link: "/distributions/123" },
    ],
    title: "Distribution #123",
    onGoBack: mockOnGoBack,
    onRetryAll: mockOnRetryAll,
    t: mockT,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    test("should render correctly", () => {
      const component = render(<DistributionHeader {...defaultProps} />);
      expect(component.asFragment()).toMatchSnapshot();
    });

    test("should render breadcrumb with correct items", () => {
      render(<DistributionHeader {...defaultProps} />);

      const breadcrumb = screen.getByTestId("breadcrumb-desktop");
      expect(breadcrumb).toBeInTheDocument();

      expect(screen.getByText("Assets")).toBeInTheDocument();
      expect(screen.getByText("Distribution Details")).toBeInTheDocument();
    });
  });

  describe("Distribution Status", () => {
    test("should render completed status tag", () => {
      const propsWithCompletedStatus = {
        ...defaultProps,
        distribution: { status: "COMPLETED" },
      };

      render(<DistributionHeader {...propsWithCompletedStatus} />);

      // Check that the status tag is rendered with the correct text
      expect(screen.getByText(ProcessStatus.COMPLETED)).toBeInTheDocument();
    });

    test("should render failed status tag", () => {
      const propsWithFailedStatus = {
        ...defaultProps,
        distribution: { status: "FAILED" },
      };

      render(<DistributionHeader {...propsWithFailedStatus} />);

      // Check that the status tag is rendered with the correct text
      expect(screen.getByText(ProcessStatus.FAILED)).toBeInTheDocument();
    });

    test("should not render status tag when no distribution provided", () => {
      render(<DistributionHeader {...defaultProps} />);

      // Check that no status tag is rendered
      expect(screen.queryByText(ProcessStatus.COMPLETED)).not.toBeInTheDocument();
      expect(screen.queryByText(ProcessStatus.FAILED)).not.toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    test("should call onGoBack when go back button is clicked", () => {
      render(<DistributionHeader {...defaultProps} />);

      const gobackButton = screen.getByTestId("go-back-button-button");
      fireEvent.click(gobackButton);

      expect(mockOnGoBack).toHaveBeenCalledTimes(1);
    });

    test("should call onRetryAll when retry button is clicked", () => {
      const propsWithFailedStatus = {
        ...defaultProps,
        distribution: { status: "FAILED" },
      };

      render(<DistributionHeader {...propsWithFailedStatus} />);

      const retryButton = screen.getByText("Retry all");
      fireEvent.click(retryButton);

      expect(mockOnRetryAll).toHaveBeenCalledTimes(1);
    });

    test("should not render retry button when distribution is not failed", () => {
      const propsWithCompletedStatus = {
        ...defaultProps,
        distribution: { status: "COMPLETED" },
      };

      render(<DistributionHeader {...propsWithCompletedStatus} />);

      expect(screen.queryByText("Retry all")).not.toBeInTheDocument();
    });

    test("should not render retry button when no distribution provided", () => {
      render(<DistributionHeader {...defaultProps} />);

      expect(screen.queryByText("Retry all")).not.toBeInTheDocument();
    });
  });
});
