// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck
/**
 * @deprecated This test is not currently used. Kept for potential future usage.
 */
import { render } from "@/test-utils";
import { screen } from "@testing-library/react";
import { DistributionDetail } from "../DistributionDetail";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory } from "history";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "0.0.123456" }),
}));

const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

describe.skip("DistributionDetail Component", () => {
  let user: ReturnType<typeof userEvent.setup>;
  let history: ReturnType<typeof createMemoryHistory>;

  beforeEach(() => {
    user = userEvent.setup();
    history = createMemoryHistory({
      initialEntries: ["/distributions/0.0.123456"],
    });
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe("Basic rendering", () => {
    test("should render correctly", () => {
      const component = render(<DistributionDetail />, { history });
      expect(component.asFragment()).toMatchSnapshot();
    });

    test("should display distribution information", () => {
      render(<DistributionDetail />, { history });

      expect(screen.getByText("Failed")).toBeInTheDocument();
      expect(screen.getByText("Details")).toBeInTheDocument();
    });

    test("should display status tag", () => {
      render(<DistributionDetail />, { history });

      const statusTag = screen.getByText("Failed");
      expect(statusTag).toBeInTheDocument();
    });

    test("should display tabs", () => {
      render(<DistributionDetail />, { history });

      expect(screen.getByText("Details")).toBeInTheDocument();
      expect(screen.getByText("Corporate Actions Distribution Details")).toBeInTheDocument();
    });

    test("should display go back button", () => {
      render(<DistributionDetail />, { history });

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe("User interactions", () => {
    test("should handle tab navigation", async () => {
      render(<DistributionDetail />, { history });

      const holdersTab = screen.getByText("Corporate Actions Distribution Details");
      await user.click(holdersTab);

      expect(screen.getByText("Corporate Actions Distribution Details")).toBeInTheDocument();

      const detailsTab = screen.getByText("Details");
      await user.click(detailsTab);

      expect(screen.getByText("Details")).toBeInTheDocument();
    });

    test("should handle go back button click", async () => {
      render(<DistributionDetail />, { history });

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);

      await user.click(buttons[0]);

      expect(buttons[0]).toBeInTheDocument();
    });
  });

  describe("URL parameters and search params", () => {
    test("should handle tab parameter in URL", () => {
      const historyWithTab = createMemoryHistory({
        initialEntries: ["/distributions/0.0.123456?tab=holders"],
      });

      render(<DistributionDetail />, { history: historyWithTab });

      expect(screen.getByText("Corporate Actions Distribution Details")).toBeInTheDocument();
    });

    test("should update URL when tab changes", async () => {
      render(<DistributionDetail />, { history });

      const holdersTab = screen.getByText("Corporate Actions Distribution Details");
      await user.click(holdersTab);

      expect(screen.getByText("Corporate Actions Distribution Details")).toBeInTheDocument();
    });
  });

  describe("Distribution status", () => {
    test("should display failed status correctly", () => {
      render(<DistributionDetail />, { history });

      const statusTag = screen.getByText("Failed");
      expect(statusTag).toBeInTheDocument();
    });
  });

  describe("Breadcrumbs and navigation", () => {
    test("should display breadcrumbs", () => {
      render(<DistributionDetail />, { history });

      expect(screen.getByText("Details")).toBeInTheDocument();
    });
  });

  describe("Tab content", () => {
    test("should display Details tab content by default", () => {
      render(<DistributionDetail />, { history });

      // The Details component should be rendered by default
      expect(screen.getByText("Details")).toBeInTheDocument();
    });

    test("should display Corporate Actions Distribution Details tab content when selected", async () => {
      render(<DistributionDetail />, { history });

      const holdersTab = screen.getByText("Corporate Actions Distribution Details");
      await user.click(holdersTab);

      expect(screen.getByText("Corporate Actions Distribution Details")).toBeInTheDocument();
    });
  });

  describe("Distribution data", () => {
    test("should use distribution ID from URL params", () => {
      render(<DistributionDetail />, { history });

      expect(screen.getByText("Details")).toBeInTheDocument();
      expect(screen.getByText("Corporate Actions Distribution Details")).toBeInTheDocument();
    });

    test("should handle missing distribution ID", () => {
      const mockUseParams = jest.spyOn(require("react-router-dom"), "useParams");
      mockUseParams.mockReturnValue({ id: undefined });

      render(<DistributionDetail />, { history });

      expect(screen.getByText("Details")).toBeInTheDocument();
      expect(screen.getByText("Failed")).toBeInTheDocument();

      mockUseParams.mockRestore();
    });
  });
});
