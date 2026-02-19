// SPDX-License-Identifier: Apache-2.0

import { render } from "@/test-utils";
import { screen } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { AssetType } from "@/services/AssetService";
import { mockAsset, resetAssetMocks, createMockAsset } from "@/test-utils/mocks/AssetMocks";
import { AssetDetail } from "../AssetDetail";

const mockNavigate = jest.fn();
const mockPauseMutateAsync = jest.fn();
const mockUnpauseMutateAsync = jest.fn();
const mockEnableSyncMutate = jest.fn();
const mockDisableSyncMutate = jest.fn();
const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "0.0.890123" }),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}));

jest.mock("../../hooks/queries/AssetQueries", () => ({
  useGetAsset: jest.fn(),
  usePauseAsset: jest.fn(),
  useUnpauseAsset: jest.fn(),
  useEnableAssetSync: jest.fn(),
  useDisableAssetSync: jest.fn(),
}));

jest.mock("@/hooks/useBreadcrumbs", () => ({
  useBreadcrumbs: () => [{ label: "Asset list", href: "/assets" }, { label: "Asset Detail" }],
}));

// Mock child components
jest.mock("../components/AssetHeader", () => ({
  AssetHeader: jest.fn(({ asset }) => (
    <div data-testid="asset-header">
      <div data-testid="asset-status">{asset?.isPaused ? "Paused" : "Active"}</div>
      {asset && (
        <div>
          {asset.name} - {asset.hederaTokenAddress}
        </div>
      )}
    </div>
  )),
}));

jest.mock("../components/TabsConfiguration", () => ({
  TabsConfiguration: jest.fn(({ asset }) => (
    <div data-testid="tabs-configuration">
      <button data-testid="pause-unpause-button">{asset?.isPaused ? "Unpause Asset" : "Pause Asset"}</button>
      <button data-testid="import-corporate-actions-button">
        {asset?.syncEnabled ? "Disable Sync" : "Enable Sync"}
      </button>
      <button data-testid="new-distribution-button">New Distribution</button>
    </div>
  )),
}));

jest.mock("../components/PopupConfigurations", () => ({
  PopupConfigurations: jest.fn(() => <div data-testid="popup-configurations">Mock Popup</div>),
}));

describe("AssetDetail Component", () => {
  let history: ReturnType<typeof createMemoryHistory>;
  const mockUseGetAsset = require("../../hooks/queries/AssetQueries").useGetAsset as jest.MockedFunction<any>;
  const mockUsePauseAsset = require("../../hooks/queries/AssetQueries").usePauseAsset as jest.MockedFunction<any>;
  const mockUseUnpauseAsset = require("../../hooks/queries/AssetQueries").useUnpauseAsset as jest.MockedFunction<any>;
  const mockUseEnableAssetSync = require("../../hooks/queries/AssetQueries")
    .useEnableAssetSync as jest.MockedFunction<any>;
  const mockUseDisableAssetSync = require("../../hooks/queries/AssetQueries")
    .useDisableAssetSync as jest.MockedFunction<any>;

  beforeEach(() => {
    history = createMemoryHistory({
      initialEntries: [`/assets/${mockAsset.id}`],
    });

    jest.clearAllMocks();
    resetAssetMocks();
    consoleSpy.mockClear();

    // Default mock implementations
    mockUseGetAsset.mockReturnValue({
      data: mockAsset,
      isLoading: false,
      error: null,
    });

    mockUsePauseAsset.mockReturnValue({
      mutateAsync: mockPauseMutateAsync,
      isPending: false,
    });

    mockUseUnpauseAsset.mockReturnValue({
      mutateAsync: mockUnpauseMutateAsync,
      isPending: false,
    });

    mockUseEnableAssetSync.mockReturnValue({
      mutate: mockEnableSyncMutate,
    });

    mockUseDisableAssetSync.mockReturnValue({
      mutate: mockDisableSyncMutate,
    });
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe("Basic rendering", () => {
    test("should render correctly", () => {
      const component = render(<AssetDetail />, { history });
      expect(component.asFragment()).toMatchSnapshot();
    });

    test("should display tabs configuration", () => {
      render(<AssetDetail />, { history });
      expect(screen.getByTestId("tabs-configuration")).toBeInTheDocument();
      expect(screen.getByTestId("pause-unpause-button")).toBeInTheDocument();
      expect(screen.getByTestId("import-corporate-actions-button")).toBeInTheDocument();
      expect(screen.getByTestId("new-distribution-button")).toBeInTheDocument();
    });

    test("should display popup configurations", () => {
      render(<AssetDetail />, { history });
      expect(screen.getByTestId("popup-configurations")).toBeInTheDocument();
    });
  });

  describe("Loading states", () => {
    test("should show loading spinner when asset is loading", () => {
      mockUseGetAsset.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<AssetDetail />, { history });
      expect(screen.getByText("Loading asset...")).toBeInTheDocument();
    });

    test("should show error message when asset loading fails", () => {
      mockUseGetAsset.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error("Failed to load asset"),
      });

      render(<AssetDetail />, { history });
      expect(screen.getByText("Error loading asset or asset not found")).toBeInTheDocument();
    });

    test("should show error message when asset is not found", () => {
      mockUseGetAsset.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      render(<AssetDetail />, { history });
      expect(screen.getByText("Error loading asset or asset not found")).toBeInTheDocument();
    });
  });

  describe("Asset status management", () => {
    test("should display active status for unpaused asset", () => {
      const activeAsset = createMockAsset({ isPaused: false });
      mockUseGetAsset.mockReturnValue({
        data: activeAsset,
        isLoading: false,
        error: null,
      });

      render(<AssetDetail />, { history });
      expect(screen.getByTestId("asset-status")).toHaveTextContent("Active");
      expect(screen.getByTestId("pause-unpause-button")).toHaveTextContent("Pause Asset");
    });

    test("should display paused status for paused asset", () => {
      const pausedAsset = createMockAsset({ isPaused: true });
      mockUseGetAsset.mockReturnValue({
        data: pausedAsset,
        isLoading: false,
        error: null,
      });

      render(<AssetDetail />, { history });
      expect(screen.getByTestId("asset-status")).toHaveTextContent("Paused");
      expect(screen.getByTestId("pause-unpause-button")).toHaveTextContent("Unpause Asset");
    });

    test("should render pause/unpause button", () => {
      render(<AssetDetail />, { history });
      expect(screen.getByTestId("pause-unpause-button")).toBeInTheDocument();
    });
  });

  describe("Sync management", () => {
    test("should display correct sync button text for enabled sync", () => {
      const syncEnabledAsset = createMockAsset({ syncEnabled: true });
      mockUseGetAsset.mockReturnValue({
        data: syncEnabledAsset,
        isLoading: false,
        error: null,
      });

      render(<AssetDetail />, { history });
      expect(screen.getByTestId("import-corporate-actions-button")).toHaveTextContent("Disable Sync");
    });

    test("should display correct sync button text for disabled sync", () => {
      const syncDisabledAsset = createMockAsset({ syncEnabled: false });
      mockUseGetAsset.mockReturnValue({
        data: syncDisabledAsset,
        isLoading: false,
        error: null,
      });

      render(<AssetDetail />, { history });
      expect(screen.getByTestId("import-corporate-actions-button")).toHaveTextContent("Enable Sync");
    });

    test("should render import corporate actions button", () => {
      render(<AssetDetail />, { history });
      expect(screen.getByTestId("import-corporate-actions-button")).toBeInTheDocument();
    });
  });

  describe("Navigation and tabs", () => {
    test("should render new distribution button", () => {
      render(<AssetDetail />, { history });
      expect(screen.getByTestId("new-distribution-button")).toBeInTheDocument();
    });
  });

  describe("Asset data integration", () => {
    test("should handle different asset types", () => {
      const bondAsset = createMockAsset({
        type: AssetType.BOND_VARIABLE_RATE,
        name: "Bond Asset",
        symbol: "BOND",
      });

      mockUseGetAsset.mockReturnValue({
        data: bondAsset,
        isLoading: false,
        error: null,
      });

      render(<AssetDetail />, { history });

      expect(screen.getByText(`${bondAsset.name} - ${bondAsset.hederaTokenAddress}`)).toBeInTheDocument();
    });

    test("should handle asset without ID correctly", () => {
      const assetWithoutId = createMockAsset({ id: "" });
      mockUseGetAsset.mockReturnValue({
        data: assetWithoutId,
        isLoading: false,
        error: null,
      });

      render(<AssetDetail />, { history });

      expect(screen.getByTestId("asset-header")).toBeInTheDocument();
    });

    test("should update state when asset data changes", () => {
      const { rerender } = render(<AssetDetail />, { history });

      // Initially active
      expect(screen.getByTestId("asset-status")).toHaveTextContent("Active");

      // Update to paused asset
      const pausedAsset = createMockAsset({ isPaused: true });
      mockUseGetAsset.mockReturnValue({
        data: pausedAsset,
        isLoading: false,
        error: null,
      });

      rerender(<AssetDetail />);

      expect(screen.getByTestId("asset-status")).toHaveTextContent("Paused");
    });
  });
});
