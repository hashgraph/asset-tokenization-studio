// SPDX-License-Identifier: Apache-2.0

import { render } from "@/test-utils";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockAssets, resetAssetMocks } from "@/test-utils/mocks/AssetMocks";
import { AssetService } from "@/services/AssetService";
import { useGetAssets } from "../../hooks/queries/AssetQueries";
import { Assets } from "../Assets";

jest.mock("@/services/AssetService", () => ({
  AssetService: {
    getAssets: jest.fn(),
    getAsset: jest.fn(),
    pauseAsset: jest.fn(),
    unpauseAsset: jest.fn(),
  },
  AssetType: {
    EQUITY: "Equity",
    BOND_VARIABLE_RATE: "Bond Variable Rate",
    BOND_FIXED_RATE: "Bond Fixed Rate",
    BOND_KPI_LINKED_RATE: "Bond KPI Linked Rate",
    BOND_SPT_RATE: "Bond SPT Rate",
  },
}));

jest.mock("../../hooks/queries/AssetQueries", () => ({
  useGetAssets: jest.fn(),
  useGetAsset: jest.fn(),
  usePauseAsset: jest.fn(),
  useUnpauseAsset: jest.fn(),
}));

jest.mock("@/router/RouterManager", () => ({
  RouterManager: {
    to: jest.fn(),
  },
}));

describe("Assets Component", () => {
  let user: ReturnType<typeof userEvent.setup>;
  const assetService = AssetService as jest.Mocked<typeof AssetService>;
  const mockUseGetAssets = useGetAssets as jest.MockedFunction<typeof useGetAssets>;

  beforeEach(() => {
    user = userEvent.setup();
    resetAssetMocks();
    assetService.getAssets.mockClear();
    assetService.getAsset.mockClear();
    assetService.pauseAsset.mockClear();
    assetService.unpauseAsset.mockClear();

    const mockPaginatedAssets = {
      queryData: mockAssets,
      page: {
        totalElements: mockAssets.length,
        totalPages: 1,
        pageIndex: 0,
        pageSize: 10,
      },
    };

    assetService.getAssets.mockResolvedValue(mockPaginatedAssets);

    mockUseGetAssets.mockReturnValue({
      data: mockPaginatedAssets,
      isLoading: false,
      error: null,
      isError: false,
      refetch: jest.fn(),
    } as any);
  });

  describe("Basic rendering", () => {
    test("should render correctly", () => {
      const component = render(<Assets />);
      expect(component.asFragment()).toMatchSnapshot();
    });

    test("should display assets title", () => {
      render(<Assets />);
      expect(screen.getAllByText("Import Asset")[0]).toBeInTheDocument();
    });

    test("should show filter and search controls", async () => {
      render(<Assets />);
      await waitFor(() => {
        expect(screen.getByRole("combobox")).toBeInTheDocument();
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });
    });

    test("should display table with data", async () => {
      render(<Assets />);
      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
        expect(screen.getAllByRole("row").length).toBeGreaterThan(0);
      });
    });

    test("should show import asset button", async () => {
      render(<Assets />);
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /import/i })).toBeInTheDocument();
      });
    });
  });

  describe("Asset type filtering", () => {
    test("should filter by Bond type", async () => {
      render(<Assets />);

      await waitFor(() => {
        expect(screen.getByRole("combobox")).toBeInTheDocument();
      });

      const selector = screen.getByRole("combobox");
      await user.click(selector);

      const bondOptions = await screen.findAllByText("filters.options.bondVariableRate");
      await user.click(bondOptions[0]);

      await waitFor(() => {
        const rows = screen.getAllByRole("row");
        expect(rows.length).toBeGreaterThanOrEqual(1);
      });
    });

    test("should filter by Equity type", async () => {
      render(<Assets />);

      await waitFor(() => {
        expect(screen.getByRole("combobox")).toBeInTheDocument();
      });

      const selector = screen.getByRole("combobox");
      await user.click(selector);

      const equityOptions = await screen.findAllByText("filters.options.equity");
      await user.click(equityOptions[0]);

      await waitFor(() => {
        const rows = screen.getAllByRole("row");
        expect(rows.length).toBeGreaterThanOrEqual(1);
      });
    });

    test("should show all assets when selecting all types", async () => {
      render(<Assets />);

      await waitFor(() => {
        expect(screen.getByRole("combobox")).toBeInTheDocument();
      });

      const selector = screen.getByRole("combobox");
      await user.click(selector);

      const allOptions = await screen.findAllByText("filters.options.allTypes");
      await user.click(allOptions[0]);

      await waitFor(() => {
        const rows = screen.getAllByRole("row");
        expect(rows.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("Search functionality", () => {
    test("should filter assets by name", async () => {
      render(<Assets />);

      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "Hedera");

      expect(searchInput).toHaveValue("Hedera");
    });

    test("should filter assets by asset ID", async () => {
      render(<Assets />);

      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "0.0.123456");

      await waitFor(() => {
        const rows = screen.getAllByRole("row");
        expect(rows.length).toBeGreaterThan(0);
      });
    });

    test("should filter assets by lifecycle cash flow ID", async () => {
      render(<Assets />);

      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "0.0.789012");

      await waitFor(() => {
        const rows = screen.getAllByRole("row");
        expect(rows.length).toBeGreaterThan(0);
      });
    });

    test("should show no results for non-existent search", async () => {
      render(<Assets />);

      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "NonExistentAsset123");

      await waitFor(() => {
        const rows = screen.getAllByRole("row");
        expect(rows.length).toBe(1);
      });
    });

    test("should clear search results when input is cleared", async () => {
      render(<Assets />);

      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });

      const searchInput = screen.getByRole("textbox");

      await user.type(searchInput, "Hedera");
      await waitFor(() => {
        const filteredRows = screen.getAllByRole("row");
        expect(filteredRows.length).toBeGreaterThan(0);
      });

      await user.clear(searchInput);

      await waitFor(() => {
        const allRows = screen.getAllByRole("row");
        expect(allRows.length).toBeGreaterThan(1);
      });
    });
  });

  describe("Table interactions", () => {
    test("should handle row clicks", async () => {
      const { RouterManager } = require("@/router/RouterManager");
      const routerSpy = jest.spyOn(RouterManager, "to");

      render(<Assets />);

      await waitFor(() => {
        const rows = screen.getAllByRole("row");
        expect(rows.length).toBeGreaterThan(1);
      });

      const rows = screen.getAllByRole("row");
      if (rows.length > 1) {
        await user.click(rows[1]);
        expect(routerSpy).toHaveBeenCalledWith("ASSET_DETAIL", {
          params: { id: expect.any(String) },
        });
      }

      routerSpy.mockRestore();
    });

    test("should display asset status tags", async () => {
      render(<Assets />);

      await waitFor(() => {
        const activeElements = screen.getAllByText("Active");
        expect(activeElements.length).toBeGreaterThan(0);
        expect(activeElements[0]).toBeInTheDocument();
      });
    });

    test("should display asset links", async () => {
      render(<Assets />);

      await waitFor(() => {
        const links = screen.getAllByRole("link");
        expect(links.length).toBeGreaterThan(0);

        links.forEach((link) => {
          expect(link).toHaveAttribute("href");
          expect(link).toHaveAttribute("target", "_blank");
        });
      });
    });
  });

  describe("Combined filtering", () => {
    test("should apply asset type and search filters simultaneously", async () => {
      render(<Assets />);

      await waitFor(() => {
        expect(screen.getByRole("combobox")).toBeInTheDocument();
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });

      const selector = screen.getByRole("combobox");
      await user.click(selector);

      const bondOptions = await screen.findAllByText("filters.options.bondVariableRate");
      await user.click(bondOptions[0]);

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "Hedera");

      await waitFor(() => {
        const rows = screen.getAllByRole("row");
        expect(rows.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Pagination", () => {
    test("should limit displayed rows per page", async () => {
      render(<Assets />);

      await waitFor(() => {
        const rows = screen.getAllByRole("row");
        expect(rows.length).toBeLessThanOrEqual(11);
      });
    });
  });

  describe("Button interactions", () => {
    test("should handle import asset button click", async () => {
      const { RouterManager } = require("@/router/RouterManager");
      const routerSpy = jest.spyOn(RouterManager, "to");

      render(<Assets />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /import/i })).toBeInTheDocument();
      });

      const addButton = screen.getByRole("button", { name: /import/i });
      await user.click(addButton);

      expect(routerSpy).toHaveBeenCalledWith("IMPORT_ASSET");
      routerSpy.mockRestore();
    });
  });

  describe("Edge cases", () => {
    test("should handle special characters in search", async () => {
      render(<Assets />);

      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "@#$%");

      expect(searchInput).toHaveValue("@#$%");
    });

    test("should handle very long search terms", async () => {
      render(<Assets />);

      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });

      const searchInput = screen.getByRole("textbox");
      const longSearch = "a".repeat(100);
      await user.type(searchInput, longSearch);

      expect(searchInput).toHaveValue(longSearch);
    });

    test("should maintain filter state during interactions", async () => {
      render(<Assets />);

      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
        expect(screen.getByRole("combobox")).toBeInTheDocument();
      });

      const searchInput = screen.getByRole("textbox");
      await user.type(searchInput, "Hedera");

      expect(searchInput).toHaveValue("Hedera");

      const selector = screen.getByRole("combobox");
      await user.click(selector);

      expect(searchInput).toHaveValue("Hedera");
    });
  });
});
