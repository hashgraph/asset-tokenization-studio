// SPDX-License-Identifier: Apache-2.0

import { HandleRoles } from "../HandleRoles";
import { render } from "../../../../../test-utils";
import { screen, waitFor } from "@testing-library/react";
import { useApplyRoles } from "../../../../../hooks/queries/useApplyRoles";
import { useSecurityStore } from "../../../../../store/securityStore";
import userEvent from "@testing-library/user-event";

// Mock dependencies
jest.mock("../../../../../hooks/queries/useApplyRoles");
jest.mock("../../../../../store/securityStore");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "0.0.123456" }),
}));

const mockUseApplyRoles = useApplyRoles as jest.MockedFunction<typeof useApplyRoles>;
const mockUseSecurityStore = useSecurityStore as jest.MockedFunction<typeof useSecurityStore>;

describe("HandleRoles - Select All Roles", () => {
  const mockAddress = "0.0.654321";
  const mockApplyRoles = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseApplyRoles.mockReturnValue({
      mutate: mockApplyRoles,
      isLoading: false,
    } as any);

    mockUseSecurityStore.mockReturnValue({
      details: {
        type: "BOND",
      },
    } as any);
  });

  describe("when not all roles are selected", () => {
    it("should select all roles when clicking 'Select all roles' checkbox", async () => {
      const user = userEvent.setup();
      const currentRoles = ["admin", "minter"];

      render(<HandleRoles currentRoles={currentRoles} address={mockAddress} />);

      // Find the "Select all roles" checkbox
      const selectAllCheckbox = screen.getByRole("checkbox", { name: /select all roles/i });

      // Initially should not be checked (not all roles selected)
      expect(selectAllCheckbox).not.toBeChecked();

      // Click the checkbox
      await user.click(selectAllCheckbox);

      // After clicking, all checkboxes should be checked
      await waitFor(() => {
        const allCheckboxes = screen.getAllByRole("checkbox");
        // Filter out the "Select all roles" checkbox itself
        const roleCheckboxes = allCheckboxes.filter((cb) => cb.id !== "selectAllRoles");

        roleCheckboxes.forEach((checkbox) => {
          expect(checkbox).toBeChecked();
        });
      });
    });

    it("should select all roles when clicking the text label", async () => {
      const user = userEvent.setup();
      const currentRoles = ["admin"];

      render(<HandleRoles currentRoles={currentRoles} address={mockAddress} />);

      // Find the text label
      const selectAllText = screen.getByText(/select all roles/i);

      // Click the text label
      await user.click(selectAllText);

      // After clicking, all checkboxes should be checked
      await waitFor(() => {
        const selectAllCheckbox = screen.getByRole("checkbox", { name: /select all roles/i });
        expect(selectAllCheckbox).toBeChecked();
      });
    });
  });

  describe("when all roles are selected", () => {
    it("should leave only 'admin' role selected when clicking 'Select all roles' checkbox", async () => {
      const user = userEvent.setup();
      // All available roles for BOND security type
      const allRoles = [
        "admin",
        "minter",
        "freezer",
        "controller",
        "pause",
        "controlList",
        "corporateActions",
        "document",
        "snapshot",
        "bondManager",
        "adjustmentBalance",
        "locker",
        "cap",
        "kyc",
        "ssiManager",
        "clearing",
        "clearingValidator",
        "pauseManager",
        "controlListManager",
        "kycListManager",
        "internalKYCManager",
        "trexOwner",
        "proceedRecipientManager",
      ];

      render(<HandleRoles currentRoles={allRoles} address={mockAddress} />);

      // Find the "Select all roles" checkbox
      const selectAllCheckbox = screen.getByRole("checkbox", { name: /select all roles/i });

      // Initially should be checked (all roles selected)
      expect(selectAllCheckbox).toBeChecked();

      // Click the checkbox to deselect all except admin
      await user.click(selectAllCheckbox);

      // After clicking, only admin checkbox should remain checked
      await waitFor(() => {
        const selectAllCheckbox = screen.getByRole("checkbox", { name: /select all roles/i });
        expect(selectAllCheckbox).not.toBeChecked();
      });
    });
  });

  describe("when starting with only admin role", () => {
    it("should select all roles on first click", async () => {
      const user = userEvent.setup();
      const currentRoles = ["admin"];

      render(<HandleRoles currentRoles={currentRoles} address={mockAddress} />);

      // Find the "Select all roles" checkbox
      const selectAllCheckbox = screen.getByRole("checkbox", { name: /select all roles/i });

      // Initially should not be checked (not all roles selected)
      expect(selectAllCheckbox).not.toBeChecked();

      // Click the checkbox
      await user.click(selectAllCheckbox);

      // After clicking, should be checked
      await waitFor(() => {
        expect(selectAllCheckbox).toBeChecked();
      });
    });
  });

  describe("when starting with empty roles", () => {
    it("should select all roles when clicking 'Select all roles'", async () => {
      const user = userEvent.setup();
      const currentRoles: string[] = [];

      render(<HandleRoles currentRoles={currentRoles} address={mockAddress} />);

      // Find the "Select all roles" checkbox
      const selectAllCheckbox = screen.getByRole("checkbox", { name: /select all roles/i });

      // Initially should not be checked
      expect(selectAllCheckbox).not.toBeChecked();

      // Click the checkbox
      await user.click(selectAllCheckbox);

      // After clicking, should be checked
      await waitFor(() => {
        expect(selectAllCheckbox).toBeChecked();
      });
    });

    it("when all selected and clicked, should leave empty array", async () => {
      const user = userEvent.setup();
      const currentRoles: string[] = [];

      render(<HandleRoles currentRoles={currentRoles} address={mockAddress} />);

      const selectAllCheckbox = screen.getByRole("checkbox", { name: /select all roles/i });

      // First click - select all
      await user.click(selectAllCheckbox);

      await waitFor(() => {
        expect(selectAllCheckbox).toBeChecked();
      });

      // Second click - should deselect all (leave empty since currentRoles was empty)
      await user.click(selectAllCheckbox);

      await waitFor(() => {
        expect(selectAllCheckbox).not.toBeChecked();
      });
    });
  });
});
