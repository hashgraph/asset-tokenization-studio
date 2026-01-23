// SPDX-License-Identifier: Apache-2.0

import { render } from "@/test-utils";
import { screen, waitFor } from "@testing-library/react";
import { DistributionsDetails } from "../DistributionsDetails";
import * as DistributionQueries from "../../hooks/queries/DistributionQueries";
import * as useDistributionsDetailsColumns from "../../hooks/useDistributionsDetailsColumns";
import { useNavigate } from "react-router-dom";

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  useParams: jest.fn(() => ({
    itemId: "test-distribution-id",
    id: "test-asset-id",
  })),
}));

// Mock DistributionQueries
const mockUseGetDistribution = jest.spyOn(DistributionQueries, "useGetDistribution");
const mockUseGetDistributionHolders = jest.spyOn(DistributionQueries, "useGetDistributionHolders");

// Mock useDistributionsDetailsColumns
const mockUseDistributionsDetailsColumns = jest.spyOn(useDistributionsDetailsColumns, "useDistributionsDetailsColumns");

// Mock navigate function
const mockNavigate = jest.fn();

const mockDistribution = {
  id: "test-distribution-id",
  name: "Test Distribution",
  status: "PENDING",
  totalAmount: 1000,
  executionDate: "2024-01-15T10:00:00Z",
};

const mockHoldersData = {
  queryData: [
    {
      id: "holder-1",
      batchPayout: {
        id: "payment-1",
        hederaTransactionId: "0x123456789abcdef",
      },
      holderHederaAddress: "0.0.123456",
      holderEvmAddress: "0x123456789abcdef",
      amount: 100,
      status: "PENDING",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "holder-2",
      batchPayout: {
        id: "payment-2",
        hederaTransactionId: "0xabcdef123456789",
      },
      holderHederaAddress: "0.0.234567",
      holderEvmAddress: "0xabcdef123456789",
      amount: 200,
      status: "SUCCESS",
      updatedAt: "2024-01-15T10:05:00Z",
    },
  ],
  page: {
    totalPages: 1,
    totalElements: 2,
  },
};

const mockColumns = [
  {
    id: "paymentId",
    header: "Payment ID",
    accessorKey: "paymentId",
  },
  {
    id: "receieverAddressHedera",
    header: "Receiver Address (Hedera)",
    accessorKey: "receieverAddressHedera",
  },
  {
    id: "amount",
    header: "Amount",
    accessorKey: "amount",
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

  mockUseGetDistribution.mockReturnValue({
    data: mockDistribution,
    isLoading: false,
    error: null,
    isError: false,
  } as any);

  mockUseGetDistributionHolders.mockReturnValue({
    data: mockHoldersData,
    isLoading: false,
    error: null,
    isError: false,
  } as any);

  mockUseDistributionsDetailsColumns.mockReturnValue(mockColumns);
});

describe("DistributionsDetails", () => {
  describe("Basic rendering", () => {
    it("should render correctly", () => {
      const component = render(<DistributionsDetails />);
      expect(component.asFragment()).toMatchSnapshot();
    });

    it("should render breadcrumb navigation", async () => {
      render(<DistributionsDetails />);

      await waitFor(() => {
        expect(screen.getByText("Asset list")).toBeInTheDocument();
        expect(screen.getByText("Assets details")).toBeInTheDocument();
        expect(screen.getByText("Distribution details")).toBeInTheDocument();
      });
    });
  });

  describe("Data fetching", () => {
    it("should fetch distribution data with correct parameters", () => {
      render(<DistributionsDetails />);

      expect(mockUseGetDistribution).toHaveBeenCalledWith("test-distribution-id");
    });

    it("should fetch distribution holders with pagination parameters", () => {
      render(<DistributionsDetails />);

      expect(mockUseGetDistributionHolders).toHaveBeenCalledWith({
        distributionId: "test-distribution-id",
        page: 0,
        size: 8,
      });
    });
  });
});
