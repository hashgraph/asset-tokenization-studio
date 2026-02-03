// SPDX-License-Identifier: Apache-2.0

import { screen } from "@testing-library/react";
import { AssetHeader } from "../components/AssetHeader";
import type { Asset } from "@/services/AssetService";
import { AssetType } from "@/services/AssetService";
import type { BreadcrumbItem } from "@/hooks/useBreadcrumbs";
import { Link as RouterLink } from "react-router-dom";
import { render } from "@/test-utils";

describe("AssetHeader", () => {
  const mockAsset: Asset = {
    id: "1",
    name: "Test Asset",
    hederaTokenAddress: "0x123456789",
    type: AssetType.EQUITY,
    symbol: "TST",
    evmTokenAddress: "0x123456789",
    lifeCycleCashFlowEvmAddress: "0x123456789",
    isPaused: false,
    syncEnabled: true,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  };

  const mockRoutes: BreadcrumbItem[] = [
    {
      label: "Home",
      link: { as: RouterLink, to: "/" },
      isActive: false,
    },
    {
      label: "Assets",
      link: { as: RouterLink, to: "/assets" },
      isActive: false,
    },
    {
      label: "Asset Detail",
      link: { as: RouterLink, to: "/assets/1" },
      isActive: true,
    },
  ];

  const defaultProps = {
    asset: mockAsset,
    routes: mockRoutes,
    isPaused: false,
  };

  it("should match snapshot", () => {
    const component = render(<AssetHeader {...defaultProps} />);
    expect(component.asFragment()).toMatchSnapshot();
  });

  it("should render go back button with correct label", () => {
    render(<AssetHeader {...defaultProps} />);

    const goBackButton = screen.getByTestId("go-back-button");
    expect(goBackButton).toBeInTheDocument();
    expect(goBackButton).toHaveTextContent(`${mockAsset.name} - ${mockAsset.hederaTokenAddress}`);
  });

  it("should render distributions status label", () => {
    render(<AssetHeader {...defaultProps} />);

    expect(screen.getByText("Distributions status:")).toBeInTheDocument();
  });
});
