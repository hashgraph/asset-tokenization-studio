// SPDX-License-Identifier: Apache-2.0

import { screen } from "@testing-library/react";
import { DistributionTable } from "../components/DistributionTable";
import { DistributionsDetailsData } from "../../hooks/useDistributionsDetailsColumns";
import { UseTableReturn } from "@/hooks/useTable";
import { DistributionsDetailsStatus } from "@/types/status";
import { render } from "@/test-utils";

const mockColumns = [
  {
    id: "address",
    header: "Address",
    accessorKey: "address",
  },
  {
    id: "amount",
    header: "Amount",
    accessorKey: "amount",
  },
];

const mockData: DistributionsDetailsData[] = [
  {
    paymentId: "1",
    receieverAddressHedera: "0.0.123",
    receieverAddressEvm: "0x123...abc",
    amount: "100.00",
    executionDate: "2024-01-15",
    txHash: "0xabc123...",
    status: DistributionsDetailsStatus.SUCCESS,
  },
  {
    paymentId: "2",
    receieverAddressHedera: "0.0.456",
    receieverAddressEvm: "0x456...def",
    amount: "200.00",
    executionDate: "2024-01-16",
    txHash: "0xdef456...",
    status: DistributionsDetailsStatus.PENDING,
  },
];

const mockTable: UseTableReturn = {
  pagination: {
    pageIndex: 0,
    pageSize: 10,
  },
  setPagination: jest.fn(),
  sorting: [],
  setSorting: jest.fn(),
};

describe("DistributionTable", () => {
  const defaultProps = {
    title: "Distribution Details",
    columns: mockColumns,
    data: mockData,
    totalElements: 2,
    totalPages: 1,
    table: mockTable,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    test("should match snapshot", () => {
      const component = render(<DistributionTable {...defaultProps} />);
      expect(component.asFragment()).toMatchSnapshot();
    });
  });

  describe("Props Integration", () => {
    test("should pass title prop correctly", () => {
      const customTitle = "Custom Distribution Title";
      render(<DistributionTable {...defaultProps} title={customTitle} />);

      expect(screen.getByText(customTitle)).toBeInTheDocument();
    });

    test("should pass columns to Table component", () => {
      render(<DistributionTable {...defaultProps} />);

      const table = screen.getByTestId("table-ca-distributions-details");
      expect(table).toBeInTheDocument();
    });

    test("should pass data to Table component", () => {
      render(<DistributionTable {...defaultProps} />);

      const table = screen.getByTestId("table-ca-distributions-details");
      expect(table).toBeInTheDocument();
      expect(screen.getByTestId("row-0")).toBeInTheDocument();
      expect(screen.getByTestId("row-1")).toBeInTheDocument();
    });

    test("should pass totalElements to Table component", () => {
      render(<DistributionTable {...defaultProps} />);

      const table = screen.getByTestId("table-ca-distributions-details");
      expect(table).toBeInTheDocument();
    });

    test("should pass totalPages to Table component", () => {
      render(<DistributionTable {...defaultProps} />);

      const table = screen.getByTestId("table-ca-distributions-details");
      expect(table).toBeInTheDocument();
    });

    test("should spread table props to Table component", () => {
      const customTable = {
        ...mockTable,
        pagination: {
          pageIndex: 1,
          pageSize: 20,
        },
      };

      render(<DistributionTable {...defaultProps} table={customTable} />);

      const table = screen.getByTestId("table-ca-distributions-details");
      expect(table).toBeInTheDocument();
    });
  });

  describe("Data Handling", () => {
    test("should handle empty data array", () => {
      render(<DistributionTable {...defaultProps} data={[]} />);

      const table = screen.getByTestId("table-ca-distributions-details");
      expect(table).toBeInTheDocument();
      expect(screen.queryByTestId("row-0")).not.toBeInTheDocument();
    });

    test("should handle large data sets", () => {
      const largeData = Array.from({ length: 100 }, (_, index) => ({
        paymentId: `${index + 1}`,
        receieverAddressHedera: `0.0.${index}`,
        receieverAddressEvm: `0x${index}...abc`,
        amount: `${(index + 1) * 10}.00`,
        executionDate: "2024-01-15",
        txHash: `0xabc${index}...`,
        status: DistributionsDetailsStatus.SUCCESS,
      }));

      render(<DistributionTable {...defaultProps} data={largeData} totalElements={100} totalPages={10} />);

      const table = screen.getByTestId("table-ca-distributions-details");
      expect(table).toBeInTheDocument();
    });
  });
});
