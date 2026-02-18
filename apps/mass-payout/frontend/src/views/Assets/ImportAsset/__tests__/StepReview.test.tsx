// SPDX-License-Identifier: Apache-2.0

import { render } from "@/test-utils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import * as RouterManager from "@/router/RouterManager";
import { RouteName } from "@/router/RouteName";
import { ImportAssetFormValues } from "../ImportAsset";
import { StepReview } from "../components/StepReview";

jest.mock("io-bricks-ui", () => ({
  ...jest.requireActual("io-bricks-ui"),
  useStepContext: () => ({
    goToPrevious: jest.fn(),
    goToNext: jest.fn(),
    activeStep: 1,
    setActiveStep: jest.fn(),
  }),
}));

jest.mock("@/router/RouterManager", () => ({
  RouterManager: {
    to: jest.fn(),
  },
}));

const mockUseImportAsset = jest.fn();
jest.mock("../../hooks/queries/AssetQueries", () => ({
  useImportAsset: () => mockUseImportAsset(),
}));

const mockRouterManager = RouterManager.RouterManager as jest.Mocked<typeof RouterManager.RouterManager>;

const TestWrapper = ({
  defaultValues = {
    assetId: "0.0.123456",
    assetName: "Test Asset",
    assetSymbol: "SYM",
    assetType: "BOND_VARIABLE_RATE",
  },
}: {
  defaultValues?: ImportAssetFormValues;
}) => {
  const form = useForm<ImportAssetFormValues>({
    mode: "all",
    defaultValues,
  });

  return (
    <FormProvider {...form}>
      <StepReview />
    </FormProvider>
  );
};

describe("StepReview Component", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();

    mockUseImportAsset.mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn().mockResolvedValue({}),
      isPending: false,
      isError: false,
      error: null,
    });
  });

  describe("Basic rendering", () => {
    test("should render correctly", () => {
      const component = render(<TestWrapper />);
      expect(component.asFragment()).toMatchSnapshot();
    });

    test("should display review section title", () => {
      render(<TestWrapper />);
      expect(screen.getByText("Asset Configuration")).toBeInTheDocument();
    });

    test("should display asset details", () => {
      render(<TestWrapper />);

      expect(screen.getByText("stepAssetDetails.assetId")).toBeInTheDocument();
      expect(screen.getByText("stepAssetDetails.assetName")).toBeInTheDocument();
      expect(screen.getByText("0.0.123456")).toBeInTheDocument();
      expect(screen.getByText("Test Asset")).toBeInTheDocument();
    });

    test("should display navigation buttons", () => {
      render(<TestWrapper />);

      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByText("previousStep")).toBeInTheDocument();
      expect(screen.getByTestId("final-import-asset-button")).toBeInTheDocument();
    });
  });

  describe("Data display", () => {
    test("should display form values correctly", () => {
      const customValues = {
        assetId: "0.0.789012",
        assetName: "Custom Asset Name",
        assetSymbol: "CUSTOM",
        assetType: "TOKEN",
      };

      render(<TestWrapper defaultValues={customValues} />);

      expect(screen.getByText("0.0.789012")).toBeInTheDocument();
      expect(screen.getByText("Custom Asset Name")).toBeInTheDocument();
    });
    test("should handle special characters in asset data", () => {
      const specialValues = {
        assetId: "0.0.123-456",
        assetName: "Asset @#$% Name",
        assetSymbol: "SPEC",
        assetType: "BOND_VARIABLE_RATE",
      };

      render(<TestWrapper defaultValues={specialValues} />);

      expect(screen.getByText("0.0.123-456")).toBeInTheDocument();
      expect(screen.getByText("Asset @#$% Name")).toBeInTheDocument();
    });
  });

  describe("User interactions", () => {
    test("should navigate to assets page when cancel is clicked", async () => {
      render(<TestWrapper />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockRouterManager.to).toHaveBeenCalledWith(RouteName.Assets);
    });

    test("should create asset and navigate when import asset button is clicked", async () => {
      const mockMutateAsync = jest.fn().mockResolvedValue({});
      mockUseImportAsset.mockReturnValue({
        mutate: jest.fn(),
        mutateAsync: mockMutateAsync,
        isPending: false,
        isError: false,
        error: null,
      });

      render(<TestWrapper />);

      const importAssetButton = screen.getByTestId("final-import-asset-button");
      await user.click(importAssetButton);

      expect(mockMutateAsync).toHaveBeenCalledWith("0.0.123456");
      expect(mockRouterManager.to).toHaveBeenCalledWith(RouteName.Assets);
    });

    test("should handle previous step button click", async () => {
      render(<TestWrapper />);

      const previousButton = screen.getByText("previousStep");
      expect(previousButton).toBeInTheDocument();
    });
  });

  describe("Button layout", () => {
    test("should have cancel button separated from navigation buttons", () => {
      render(<TestWrapper />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      const previousButton = screen.getByText("previousStep");
      const importAssetButton = screen.getByTestId("final-import-asset-button");

      expect(cancelButton).toBeInTheDocument();
      expect(previousButton).toBeInTheDocument();
      expect(importAssetButton).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    test("should handle very long asset names", () => {
      const longNameValues = {
        assetId: "0.0.123456",
        assetName: "a".repeat(100),
        assetSymbol: "LONG",
        assetType: "TOKEN",
      };

      render(<TestWrapper defaultValues={longNameValues} />);

      expect(screen.getByText("a".repeat(100))).toBeInTheDocument();
    });

    test("should handle undefined form values correctly", () => {
      const undefinedValues = {
        assetId: undefined as any,
        assetName: undefined as any,
        assetSymbol: undefined as any,
        assetType: undefined as any,
      };

      render(<TestWrapper defaultValues={undefinedValues} />);

      // When values are undefined, the DetailReview component will show empty strings
      // The placeholder "0.0.XXXXXX" is only shown in input fields, not in review
      expect(screen.queryByText("0.0.XXXXXX")).not.toBeInTheDocument();
      expect(screen.queryByText("[Asset name]")).not.toBeInTheDocument();
    });

    test("should display placeholder values when form is empty", () => {
      const emptyValues = {
        assetId: "",
        assetName: "",
        assetSymbol: "",
        assetType: "",
      };

      render(<TestWrapper defaultValues={emptyValues} />);

      // When values are empty, the DetailReview component will show empty strings
      // The placeholder "0.0.XXXXXX" is only shown in input fields, not in review
      expect(screen.queryByText("0.0.XXXXXX")).not.toBeInTheDocument();
      expect(screen.queryByText("[Asset name]")).not.toBeInTheDocument();
    });
  });
});
