// SPDX-License-Identifier: Apache-2.0

import { screen } from "@testing-library/react";
import type { Asset } from "@/services/AssetService";
import { AssetType } from "@/services/AssetService";
import { render } from "@/test-utils";
import { TabsConfiguration } from "../components/TabsConfiguration";

// Mock dependencies

jest.mock("io-bricks-ui", () => ({
  Tabs: ({ tabs, variant, index, onChange, ...props }: any) => (
    <div data-testid="tabs" data-variant={variant} data-index={index} data-tabs-count={tabs?.length} {...props}>
      {tabs?.map((tab: any, i: number) => (
        <div key={i} data-testid={`tab-${i}`}>
          <div data-testid={`tab-header-${i}`}>{tab.header}</div>
          <div data-testid={`tab-content-${i}`}>{tab.content}</div>
          <button data-testid={`tab-button-${i}`} onClick={() => onChange?.(i)}>
            {tab.header}
          </button>
        </div>
      ))}
    </div>
  ),
}));

jest.mock("../../AssetDistributions/AssetDistributions", () => ({
  AssetDistributions: ({
    assetId,
    isPaused,
    onPauseUnpause,
    onImportCorporateActions,
    isImportingCorporateActions,
    handleNewDistribution,
    ...props
  }: any) => (
    <div
      data-testid="asset-distributions"
      data-asset-id={assetId}
      data-is-paused={isPaused}
      data-is-importing={isImportingCorporateActions}
      {...props}
    >
      <button data-testid="pause-unpause-btn" onClick={onPauseUnpause}>
        {isPaused ? "Unpause" : "Pause"}
      </button>
      <button data-testid="import-actions-btn" onClick={onImportCorporateActions}>
        Import Actions
      </button>
      <button data-testid="new-distribution-btn" onClick={handleNewDistribution}>
        New Distribution
      </button>
    </div>
  ),
}));

jest.mock("../components/Details", () => ({
  Details: ({ assetData, isLoading, ...props }: any) => (
    <div data-testid="details" data-is-loading={isLoading} data-has-asset={!!assetData} {...props}>
      {assetData ? (
        <div data-testid="asset-data">
          <span data-testid="asset-name">{assetData.name}</span>
          <span data-testid="asset-symbol">{assetData.symbol}</span>
        </div>
      ) : (
        <div data-testid="no-asset">No asset data</div>
      )}
    </div>
  ),
}));

const mockAsset: Asset = {
  id: "asset-123",
  name: "Test Asset",
  symbol: "TST",
  type: AssetType.BOND_VARIABLE_RATE,
  hederaTokenAddress: "0x123",
  evmTokenAddress: "0x456",
  lifeCycleCashFlowEvmAddress: "0x789",
  maturityDate: "2024-12-31",
  isPaused: false,
  syncEnabled: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const defaultProps = {
  asset: mockAsset,
  isLoadingAsset: false,
  id: "asset-123",
  isPaused: false,
  isImportingCorporateActions: false,
  activeTabIndex: 0,
  onPauseUnpause: jest.fn(),
  onImportCorporateActions: jest.fn(),
  onNewDistribution: jest.fn(),
  onTabChange: jest.fn(),
};

describe("TabsConfiguration Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should match snapshot", () => {
      const component = render(<TabsConfiguration {...defaultProps} />);
      expect(component.asFragment()).toMatchSnapshot();
    });

    it("should render both tabs", () => {
      render(<TabsConfiguration {...defaultProps} />);

      expect(screen.getByTestId("tab-0")).toBeInTheDocument();
      expect(screen.getByTestId("tab-1")).toBeInTheDocument();
      expect(screen.getByTestId("tabs")).toHaveAttribute("data-tabs-count", "2");
    });

    it("should render tab headers with correct translations", () => {
      render(<TabsConfiguration {...defaultProps} />);

      expect(screen.getByTestId("tab-header-0")).toHaveTextContent("Details");
      expect(screen.getByTestId("tab-header-1")).toHaveTextContent("Distributions");
    });
  });
});
