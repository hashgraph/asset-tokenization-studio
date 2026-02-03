// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck
/**
 * @deprecated This test is not currently used. Kept for potential future usage.
 */

import { render } from "@/test-utils";
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AssetDetails } from "../AssetDetails";

const mockAssetData = {
  assetId: "ASSET-123456",
  lifecycleCashFlowId: "LIFECYCLE-789",
  maturityDate: "2024-12-31",
  name: "Test Asset",
  assetType: "Bond",
  distributionId: "DIST-123456",
  actionType: "Manual",
  totalAmount: "$100",
  batchCount: 10,
  holders: 50,
  executionDate: "01/01/2024",
};

const defaultProps = {
  distributionData: mockAssetData,
  isLoading: false,
};

const factoryComponent = (props = defaultProps) => render(<AssetDetails {...props} />);

describe.skip("AssetDetails", () => {
  describe("Rendering", () => {
    it("renders correctly with asset data", () => {
      factoryComponent();

      expect(screen.getByTestId("definition-list")).toBeInTheDocument();
      expect(screen.getByText("ASSET-123456")).toBeInTheDocument();
      expect(screen.getByText("LIFECYCLE-789")).toBeInTheDocument();
      expect(screen.getByText("2024-12-31")).toBeInTheDocument();
      expect(screen.getByText("Test Asset")).toBeInTheDocument();
      expect(screen.getByText("Bond")).toBeInTheDocument();
    });

    it("renders correctly when loading", () => {
      factoryComponent({
        ...defaultProps,
        isLoading: true,
      });

      expect(screen.getByTestId("definition-list")).toBeInTheDocument();
    });

    it("renders correctly with null asset data", () => {
      factoryComponent({
        ...defaultProps,
        distributionData: null as any,
      });

      expect(screen.getByTestId("definition-list")).toBeInTheDocument();
      expect(screen.getByTestId("definition-list-item-detail.fields.assetId")).toBeInTheDocument();
      expect(screen.getByTestId("definition-list-item-detail.fields.lifecycleCashFlowId")).toBeInTheDocument();
      expect(screen.getByTestId("definition-list-item-detail.fields.maturityDate")).toBeInTheDocument();
      expect(screen.getByTestId("definition-list-item-detail.fields.name")).toBeInTheDocument();
      expect(screen.getByTestId("definition-list-item-detail.fields.assetType")).toBeInTheDocument();
    });

    it("renders with partial data", () => {
      const partialData = {
        assetId: "ASSET-999",
        lifecycleCashFlowId: "",
        maturityDate: undefined as any,
        name: "Partial Asset",
        assetType: "",
        distributionId: "DIST-999",
        actionType: "Automatic",
        totalAmount: "$300",
        batchCount: 15,
        holders: 75,
        executionDate: "03/01/2024",
      };

      factoryComponent({
        ...defaultProps,
        distributionData: partialData,
      });

      expect(screen.getByText("ASSET-999")).toBeInTheDocument();
      expect(screen.getByText("Partial Asset")).toBeInTheDocument();
      expect(screen.getByTestId("definition-list")).toBeInTheDocument();
    });
  });

  describe("Data handling", () => {
    it("handles undefined values correctly", () => {
      const dataWithUndefined = {
        assetId: "ASSET-777",
        lifecycleCashFlowId: "LIFECYCLE-888",
        maturityDate: undefined as any,
        name: undefined as any,
        assetType: "Stock",
        distributionId: "DIST-777",
        actionType: "Manual",
        totalAmount: "$200",
        batchCount: 5,
        holders: 25,
        executionDate: "02/01/2024",
      };

      factoryComponent({
        ...defaultProps,
        distributionData: dataWithUndefined,
      });

      expect(screen.getByText("ASSET-777")).toBeInTheDocument();
      expect(screen.getByText("LIFECYCLE-888")).toBeInTheDocument();
      expect(screen.getByText("Stock")).toBeInTheDocument();
    });

    it("displays all required fields", () => {
      factoryComponent();

      const assetIdItem = screen.getByTestId("definition-list-item-detail.fields.assetId");
      const lifecycleItem = screen.getByTestId("definition-list-item-detail.fields.lifecycleCashFlowId");
      const maturityItem = screen.getByTestId("definition-list-item-detail.fields.maturityDate");
      const nameItem = screen.getByTestId("definition-list-item-detail.fields.name");
      const typeItem = screen.getByTestId("definition-list-item-detail.fields.assetType");

      expect(assetIdItem).toBeInTheDocument();
      expect(lifecycleItem).toBeInTheDocument();
      expect(maturityItem).toBeInTheDocument();
      expect(nameItem).toBeInTheDocument();
      expect(typeItem).toBeInTheDocument();
    });
  });

  describe("UI Structure", () => {
    it("applies correct styling classes", () => {
      const { container } = factoryComponent();

      const boxElement = container.firstChild as HTMLElement;
      expect(boxElement).toHaveAttribute("class");
      expect(boxElement.className).toBeTruthy();
    });

    it("renders DefinitionList with correct props", () => {
      factoryComponent();

      const definitionList = screen.getByTestId("definition-list");
      expect(definitionList).toBeInTheDocument();

      expect(definitionList.querySelector("p")).toBeInTheDocument();
    });

    it("passes isLoading prop correctly to DefinitionList", () => {
      const { rerender } = factoryComponent({
        ...defaultProps,
        isLoading: true,
      });

      expect(screen.getByTestId("definition-list")).toBeInTheDocument();

      rerender(<AssetDetails {...defaultProps} isLoading={false} />);

      expect(screen.getByTestId("definition-list")).toBeInTheDocument();
    });
  });
});
