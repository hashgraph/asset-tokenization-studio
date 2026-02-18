// SPDX-License-Identifier: Apache-2.0

import { render } from "../../../../test-utils";
import { Asset, AssetType } from "@/services/AssetService";
import { format } from "date-fns";
import { Details } from "../components/Details";

// Mock dependencies
jest.mock("date-fns", () => ({
  format: jest.fn((date: Date, formatStr: string) => {
    if (formatStr === "dd/MM/yyyy") {
      return "15/12/2025";
    }
    return date.toISOString();
  }),
}));

const mockAsset: Asset = {
  id: "1",
  name: "Test Asset",
  symbol: "TEST",
  type: AssetType.BOND_VARIABLE_RATE,
  hederaTokenAddress: "0.0.123456",
  evmTokenAddress: "0x1234567890abcdef",
  lifeCycleCashFlowHederaAddress: "0.0.789012",
  lifeCycleCashFlowEvmAddress: "0xabcdef1234567890",
  maturityDate: "2025-12-15T00:00:00Z",
  isPaused: false,
  syncEnabled: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const mockAssetWithoutOptionalFields: Asset = {
  id: "2",
  name: "Simple Asset",
  symbol: "SIMPLE",
  type: AssetType.EQUITY,
  hederaTokenAddress: "",
  evmTokenAddress: "",
  lifeCycleCashFlowHederaAddress: "",
  lifeCycleCashFlowEvmAddress: "",
  maturityDate: undefined,
  isPaused: false,
  syncEnabled: false,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("Details Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should match snapshot", () => {
      const component = render(<Details assetData={mockAsset} isLoading={false} />);
      expect(component.asFragment()).toMatchSnapshot();
    });

    it("should render the component with asset data", () => {
      const component = render(<Details assetData={mockAsset} isLoading={false} />);

      expect(component.getByText("Asset details")).toBeInTheDocument();
      expect(component.getByTestId("definition-list-item-Name")).toBeInTheDocument();
      expect(component.getByTestId("definition-list-item-Symbol")).toBeInTheDocument();
      expect(component.getByText("Test Asset")).toBeInTheDocument();
      expect(component.getByText("TEST")).toBeInTheDocument();
    });

    it("should render with loading state", () => {
      const component = render(<Details assetData={null} isLoading={true} />);
      expect(component.getByText("Asset details")).toBeInTheDocument();
    });

    it("should render without asset data", () => {
      const component = render(<Details assetData={null} isLoading={false} />);

      expect(component.getByText("Asset details")).toBeInTheDocument();

      expect(component.getByTestId("definition-list-item-Name")).toBeInTheDocument();
      expect(component.getByTestId("definition-list-item-Symbol")).toBeInTheDocument();
    });
  });

  describe("Asset Data Display", () => {
    it("should display asset name and symbol", () => {
      const component = render(<Details assetData={mockAsset} isLoading={false} />);

      expect(component.getByText("Test Asset")).toBeInTheDocument();
      expect(component.getByText("TEST")).toBeInTheDocument();
    });

    it("should display formatted maturity date when available", () => {
      const component = render(<Details assetData={mockAsset} isLoading={false} />);

      expect(format).toHaveBeenCalledWith(new Date("2025-12-15T00:00:00Z"), "dd/MM/yyyy");
      expect(component.getByText("15/12/2025")).toBeInTheDocument();
    });

    it("should not display maturity date when not available", () => {
      const component = render(<Details assetData={mockAssetWithoutOptionalFields} isLoading={false} />);

      expect(component.queryByText("Maturity Date")).not.toBeInTheDocument();
    });

    it("should display empty strings for missing addresses", () => {
      const component = render(<Details assetData={mockAssetWithoutOptionalFields} isLoading={false} />);

      expect(component.queryByTestId("clipboard-button")).not.toBeInTheDocument();
    });
  });
});
