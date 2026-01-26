// SPDX-License-Identifier: Apache-2.0

import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TabContent } from "../components/TabContent";
import { TabContentProps } from "../AssetDistributions.types";
import { render } from "@/test-utils";
import { Control } from "react-hook-form";
import { TFunction } from "i18next";
import { ReactNode } from "react";
import { AssetDistributionsFormValues, AssetDistributionData } from "../AssetDistributions.types";
import { UseTableReturn } from "@/hooks/useTable";

// Type definitions for mocks
interface MockTableProps {
  name?: string;
  columns?: unknown[];
  data?: AssetDistributionData[];
  onClickRow?: (row: AssetDistributionData) => void;
  totalElements?: number;
  totalPages?: number;
  isLoading?: boolean;
  [key: string]: unknown;
}

interface MockTextProps {
  children?: ReactNode;
  textStyle?: string;
  color?: string;
  mb?: number;
  mt?: number;
  [key: string]: unknown;
}

interface MockFilterControlsProps {
  control: Control<AssetDistributionsFormValues>;
  t: TFunction;
}

interface MockEmptyStateProps {
  t: TFunction;
}

// Mock dependencies
jest.mock("@/router/RoutePath", () => ({
  RoutePath: {
    DISTRIBUTIONS_DETAILS: "/distributions/:id/:type/:itemId",
  },
}));

jest.mock("../AssetDistributions.constants", () => ({
  getTabTitle: jest.fn((filterType) => `${filterType} title`),
}));

jest.mock("../AssetDistributions.utils", () => ({
  isDistributionRowClickable: jest.fn((status) => status !== "CANCELLED"),
  calculateTotalPages: jest.fn((total, pageSize) => Math.ceil(total / pageSize)),
}));

jest.mock("../components/FilterControls", () => ({
  FilterControls: ({ control, t }: MockFilterControlsProps) => (
    <div data-testid="filter-controls">
      Filter Controls - {typeof control} - {typeof t}
    </div>
  ),
}));

jest.mock("../components/EmptyDistributionsState", () => ({
  EmptyDistributionsState: ({ t }: MockEmptyStateProps) => (
    <div data-testid="empty-distributions-state">Empty State - {typeof t}</div>
  ),
}));

jest.mock("io-bricks-ui", () => ({
  Table: ({ name, columns, data, onClickRow, totalElements, totalPages, isLoading }: MockTableProps) => (
    <div data-testid="table" data-name={name} data-loading={isLoading}>
      <div data-testid="table-columns">{columns?.length || 0} columns</div>
      <div data-testid="table-data">{data?.length || 0} rows</div>
      <div data-testid="table-total-elements">{totalElements}</div>
      <div data-testid="table-total-pages">{totalPages}</div>
      {data?.map((row: AssetDistributionData, index: number) => (
        <div
          key={row.id || index}
          data-testid={`table-row-${index}`}
          onClick={() => onClickRow?.(row)}
          style={{ cursor: "pointer" }}
        >
          Row {index}: {row.id} - {row.status}
        </div>
      ))}
    </div>
  ),
  Text: ({ children, textStyle, color, mb, mt, ...props }: MockTextProps) => (
    <div data-testid="text" data-text-style={textStyle} data-color={color} {...props}>
      {children}
    </div>
  ),
}));

// jest.mock("@chakra-ui/react", () => ({
//   ...jest.requireActual("@chakra-ui/react"),
//   Box: ({ children, ...props }: MockBoxProps) => (
//     <div data-testid="box" {...props}>
//       {children}
//     </div>
//   ),
// }));

const mockNavigate = jest.fn();
const mockTable: UseTableReturn = {
  pagination: {
    pageSize: 10,
    pageIndex: 0,
  },
  sorting: [],
  setPagination: jest.fn(),
  setSorting: jest.fn(),
};

const mockControl = {
  _formValues: {},
  register: jest.fn(),
  setValue: jest.fn(),
} as unknown as Control<AssetDistributionsFormValues>;

const mockT = jest.fn((key: string) => key) as unknown as TFunction;

const mockColumns = [
  { id: "id", header: "ID" },
  { id: "status", header: "Status" },
  { id: "amount", header: "Amount" },
];

const mockDistributions: AssetDistributionData[] = [
  {
    id: "1",
    status: "SCHEDULED",
    amount: "1000",
    asset: {
      id: "asset-1",
      name: "Test Asset 1",
    } as AssetDistributionData["asset"],
    type: "DIVIDEND",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    status: "IN_PROGRESS",
    amount: "2000",
    asset: {
      id: "asset-2",
      name: "Test Asset 2",
    } as AssetDistributionData["asset"],
    type: "INTEREST",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "3",
    status: "COMPLETED",
    amount: "3000",
    asset: {
      id: "asset-3",
      name: "Test Asset 3",
    } as AssetDistributionData["asset"],
    type: "PRINCIPAL",
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
  },
];

const defaultProps: TabContentProps = {
  filterType: "upcoming",
  columns: mockColumns,
  filteredDistributions: mockDistributions,
  totalFilteredElements: 3,
  isLoading: false,
  control: mockControl,
  id: "asset-123",
  navigate: mockNavigate,
  table: mockTable,
  t: mockT,
};

const renderTabContent = (props: Partial<TabContentProps> = {}) => {
  return render(<TabContent {...defaultProps} {...props} />);
};

describe("TabContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should match snapshot", () => {
      const component = render(<TabContent {...defaultProps} />);
      expect(component.asFragment()).toMatchSnapshot();
    });
    it("should render tab title", () => {
      renderTabContent();

      expect(screen.getByTestId("text")).toBeInTheDocument();
      expect(screen.getByText("upcoming title")).toBeInTheDocument();
    });

    it("should render filter controls", () => {
      renderTabContent();

      expect(screen.getByTestId("filter-controls")).toBeInTheDocument();
    });

    it("should render table when distributions exist", () => {
      renderTabContent();

      expect(screen.getByTestId("table")).toBeInTheDocument();
      expect(screen.getByTestId("table-columns")).toHaveTextContent("3 columns");
      expect(screen.getByTestId("table-data")).toHaveTextContent("3 rows");
    });

    it("should render empty state when no distributions and not loading", () => {
      renderTabContent({
        filteredDistributions: [],
        totalFilteredElements: 0,
        isLoading: false,
      });

      expect(screen.getByTestId("empty-distributions-state")).toBeInTheDocument();
      expect(screen.queryByTestId("table")).not.toBeInTheDocument();
    });

    it("should render table when loading even with no distributions", () => {
      renderTabContent({
        filteredDistributions: [],
        totalFilteredElements: 0,
        isLoading: true,
      });

      expect(screen.getByTestId("table")).toBeInTheDocument();
      expect(screen.queryByTestId("empty-distributions-state")).not.toBeInTheDocument();
    });
  });

  describe("Table Configuration", () => {
    it("should pass correct props to table", () => {
      renderTabContent();

      const table = screen.getByTestId("table");
      expect(table).toHaveAttribute("data-name", "asset-distributions-upcoming");
      expect(table).toHaveAttribute("data-loading", "false");
      expect(screen.getByTestId("table-total-elements")).toHaveTextContent("3");
      expect(screen.getByTestId("table-total-pages")).toHaveTextContent("1");
    });

    it("should calculate total pages correctly", () => {
      renderTabContent({
        totalFilteredElements: 25,
        table: {
          ...mockTable,
          pagination: {
            ...mockTable.pagination,
            pageSize: 10,
          },
        },
      });

      expect(screen.getByTestId("table-total-pages")).toHaveTextContent("3");
    });

    it("should show loading state", () => {
      renderTabContent({ isLoading: true });

      const table = screen.getByTestId("table");
      expect(table).toHaveAttribute("data-loading", "true");
    });
  });

  describe("Row Click Interactions", () => {
    it("should navigate when clicking on clickable row", async () => {
      const user = userEvent.setup();
      renderTabContent();

      const firstRow = screen.getByTestId("table-row-0");
      await user.click(firstRow);

      expect(mockNavigate).toHaveBeenCalledWith("/distributions/asset-123/distribution/1");
    });

    it("should not navigate when clicking on non-clickable row", async () => {
      const user = userEvent.setup();
      const nonClickableDistributions: AssetDistributionData[] = [
        {
          id: "1",
          status: "CANCELLED",
          amount: "1000",
          asset: {
            id: "asset-1",
            name: "Test Asset 1",
          } as AssetDistributionData["asset"],
          type: "DIVIDEND",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];

      renderTabContent({
        filteredDistributions: nonClickableDistributions,
      });

      const firstRow = screen.getByTestId("table-row-0");
      await user.click(firstRow);

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should not navigate when id is not provided", async () => {
      const user = userEvent.setup();
      renderTabContent({ id: undefined });

      const firstRow = screen.getByTestId("table-row-0");
      await user.click(firstRow);

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should handle row click with fireEvent", () => {
      renderTabContent();

      const firstRow = screen.getByTestId("table-row-0");
      fireEvent.click(firstRow);

      expect(mockNavigate).toHaveBeenCalledWith("/distributions/asset-123/distribution/1");
    });
  });

  describe("Filter Types", () => {
    it("should render with ongoing filter type", () => {
      renderTabContent({ filterType: "ongoing" });

      expect(screen.getByText("ongoing title")).toBeInTheDocument();
      const table = screen.getByTestId("table");
      expect(table).toHaveAttribute("data-name", "asset-distributions-ongoing");
    });

    it("should render with completed filter type", () => {
      renderTabContent({ filterType: "completed" });

      expect(screen.getByText("completed title")).toBeInTheDocument();
      const table = screen.getByTestId("table");
      expect(table).toHaveAttribute("data-name", "asset-distributions-completed");
    });
  });

  describe("Props Integration", () => {
    it("should pass control to FilterControls", () => {
      renderTabContent();

      const filterControls = screen.getByTestId("filter-controls");
      expect(filterControls).toHaveTextContent("object");
    });

    it("should pass t function to components", () => {
      renderTabContent();

      const filterControls = screen.getByTestId("filter-controls");
      expect(filterControls).toHaveTextContent("function");

      const emptyState = screen.queryByTestId("empty-distributions-state");
      if (emptyState) {
        expect(emptyState).toHaveTextContent("function");
      }
    });

    it("should handle custom columns", () => {
      const customColumns = [
        { id: "custom1", header: "Custom 1" },
        { id: "custom2", header: "Custom 2" },
      ];

      renderTabContent({ columns: customColumns });

      expect(screen.getByTestId("table-columns")).toHaveTextContent("2 columns");
    });

    it("should handle different table configurations", () => {
      const customTable: UseTableReturn = {
        pagination: {
          pageSize: 20,
          pageIndex: 1,
        },
        sorting: [{ id: "status", desc: false }],
        setPagination: jest.fn(),
        setSorting: jest.fn(),
      };

      renderTabContent({ table: customTable });

      expect(screen.getByTestId("table")).toBeInTheDocument();
    });
  });

  describe("Mocked Functions", () => {
    it("should call getTabTitle with correct filter type", () => {
      const { getTabTitle } = require("../AssetDistributions.constants");
      renderTabContent({ filterType: "completed" });

      expect(getTabTitle).toHaveBeenCalledWith("completed");
    });

    it("should call isDistributionRowClickable when row is clicked", async () => {
      const { isDistributionRowClickable } = require("../AssetDistributions.utils");
      const user = userEvent.setup();
      renderTabContent();

      const firstRow = screen.getByTestId("table-row-0");
      await user.click(firstRow);

      expect(isDistributionRowClickable).toHaveBeenCalledWith("SCHEDULED");
    });

    it("should call calculateTotalPages with correct parameters", () => {
      const { calculateTotalPages } = require("../AssetDistributions.utils");
      renderTabContent({
        totalFilteredElements: 25,
        table: {
          ...mockTable,
          pagination: {
            ...mockTable.pagination,
            pageSize: 10,
          },
        },
      });

      expect(calculateTotalPages).toHaveBeenCalledWith(25, 10);
    });
  });
});
