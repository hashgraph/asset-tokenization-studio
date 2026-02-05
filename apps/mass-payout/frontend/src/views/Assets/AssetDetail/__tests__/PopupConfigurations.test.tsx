// SPDX-License-Identifier: Apache-2.0

import { screen, fireEvent } from "@testing-library/react";
import type { Asset } from "@/services/AssetService";
import { AssetType } from "@/services/AssetService";
import { render } from "@/test-utils";
import { PopupConfigurations } from "../components/PopupConfigurations";

// Mock io-bricks-ui components
jest.mock("io-bricks-ui", () => ({
  PopUp: jest.fn(
    ({
      id,
      isOpen,
      onClose,
      onConfirm,
      onCancel,
      icon,
      title,
      description,
      confirmText,
      cancelText,
      variant,
      confirmButtonProps,
    }) =>
      isOpen ? (
        <div data-testid={`popup-${id}`}>
          <div data-testid="popup-icon">{icon}</div>
          <div data-testid="popup-title">{title}</div>
          <div data-testid="popup-description">{description}</div>
          <button
            data-testid="popup-confirm"
            onClick={onConfirm}
            disabled={confirmButtonProps?.isLoading}
            data-loading={confirmButtonProps?.isLoading}
          >
            {confirmText}
          </button>
          <button data-testid="popup-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button data-testid="popup-close" onClick={onClose}>
            Close
          </button>
          <div data-testid="popup-variant" data-variant={variant}></div>
        </div>
      ) : null,
  ),
  PhosphorIcon: jest.fn(({ as: IconComponent, size, weight, ...props }) => (
    <div data-testid="phosphor-icon" data-size={size} data-weight={weight} {...props}>
      {IconComponent?.name || "Icon"}
    </div>
  )),
  Weight: {
    Light: "light",
  },
}));

// Mock phosphor icons
jest.mock("@phosphor-icons/react", () => ({
  Warning: { name: "Warning" },
  Info: { name: "Info" },
}));

const mockAsset: Asset = {
  id: "asset-123",
  name: "Test Asset",
  symbol: "TEST",
  type: AssetType.BOND_VARIABLE_RATE,
  hederaTokenAddress: "0.0.123456",
  evmTokenAddress: "0x1234567890abcdef",
  lifeCycleCashFlowEvmAddress: "0xabcdef1234567890",
  maturityDate: "2025-12-31",
  isPaused: false,
  syncEnabled: true,
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z",
};

const defaultProps = {
  asset: mockAsset,
  isPaused: false,
  isImportingCorporateActions: false,
  isOpen: false,
  isImportOpen: false,
  isMutationLoading: false,
  onClose: jest.fn(),
  onImportClose: jest.fn(),
  onConfirmPauseUnpause: jest.fn(),
  onConfirmImport: jest.fn(),
};

const renderPopupConfigurations = (props = {}) => {
  return render(<PopupConfigurations {...defaultProps} {...props} />);
};

describe("PopupConfigurations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should match snapshot", () => {
      const component = render(<PopupConfigurations {...defaultProps} />);
      expect(component.asFragment()).toMatchSnapshot();
    });

    it("should not render popups when both are closed", () => {
      renderPopupConfigurations();

      expect(screen.queryByTestId("popup-pauseUnpauseDistributions")).not.toBeInTheDocument();
      expect(screen.queryByTestId("popup-importCorporateActions")).not.toBeInTheDocument();
    });

    it("should render pause popup when isOpen is true and isPaused is false", () => {
      renderPopupConfigurations({ isOpen: true, isPaused: false });

      const popup = screen.getByTestId("popup-pauseUnpauseDistributions");
      expect(popup).toBeInTheDocument();
      expect(screen.getByTestId("popup-title")).toHaveTextContent("Pause Asset");
      expect(screen.getByTestId("popup-description")).toHaveTextContent("Are you sure you want to pause this asset?");
      expect(screen.getByTestId("popup-confirm")).toHaveTextContent("Pause");
      expect(screen.getByTestId("popup-cancel")).toHaveTextContent("Cancel");
    });

    it("should render unpause popup when isOpen is true and isPaused is true", () => {
      renderPopupConfigurations({ isOpen: true, isPaused: true });

      const popup = screen.getByTestId("popup-pauseUnpauseDistributions");
      expect(popup).toBeInTheDocument();
      expect(screen.getByTestId("popup-title")).toHaveTextContent("Unpause Asset");
      expect(screen.getByTestId("popup-description")).toHaveTextContent("Are you sure you want to unpause this asset?");
      expect(screen.getByTestId("popup-confirm")).toHaveTextContent("Unpause");
      expect(screen.getByTestId("popup-cancel")).toHaveTextContent("Cancel");
    });
  });

  describe("Icons and Variants", () => {
    it("should use Warning icon and warning variant for pause popup", () => {
      renderPopupConfigurations({ isOpen: true, isPaused: false });

      const icon = screen.getByTestId("popup-icon");
      const variant = screen.getByTestId("popup-variant");

      expect(icon).toHaveTextContent("Warning");
      expect(variant).toHaveAttribute("data-variant", "warning");
    });

    it("should use Info icon and info variant for unpause popup", () => {
      renderPopupConfigurations({ isOpen: true, isPaused: true });

      const icon = screen.getByTestId("popup-icon");
      const variant = screen.getByTestId("popup-variant");

      expect(icon).toHaveTextContent("Info");
      expect(variant).toHaveAttribute("data-variant", "info");
    });

    it("should use Info icon and info variant for import corporate actions popup", () => {
      renderPopupConfigurations({ isImportOpen: true });

      const icon = screen.getByTestId("popup-icon");
      const variant = screen.getByTestId("popup-variant");

      expect(icon).toHaveTextContent("Info");
      expect(variant).toHaveAttribute("data-variant", "info");
    });
  });

  describe("User Interactions", () => {
    it("should call onConfirmPauseUnpause when pause popup confirm is clicked", () => {
      const onConfirmPauseUnpause = jest.fn();
      renderPopupConfigurations({ isOpen: true, onConfirmPauseUnpause });

      fireEvent.click(screen.getByTestId("popup-confirm"));

      expect(onConfirmPauseUnpause).toHaveBeenCalledTimes(1);
    });

    it("should call onClose when pause popup cancel is clicked", () => {
      const onClose = jest.fn();
      renderPopupConfigurations({ isOpen: true, onClose });

      fireEvent.click(screen.getByTestId("popup-cancel"));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose when pause popup close is clicked", () => {
      const onClose = jest.fn();
      renderPopupConfigurations({ isOpen: true, onClose });

      fireEvent.click(screen.getByTestId("popup-close"));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should call onConfirmImport when import popup confirm is clicked", () => {
      const onConfirmImport = jest.fn();
      renderPopupConfigurations({ isImportOpen: true, onConfirmImport });

      fireEvent.click(screen.getByTestId("popup-confirm"));

      expect(onConfirmImport).toHaveBeenCalledTimes(1);
    });

    it("should call onImportClose when import popup cancel is clicked", () => {
      const onImportClose = jest.fn();
      renderPopupConfigurations({ isImportOpen: true, onImportClose });

      fireEvent.click(screen.getByTestId("popup-cancel"));

      expect(onImportClose).toHaveBeenCalledTimes(1);
    });

    it("should call onImportClose when import popup close is clicked", () => {
      const onImportClose = jest.fn();
      renderPopupConfigurations({ isImportOpen: true, onImportClose });

      fireEvent.click(screen.getByTestId("popup-close"));

      expect(onImportClose).toHaveBeenCalledTimes(1);
    });
  });
});
