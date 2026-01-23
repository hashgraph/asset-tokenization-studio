// SPDX-License-Identifier: Apache-2.0

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssetTable } from "../components/AssetTable";
import { RouterManager } from "@/router/RouterManager";
import { RouteName } from "@/router/RouteName";
import type { Asset } from "@/services/AssetService";
import { AssetType } from "@/services/AssetService";
import type { UseTableReturn } from "@/hooks/useTable";
import { render } from "@/test-utils";

const mockAssets: Asset[] = [
  {
    id: "1",
    name: "Test Asset 1",
    type: AssetType.EQUITY,
    symbol: "TST1",
    hederaTokenAddress: "0.0.123456",
    evmTokenAddress: "0x123456",
    lifeCycleCashFlowEvmAddress: "0x789012",
    isPaused: false,
    syncEnabled: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Test Asset 2",
    type: AssetType.BOND,
    symbol: "TST2",
    hederaTokenAddress: "0.0.654321",
    evmTokenAddress: "0x654321",
    lifeCycleCashFlowEvmAddress: "0x210987",
    isPaused: true,
    syncEnabled: false,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
];

const mockColumns = [
  { id: "name", header: "Name" },
  { id: "type", header: "Type" },
  { id: "status", header: "Status" },
];

const mockTable: UseTableReturn = {
  pagination: { pageIndex: 0, pageSize: 10 },
  setPagination: jest.fn(),
  sorting: [],
  setSorting: jest.fn(),
};

const defaultProps = {
  isLoading: false,
  columns: mockColumns,
  filteredAssets: mockAssets,
  totalPages: 1,
  table: mockTable,
};

describe("AssetTable", () => {
  const mockRouterTo = RouterManager.to as jest.MockedFunction<typeof RouterManager.to>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should match snapshot", () => {
      const component = render(<AssetTable {...defaultProps} />);
      expect(component.asFragment()).toMatchSnapshot();
    });

    it("should render with empty data", () => {
      render(<AssetTable {...defaultProps} filteredAssets={[]} />);

      expect(screen.getByTestId("table-assets")).toBeInTheDocument();
      expect(screen.queryByTestId("row-0")).not.toBeInTheDocument();
    });
  });

  describe("Props Integration", () => {
    it("should pass correct props to Table component", () => {
      render(<AssetTable {...defaultProps} />);

      const table = screen.getByTestId("table-assets");
      expect(table).toBeInTheDocument();
    });

    it("should handle different totalPages values", () => {
      render(<AssetTable {...defaultProps} totalPages={5} />);

      const table = screen.getByTestId("table-assets");
      expect(table).toBeInTheDocument();
    });

    it("should pass table props correctly", () => {
      const customTable = {
        ...mockTable,
        pagination: { pageIndex: 2, pageSize: 20 },
      };

      render(<AssetTable {...defaultProps} table={customTable} />);

      const table = screen.getByTestId("table-assets");
      expect(table).toBeInTheDocument();
    });
  });

  describe("Row Click Interactions", () => {
    it("should navigate to asset detail when row is clicked", async () => {
      const user = userEvent.setup();
      render(<AssetTable {...defaultProps} />);

      const firstRow = screen.getByTestId("row-0");
      await user.click(firstRow);

      expect(mockRouterTo).toHaveBeenCalledWith(RouteName.AssetDetail, {
        params: { id: "1" },
      });
    });

    it("should navigate with correct asset id for different rows", async () => {
      const user = userEvent.setup();
      render(<AssetTable {...defaultProps} />);

      const secondRow = screen.getByTestId("row-1");
      await user.click(secondRow);

      expect(mockRouterTo).toHaveBeenCalledWith(RouteName.AssetDetail, {
        params: { id: "2" },
      });
    });

    it("should handle multiple row clicks", async () => {
      const user = userEvent.setup();
      render(<AssetTable {...defaultProps} />);

      const firstRow = screen.getByTestId("row-0");
      const secondRow = screen.getByTestId("row-1");

      await user.click(firstRow);
      await user.click(secondRow);

      expect(mockRouterTo).toHaveBeenCalledTimes(2);
      expect(mockRouterTo).toHaveBeenNthCalledWith(1, RouteName.AssetDetail, {
        params: { id: "1" },
      });
      expect(mockRouterTo).toHaveBeenNthCalledWith(2, RouteName.AssetDetail, {
        params: { id: "2" },
      });
    });
  });

  describe("Data Handling", () => {
    it("should handle large datasets", () => {
      const largeDataset = Array.from({ length: 100 }, (_, index) => ({
        id: `asset-${index}`,
        name: `Asset ${index}`,
        type: index % 2 === 0 ? AssetType.EQUITY : AssetType.BOND,
        symbol: `SYM${index}`,
        hederaTokenAddress: `0.0.${index}`,
        evmTokenAddress: `0x${index}`,
        lifeCycleCashFlowEvmAddress: `0x${index + 1000}`,
        isPaused: false,
        syncEnabled: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      }));

      render(<AssetTable {...defaultProps} filteredAssets={largeDataset} />);

      expect(screen.getByTestId("table-assets")).toBeInTheDocument();
    });
  });
});
