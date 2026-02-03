// SPDX-License-Identifier: Apache-2.0

import userEvent from "@testing-library/user-event";
import { AssetHeader } from "../components/AssetHeader";
import { RouterManager } from "@/router/RouterManager";
import { RouteName } from "@/router/RouteName";
import { render } from "@/test-utils";

describe("AssetHeader", () => {
  const mockRouterTo = RouterManager.to as jest.MockedFunction<typeof RouterManager.to>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render correctly", () => {
      const component = render(<AssetHeader />);
      expect(component.asFragment()).toMatchSnapshot();
    });

    it("should render the header with title", () => {
      const component = render(<AssetHeader />);

      expect(component.getAllByText("Import Asset")[0]).toBeInTheDocument();
    });

    it("should render the import asset button", () => {
      const component = render(<AssetHeader />);

      expect(component.getAllByRole("button", { name: "Import Asset" })[0]).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should navigate to ImportAsset when button is clicked", async () => {
      const user = userEvent.setup();
      const component = render(<AssetHeader />);

      const importButton = component.getByRole("button", {
        name: "Import Asset",
      });
      await user.click(importButton);

      expect(mockRouterTo).toHaveBeenCalledWith(RouteName.ImportAsset);
    });

    it("should handle multiple button clicks", async () => {
      const user = userEvent.setup();
      const component = render(<AssetHeader />);

      const importButton = component.getByRole("button", {
        name: "Import Asset",
      });

      await user.click(importButton);
      await user.click(importButton);

      expect(mockRouterTo).toHaveBeenCalledTimes(2);
      expect(mockRouterTo).toHaveBeenNthCalledWith(1, RouteName.ImportAsset);
      expect(mockRouterTo).toHaveBeenNthCalledWith(2, RouteName.ImportAsset);
    });
  });
});
