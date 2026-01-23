// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck
/**
 * @deprecated This test is not currently used. Kept for potential future usage.
 */

import { render } from "@/test-utils";
import { screen } from "@testing-library/react";
import { Details } from "../Details";

jest.mock("../DistributionBasicInformation", () => ({
  DistributionBasicInformation: ({ distributionData, isLoading }: any) => (
    <div data-testid="distribution-basic-information">
      {isLoading ? "Loading basic info..." : distributionData ? "Basic Information" : "No data"}
    </div>
  ),
}));

jest.mock("../AssetDetails", () => ({
  AssetDetails: ({ distributionData, isLoading }: any) => (
    <div data-testid="asset-details">
      {isLoading ? "Loading asset details..." : distributionData ? "Asset Details" : "No asset data"}
    </div>
  ),
}));

const mockDistributionData = {
  distributionId: "0.0.123456",
  actionType: "DISTRIBUTION",
  totalAmount: "1000.00",
  batchCount: 5,
  holders: 100,
  assetId: "0.0.789012",
  lifecycleCashFlowId: "lcf-123",
  name: "Test Distribution",
  assetType: "TOKEN",
  executionDate: "2024-01-15",
  maturityDate: "2024-12-31",
};

describe.skip("Details Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic rendering", () => {
    test("should render both child components with data", () => {
      render(<Details distributionData={mockDistributionData} isLoading={false} />);

      expect(screen.getByTestId("distribution-basic-information")).toBeInTheDocument();
      expect(screen.getByTestId("asset-details")).toBeInTheDocument();
      expect(screen.getByText("Basic Information")).toBeInTheDocument();
      expect(screen.getByText("Asset Details")).toBeInTheDocument();
    });

    test("should render both child components when loading", () => {
      render(<Details distributionData={null} isLoading={true} />);

      expect(screen.getByTestId("distribution-basic-information")).toBeInTheDocument();
      expect(screen.getByTestId("asset-details")).toBeInTheDocument();
      expect(screen.getByText("Loading basic info...")).toBeInTheDocument();
      expect(screen.getByText("Loading asset details...")).toBeInTheDocument();
    });

    test("should render both child components without data", () => {
      render(<Details distributionData={null} isLoading={false} />);

      expect(screen.getByTestId("distribution-basic-information")).toBeInTheDocument();
      expect(screen.getByTestId("asset-details")).toBeInTheDocument();
      expect(screen.getByText("No data")).toBeInTheDocument();
      expect(screen.getByText("No asset data")).toBeInTheDocument();
    });
  });

  describe("Loading state", () => {
    test("should pass loading state to child components", () => {
      render(<Details distributionData={null} isLoading={true} />);

      expect(screen.getByText("Loading basic info...")).toBeInTheDocument();
      expect(screen.getByText("Loading asset details...")).toBeInTheDocument();
    });

    test("should not show loading when data is available", () => {
      render(<Details distributionData={mockDistributionData} isLoading={false} />);

      expect(screen.queryByText("Loading basic info...")).not.toBeInTheDocument();
      expect(screen.queryByText("Loading asset details...")).not.toBeInTheDocument();
    });
  });

  describe("Data handling", () => {
    test("should handle null distribution data", () => {
      render(<Details distributionData={null} isLoading={false} />);

      expect(screen.getByText("No data")).toBeInTheDocument();
      expect(screen.getByText("No asset data")).toBeInTheDocument();
    });

    test("should pass distribution data to child components", () => {
      render(<Details distributionData={mockDistributionData} isLoading={false} />);

      expect(screen.getByText("Basic Information")).toBeInTheDocument();
      expect(screen.getByText("Asset Details")).toBeInTheDocument();
    });

    test("should handle partial distribution data", () => {
      const partialData = {
        ...mockDistributionData,
        maturityDate: undefined,
      };

      render(<Details distributionData={partialData} isLoading={false} />);

      expect(screen.getByText("Basic Information")).toBeInTheDocument();
      expect(screen.getByText("Asset Details")).toBeInTheDocument();
    });
  });

  describe("Component structure", () => {
    test("should render components in HStack layout", () => {
      render(<Details distributionData={mockDistributionData} isLoading={false} />);

      const basicInfo = screen.getByTestId("distribution-basic-information");
      const assetDetails = screen.getByTestId("asset-details");

      expect(basicInfo).toBeInTheDocument();
      expect(assetDetails).toBeInTheDocument();

      expect(basicInfo.parentElement).toBe(assetDetails.parentElement);
    });
  });
});
