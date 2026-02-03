// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck
/**
 * @deprecated This test is not currently used. Kept for potential future usage.
 */

import { render } from "@/test-utils";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssetPayments } from "../AssetPayments";

const factoryComponent = () => render(<AssetPayments />);

describe.skip("AssetPayments Component", () => {
  let user: ReturnType<typeof userEvent.setup>;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    user = userEvent.setup();
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe.skip("Basic rendering", () => {
    test("should render correctly", () => {
      const component = factoryComponent();
      expect(component.asFragment()).toMatchSnapshot();
    });

    test("should display payments title", () => {
      factoryComponent();
      expect(screen.getByText("Payments")).toBeInTheDocument();
    });

    test("should display search input", () => {
      factoryComponent();
      expect(screen.getByPlaceholderText("Search by payment ID")).toBeInTheDocument();
    });

    test("should display table with data", () => {
      factoryComponent();
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getAllByRole("row").length).toBeGreaterThan(0);
    });

    test("should display table structure", () => {
      factoryComponent();
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getByText("Creation date")).toBeInTheDocument();
      expect(screen.getByText("Payment Type")).toBeInTheDocument();
      expect(screen.getByText("Paid amount")).toBeInTheDocument();
    });
  });

  describe("Search functionality", () => {
    test("should update search input value", async () => {
      factoryComponent();

      const searchInput = screen.getByPlaceholderText("Search by payment ID");
      await user.type(searchInput, "0.0.123456");

      await waitFor(() => {
        expect(searchInput).toHaveValue("0.0.123456");
      });
    });

    test("should show no results for non-existent search", async () => {
      factoryComponent();

      const searchInput = screen.getByPlaceholderText("Search by payment ID");
      await user.type(searchInput, "NonExistentPayment123");

      await waitFor(() => {
        const rows = screen.getAllByRole("row");
        expect(rows.length).toBe(1);
      });
    });

    test("should clear search results when input is cleared", async () => {
      factoryComponent();

      const searchInput = screen.getByPlaceholderText("Search by payment ID");

      await user.type(searchInput, "0.0.123456");
      await waitFor(() => {
        const filteredRows = screen.getAllByRole("row");
        expect(filteredRows.length).toBe(2);
      });

      await user.clear(searchInput);

      await waitFor(() => {
        const allRows = screen.getAllByRole("row");
        expect(allRows.length).toBeGreaterThan(2);
      });
    });

    test("should clear search input when cleared", async () => {
      factoryComponent();

      const searchInput = screen.getByPlaceholderText("Search by payment ID");
      await user.type(searchInput, "0.0.123456");

      await waitFor(() => {
        expect(searchInput).toHaveValue("0.0.123456");
      });

      await user.clear(searchInput);

      await waitFor(() => {
        expect(searchInput).toHaveValue("");
      });
    });
  });

  describe("Table interactions", () => {
    test("should handle row click for failed payments", async () => {
      factoryComponent();

      const failedRow = screen.getByText("Failed").closest("tr");
      if (failedRow) {
        await user.click(failedRow);
      }
    });

    test("should display table headers correctly", async () => {
      factoryComponent();

      expect(screen.getByText("Creation date")).toBeInTheDocument();
      expect(screen.getByText("Payment Type")).toBeInTheDocument();
      expect(screen.getByText("Paid amount")).toBeInTheDocument();
      expect(screen.getByText("Batch Count")).toBeInTheDocument();
      expect(screen.getByText("Holders")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
    });

    test("should display payment status", () => {
      factoryComponent();

      expect(screen.getByText("In Progress")).toBeInTheDocument();
      expect(screen.getByText("Failed")).toBeInTheDocument();
      expect(screen.getByText("Completed")).toBeInTheDocument();
    });

    test("should display progress bars", () => {
      factoryComponent();

      const progressElements = document.querySelectorAll('[role="progressbar"], .chakra-progress');
      expect(progressElements.length).toBeGreaterThan(0);
    });
  });

  describe("Data display", () => {
    test("should display creation dates", () => {
      factoryComponent();

      expect(screen.getByText("09/10/2024")).toBeInTheDocument();
      expect(screen.getByText("08/10/2024")).toBeInTheDocument();
      expect(screen.getByText("04/10/2024")).toBeInTheDocument();
    });

    test("should display paid amounts", () => {
      factoryComponent();

      const amountTexts = [
        "1500.50",
        "1,500.50",
        "$1500.50",
        "$1,500.50",
        "2300.75",
        "2,300.75",
        "$2300.75",
        "$2,300.75",
        "5000.00",
        "5,000.00",
        "$5000.00",
        "$5,000.00",
      ];

      const foundAmounts = amountTexts.filter((amount) => {
        try {
          return screen.queryByText(amount) !== null;
        } catch {
          return false;
        }
      });

      expect(foundAmounts.length).toBeGreaterThan(0);
    });

    test("should display batch counts and holders", () => {
      factoryComponent();

      const batchCountElements = screen.getAllByText("80");
      expect(batchCountElements.length).toBeGreaterThan(0);

      const holdersElements = screen.getAllByText("90");
      expect(holdersElements.length).toBeGreaterThan(0);
    });
  });

  describe("Pagination", () => {
    test("should handle pagination controls", () => {
      factoryComponent();

      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();

      const rows = screen.getAllByRole("row");
      expect(rows.length).toBeGreaterThan(1);
    });
  });

  describe("Payment status variations", () => {
    test("should display different payment statuses correctly", () => {
      factoryComponent();

      expect(screen.getByText("In Progress")).toBeInTheDocument();
      expect(screen.getByText("Failed")).toBeInTheDocument();
      expect(screen.getByText("Completed")).toBeInTheDocument();
    });
  });
});
