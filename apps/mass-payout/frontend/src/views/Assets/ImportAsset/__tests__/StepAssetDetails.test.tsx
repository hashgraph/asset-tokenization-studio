// SPDX-License-Identifier: Apache-2.0

import { render } from "@/test-utils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import * as RouterManager from "@/router/RouterManager";
import { RouteName } from "@/router/RouteName";
import { useGetAssetMetadata } from "../../hooks/queries/AssetQueries";
import { StepAssetDetails } from "../components/StepAssetDetails";
import { ImportAssetFormValues } from "../ImportAsset";

// Mock dependencies
jest.mock("@/router/RouterManager", () => ({
  RouterManager: {
    to: jest.fn(),
  },
}));

jest.mock("../../hooks/queries/AssetQueries", () => ({
  useGetAssetMetadata: jest.fn(),
}));

const mockRouterManager = RouterManager.RouterManager as jest.Mocked<typeof RouterManager.RouterManager>;
const mockUseGetAssetMetadata = useGetAssetMetadata as jest.MockedFunction<typeof useGetAssetMetadata>;

// Test wrapper component
const TestWrapper = ({
  defaultValues = {
    assetId: "",
    assetName: "",
    assetSymbol: "",
    assetType: "",
  },
  goToNext = jest.fn(),
}: {
  defaultValues?: Partial<ImportAssetFormValues>;
  goToNext?: () => void;
}) => {
  const form = useForm<ImportAssetFormValues>({
    mode: "all",
    defaultValues,
  });

  return (
    <FormProvider {...form}>
      <StepAssetDetails goToNext={goToNext} />
    </FormProvider>
  );
};

describe("StepAssetDetails Component", () => {
  let user: ReturnType<typeof userEvent.setup>;
  const mockGoToNext = jest.fn();
  const mockRefetch = jest.fn();

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();

    // Default mock implementation
    mockUseGetAssetMetadata.mockReturnValue({
      data: null,
      isLoading: false,
      isPending: false,
      error: null,
      refetch: mockRefetch,
    } as any);
  });

  describe("Basic rendering", () => {
    test("should render correctly", () => {
      const component = render(<TestWrapper goToNext={mockGoToNext} />);
      expect(component.asFragment()).toMatchSnapshot();
    });

    test("should display title and subtitle", () => {
      render(<TestWrapper goToNext={mockGoToNext} />);

      expect(screen.getByText("Asset Details")).toBeInTheDocument();
      expect(screen.getByText("Enter the asset details")).toBeInTheDocument();
    });

    test("should display description", () => {
      render(<TestWrapper goToNext={mockGoToNext} />);

      expect(screen.getByText("Please provide the asset ID to import the asset")).toBeInTheDocument();
    });

    test("should display asset ID input field", () => {
      render(<TestWrapper goToNext={mockGoToNext} />);

      expect(screen.getByTestId("assetId")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter Asset ID")).toBeInTheDocument();
    });

    test("should display fetch button", () => {
      render(<TestWrapper goToNext={mockGoToNext} />);

      expect(screen.getByLabelText("fetch-button")).toBeInTheDocument();
    });

    test("should display navigation buttons", () => {
      render(<TestWrapper goToNext={mockGoToNext} />);

      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText("Next Step")).toBeInTheDocument();
    });
  });

  describe("Form interactions", () => {
    test("should allow typing in asset ID input", async () => {
      render(<TestWrapper goToNext={mockGoToNext} />);

      const assetIdInput = screen.getByPlaceholderText("Enter Asset ID");
      await user.type(assetIdInput, "0.0.123456");

      expect(assetIdInput).toHaveValue("0.0.123456");
    });

    test("should enable fetch button when asset ID is provided", async () => {
      render(<TestWrapper goToNext={mockGoToNext} />);

      const assetIdInput = screen.getByPlaceholderText("Enter Asset ID");
      const fetchButton = screen.getByLabelText("fetch-button");

      expect(fetchButton).toBeDisabled();

      await user.type(assetIdInput, "0.0.123456");

      expect(fetchButton).not.toBeDisabled();
    });

    test("should disable fetch button when loading", () => {
      mockUseGetAssetMetadata.mockReturnValue({
        data: null,
        isLoading: true,
        isPending: false,
        error: null,
        refetch: mockRefetch,
      } as any);

      render(<TestWrapper defaultValues={{ assetId: "0.0.123456" }} goToNext={mockGoToNext} />);

      const fetchButton = screen.getByLabelText("fetch-button");
      expect(fetchButton).toBeDisabled();
    });

    test("should call refetch when fetch button is clicked", async () => {
      render(<TestWrapper defaultValues={{ assetId: "0.0.123456" }} goToNext={mockGoToNext} />);

      const fetchButton = screen.getByLabelText("fetch-button");
      await user.click(fetchButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    test("should not call refetch when asset ID is empty", async () => {
      render(<TestWrapper goToNext={mockGoToNext} />);

      const fetchButton = screen.getByLabelText("fetch-button");
      await user.click(fetchButton);

      expect(mockRefetch).not.toHaveBeenCalled();
    });
  });

  describe("Navigation", () => {
    test("should navigate to Assets page when cancel is clicked", async () => {
      render(<TestWrapper goToNext={mockGoToNext} />);

      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);

      expect(mockRouterManager.to).toHaveBeenCalledWith(RouteName.Assets);
    });

    test("should call goToNext when Next Step is clicked", async () => {
      render(<TestWrapper goToNext={mockGoToNext} />);

      const nextButton = screen.getByText("Next Step");
      await user.click(nextButton);

      expect(mockGoToNext).toHaveBeenCalledTimes(1);
    });

    test("should disable Next Step button when isPending is true", () => {
      mockUseGetAssetMetadata.mockReturnValue({
        data: null,
        isLoading: false,
        isPending: true,
        error: null,
        refetch: mockRefetch,
      } as any);

      render(<TestWrapper goToNext={mockGoToNext} />);

      const nextButton = screen.getByText("Next Step");
      expect(nextButton).toBeDisabled();
    });
  });

  describe("Edge cases", () => {
    test("should handle special characters in asset ID", async () => {
      render(<TestWrapper goToNext={mockGoToNext} />);

      const assetIdInput = screen.getByPlaceholderText("Enter Asset ID");
      await user.type(assetIdInput, "0.0.123-456_test");

      expect(assetIdInput).toHaveValue("0.0.123-456_test");
    });

    test("should handle very long asset ID", async () => {
      render(<TestWrapper goToNext={mockGoToNext} />);

      const assetIdInput = screen.getByPlaceholderText("Enter Asset ID");
      const longId = "0.0." + "1".repeat(100);

      await user.type(assetIdInput, longId);

      expect(assetIdInput).toHaveValue(longId);
    });

    test("should handle empty asset metadata correctly", () => {
      mockUseGetAssetMetadata.mockReturnValue({
        data: null,
        isLoading: false,
        isPending: false,
        error: null,
        refetch: mockRefetch,
      } as any);

      render(<TestWrapper defaultValues={{ assetId: "0.0.123456" }} goToNext={mockGoToNext} />);

      expect(screen.queryByText("Asset Information")).not.toBeInTheDocument();
    });
  });
});
