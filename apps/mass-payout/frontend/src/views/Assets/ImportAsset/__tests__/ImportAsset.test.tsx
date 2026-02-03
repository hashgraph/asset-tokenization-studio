// SPDX-License-Identifier: Apache-2.0

import { render } from "@/test-utils";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as RouterManager from "@/router/RouterManager";
import { RouteName } from "@/router/RouteName";
import { useGetAssetMetadata, useImportAsset } from "../../hooks/queries/AssetQueries";
import { AssetType } from "@/services/AssetService";
import { ImportAsset } from "../ImportAsset";

jest.mock("@/router/RouterManager", () => ({
  RouterManager: {
    to: jest.fn(),
  },
}));

jest.mock("../../hooks/queries/AssetQueries", () => ({
  useGetAssetMetadata: jest.fn(),
  useImportAsset: jest.fn(),
}));

const mockRouterManager = RouterManager.RouterManager as jest.Mocked<typeof RouterManager.RouterManager>;
const mockUseGetAssetMetadata = useGetAssetMetadata as jest.MockedFunction<typeof useGetAssetMetadata>;
const mockUseImportAsset = useImportAsset as jest.MockedFunction<typeof useImportAsset>;

describe("ImportAsset Component", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();

    mockUseGetAssetMetadata.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    mockUseImportAsset.mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn().mockResolvedValue({}),
      isPending: false,
      isError: false,
      error: null,
    } as any);
  });

  describe("Basic rendering", () => {
    test("should render correctly", () => {
      const component = render(<ImportAsset />);
      expect(component.asFragment()).toMatchSnapshot();
    });

    test("should display import asset title", () => {
      render(<ImportAsset />);
      expect(screen.getByText("Import Asset")).toBeInTheDocument();
    });
    test("should show form inputs in first step", () => {
      render(<ImportAsset />);
      expect(screen.getByPlaceholderText("Enter Asset ID")).toBeInTheDocument();
      expect(screen.getByLabelText("fetch-button")).toBeInTheDocument();
    });

    test("should show navigation buttons", () => {
      render(<ImportAsset />);
      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText("Next Step")).toBeInTheDocument();
    });
  });

  describe("Form validation", () => {
    test("should disable next button when isPending is true", () => {
      mockUseGetAssetMetadata.mockReturnValue({
        data: null,
        isLoading: false,
        isPending: true,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<ImportAsset />);
      const nextButton = screen.getByText("Next Step");
      expect(nextButton).toBeDisabled();
    });

    test("should enable next button when isPending is false", async () => {
      mockUseGetAssetMetadata.mockReturnValue({
        data: null,
        isLoading: false,
        isPending: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<ImportAsset />);
      const nextButton = screen.getByText("Next Step");
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe("Navigation", () => {
    test("should navigate to next step when asset metadata is loaded", async () => {
      mockUseGetAssetMetadata.mockReturnValue({
        data: {
          hederaTokenAddress: "0.0.123456",
          name: "Test Asset",
          symbol: "TEST",
          assetType: AssetType.EQUITY,
        },
        isPending: false,
        isLoading: false,
        isError: false,
        isSuccess: true,
        error: null,
        refetch: jest.fn(),
        isFetching: false,
        isLoadingError: false,
        isRefetchError: false,
        status: "success" as const,
        fetchStatus: "idle" as const,
        dataUpdatedAt: Date.now(),
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: true,
        isFetchedAfterMount: true,
        isInitialLoading: false,
        isPlaceholderData: false,
        isPreviousData: false,
        isRefetching: false,
        isStale: false,
      } as any);

      render(<ImportAsset />);

      const assetIdInput = screen.getByPlaceholderText("Enter Asset ID");
      const nextButton = screen.getByText("Next Step");

      await user.type(assetIdInput, "0.0.123456");

      await waitFor(() => {
        expect(nextButton).not.toBeDisabled();
      });

      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText("Asset Configuration")).toBeInTheDocument();
      });
    });

    test("should navigate back to assets page when cancel is clicked", async () => {
      render(<ImportAsset />);

      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);

      expect(mockRouterManager.to).toHaveBeenCalledWith(RouteName.Assets);
    });
  });

  describe("Wizard flow", () => {
    test("should complete full wizard flow", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      mockUseGetAssetMetadata.mockReturnValue({
        data: {
          hederaTokenAddress: "0.0.123456",
          name: "Test Asset",
          symbol: "TEST",
          assetType: AssetType.EQUITY,
        },
        isPending: false,
        isLoading: false,
        isError: false,
        isSuccess: true,
        error: null,
        refetch: jest.fn(),
        isFetching: false,
        isLoadingError: false,
        isRefetchError: false,
        status: "success" as const,
        fetchStatus: "idle" as const,
        dataUpdatedAt: Date.now(),
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: true,
        isFetchedAfterMount: true,
        isInitialLoading: false,
        isPlaceholderData: false,
        isPreviousData: false,
        isRefetching: false,
        isStale: false,
      } as any);

      render(<ImportAsset />);

      const assetIdInput = screen.getByPlaceholderText("Enter Asset ID");
      const nextButton = screen.getByText("Next Step");
      await user.type(assetIdInput, "0.0.123456");
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText("Asset Configuration")).toBeInTheDocument();
      });

      expect(screen.getByText("0.0.123456")).toBeInTheDocument();

      const ImportAssetButton = screen.getByTestId("final-import-asset-button");
      await user.click(ImportAssetButton);

      expect(mockRouterManager.to).toHaveBeenCalledWith(RouteName.Assets);

      consoleSpy.mockRestore();
    });

    test("should allow navigation back from review step", async () => {
      mockUseGetAssetMetadata.mockReturnValue({
        data: {
          hederaTokenAddress: "0.0.123456",
          name: "Test Asset",
          symbol: "TEST",
          assetType: AssetType.EQUITY,
        },
        isPending: false,
        isLoading: false,
        isError: false,
        isSuccess: true,
        error: null,
        refetch: jest.fn(),
        isFetching: false,
        isLoadingError: false,
        isRefetchError: false,
        status: "success" as const,
        fetchStatus: "idle" as const,
        dataUpdatedAt: Date.now(),
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: true,
        isFetchedAfterMount: true,
        isInitialLoading: false,
        isPlaceholderData: false,
        isPreviousData: false,
        isRefetching: false,
        isStale: false,
      } as any);

      render(<ImportAsset />);

      const assetIdInput = screen.getByPlaceholderText("Enter Asset ID");
      const nextButton = screen.getByText("Next Step");

      await user.type(assetIdInput, "0.0.123456");
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText("Asset Configuration")).toBeInTheDocument();
      });

      const previousButton = screen.getByText("previousStep");
      await user.click(previousButton);

      await waitFor(() => {
        expect(screen.getByText("Asset ID")).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue("0.0.123456")).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    test("should handle special characters in assetId input", async () => {
      render(<ImportAsset />);

      const assetIdInput = screen.getByPlaceholderText("Enter Asset ID");

      await user.type(assetIdInput, "0.0.123-456");

      expect(assetIdInput).toHaveValue("0.0.123-456");
    });

    test("should handle very long assetId values", async () => {
      render(<ImportAsset />);

      const assetIdInput = screen.getByPlaceholderText("Enter Asset ID");
      const longId = "0.0." + "1".repeat(100);

      await user.type(assetIdInput, longId);
      expect(assetIdInput).toHaveValue(longId);
    });
  });
});
