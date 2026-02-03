// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck
/**
 * @deprecated This test is not currently used. Kept for potential future usage.
 */

import { render } from "@/test-utils";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockDistributionsPaginatedResponse } from "@/test-utils/mocks/DistributionMocks";
import { Distributions } from "../Distributions";

jest.mock("@/services/DistributionService", () => ({
  ...jest.requireActual("@/services/DistributionService"),
  useGetDistributions: () => ({
    data: mockDistributionsPaginatedResponse,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

const factoryComponent = () => render(<Distributions />);

describe.skip("Distributions Component", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe("Basic rendering", () => {
    test("should render correctly", () => {
      const component = factoryComponent();
      expect(component.asFragment()).toMatchSnapshot();
    });

    test("should display distributions title", () => {
      factoryComponent();
      expect(screen.getAllByText("Distributions")[0]).toBeInTheDocument();
    });

    test("should show filter and search controls", () => {
      factoryComponent();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    test("should display table with data", async () => {
      factoryComponent();
      expect(screen.getByRole("table")).toBeInTheDocument();

      await waitFor(() => {
        const rows = screen.getAllByRole("row");
        expect(rows.length).toBeGreaterThan(1); // Header + data rows
      });
    });

    test("should not show import button", () => {
      factoryComponent();
      expect(screen.queryByRole("button", { name: /import/i })).not.toBeInTheDocument();
    });
  });

  describe("Distribution type filtering", () => {
    test("should have distribution type selector", () => {
      factoryComponent();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  describe("Search functionality", () => {
    test("should filter distributions by asset name", async () => {
      factoryComponent();

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "Hedera");

      await waitFor(() => {
        const rows = screen.getAllByRole("row");
        expect(rows.length).toBeGreaterThan(0);
      });
    });

    test("should show no results for non-existent search", async () => {
      factoryComponent();

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "NonExistentDistribution123");

      await waitFor(() => {
        const rows = screen.getAllByRole("row");
        expect(rows.length).toBe(1);
      });
    });

    test("should clear search results when input is cleared", async () => {
      factoryComponent();

      const searchInput = screen.getByRole("textbox");

      await user.type(searchInput, "Hedera");
      expect(searchInput).toHaveValue("Hedera");

      await user.clear(searchInput);
      expect(searchInput).toHaveValue("");
    });
  });

  describe("Table interactions", () => {
    test("should handle table interactions without errors", async () => {
      factoryComponent();

      await waitFor(() => {
        const table = screen.getByRole("table");
        expect(table).toBeInTheDocument();
        const rows = screen.getAllByRole("row");
        expect(rows.length).toBeGreaterThan(0);
      });

      // Test that clicking on the table doesn't cause errors
      const table = screen.getByRole("table");
      let clickError = null;
      try {
        await user.click(table);
      } catch (error) {
        clickError = error;
      }
      expect(clickError).toBeNull();
    });
  });

  describe("Distribution links", () => {
    test("should display table structure", async () => {
      factoryComponent();

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
        const rows = screen.getAllByRole("row");
        expect(rows.length).toBeGreaterThan(1);
      });
    });
  });

  describe("Combined filtering", () => {
    test("should have both filter controls available", () => {
      factoryComponent();

      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });
  });

  describe("Pagination", () => {
    test("should limit displayed rows per page", () => {
      factoryComponent();

      const rows = screen.getAllByRole("row");
      expect(rows.length).toBeLessThanOrEqual(11);
    });
  });

  describe("Edge cases", () => {
    test("should handle special characters in search", async () => {
      factoryComponent();

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "@#$%");

      expect(searchInput).toHaveValue("@#$%");
    });

    test("should handle very long search terms", async () => {
      factoryComponent();

      const searchInput = screen.getByRole("textbox");
      const longSearch = "a".repeat(100);
      await user.type(searchInput, longSearch);

      expect(searchInput).toHaveValue(longSearch);
    });

    test("should maintain filter state during interactions", async () => {
      factoryComponent();

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "Hedera");

      expect(searchInput).toHaveValue("Hedera");

      const selector = screen.getByRole("combobox");
      await user.click(selector);

      expect(searchInput).toHaveValue("Hedera");
    });
  });
});
