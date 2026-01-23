// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck
/**
 * @deprecated This test is not currently used. Kept for potential future usage.
 */

import { render } from "@/test-utils";
import { screen } from "@testing-library/react";
import { DistributionBasicInformation } from "../DistributionBasicInformation";

const mockDistributionData = {
  distributionId: "DIST-123456",
  actionType: "Token Distribution",
  executionDate: "2024-01-15T10:30:00Z",
  totalAmount: "1000.50 HBAR",
  batchCount: 5,
  holders: 150,
};

describe.skip("DistributionBasicInformation", () => {
  it("renders correctly with distribution data", () => {
    render(<DistributionBasicInformation distributionData={mockDistributionData} isLoading={false} />);

    expect(screen.getByText("DIST-123456")).toBeInTheDocument();
    expect(screen.getByText("Token Distribution")).toBeInTheDocument();
    expect(screen.getByText("2024-01-15T10:30:00Z")).toBeInTheDocument();
    expect(screen.getByText("1000.50 HBAR")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();
  });

  it("renders correctly when loading", () => {
    const { container } = render(
      <DistributionBasicInformation distributionData={mockDistributionData} isLoading={true} />,
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders correctly with null distribution data", () => {
    const { container } = render(<DistributionBasicInformation distributionData={null} isLoading={false} />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders correctly with partial distribution data", () => {
    const partialData = {
      distributionId: "DIST-789",
      actionType: "",
      executionDate: "2024-02-01T14:00:00Z",
      totalAmount: "",
      batchCount: 0,
      holders: 0,
    };

    render(<DistributionBasicInformation distributionData={partialData} isLoading={false} />);

    expect(screen.getByText("DIST-789")).toBeInTheDocument();
    expect(screen.getByText("2024-02-01T14:00:00Z")).toBeInTheDocument();
    const zeroElements = screen.getAllByText("0");
    expect(zeroElements.length).toBeGreaterThan(0);
  });

  it("handles undefined values correctly", () => {
    const dataWithUndefined = {
      distributionId: "DIST-999",
      actionType: "NFT Distribution",
      executionDate: "2024-03-01T09:00:00Z",
      totalAmount: "500 HBAR",
      batchCount: undefined as any,
      holders: undefined as any,
    };

    render(<DistributionBasicInformation distributionData={dataWithUndefined} isLoading={false} />);

    expect(screen.getByText("DIST-999")).toBeInTheDocument();
    expect(screen.getByText("NFT Distribution")).toBeInTheDocument();
    expect(screen.getByText("2024-03-01T09:00:00Z")).toBeInTheDocument();
    expect(screen.getByText("500 HBAR")).toBeInTheDocument();
  });

  it("applies correct styling classes", () => {
    const { container } = render(
      <DistributionBasicInformation distributionData={mockDistributionData} isLoading={false} />,
    );

    const boxElement = container.firstChild as HTMLElement;
    expect(boxElement).toHaveAttribute("class");
    expect(boxElement.className).toBeTruthy();
  });
});
