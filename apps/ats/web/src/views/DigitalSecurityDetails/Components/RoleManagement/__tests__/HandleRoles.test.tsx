// SPDX-License-Identifier: Apache-2.0

import { HandleRoles } from "../HandleRoles";
import { render } from "../../../../../test-utils";
import { screen, waitFor } from "@testing-library/react";
import { useApplyRoles } from "../../../../../hooks/queries/useApplyRoles";
import { useSecurityStore } from "../../../../../store/securityStore";
import userEvent from "@testing-library/user-event";
import type { UserEvent } from "@testing-library/user-event";
import { rolesList } from "../rolesList";

// Mock dependencies
jest.mock("../../../../../hooks/queries/useApplyRoles");
jest.mock("../../../../../store/securityStore");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "0.0.123456" }),
}));

const mockUseApplyRoles = useApplyRoles as jest.MockedFunction<typeof useApplyRoles>;
const mockUseSecurityStore = useSecurityStore as jest.MockedFunction<typeof useSecurityStore>;

const ALL_BOND_ROLES = rolesList.filter((role) => role.allowedSecurities.includes("BOND")).map((role) => role.label);

describe("HandleRoles - Select All Roles", () => {
  const mockAddress = "0.0.654321";
  const mockApplyRoles = jest.fn();
  let user: UserEvent;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();

    mockUseApplyRoles.mockReturnValue({
      mutate: mockApplyRoles,
      mutateAsync: jest.fn(),
      reset: jest.fn(),
      isLoading: false,
      isPending: false,
      isSuccess: false,
      isError: false,
      isIdle: true,
      isPaused: false,
      status: "idle",
      data: undefined,
      error: null,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      variables: undefined,
    } as ReturnType<typeof useApplyRoles>);

    mockUseSecurityStore.mockReturnValue({
      details: {
        type: "BOND",
      },
    } as ReturnType<typeof useSecurityStore>);
  });

  describe("when not all roles are selected", () => {
    it("should select all roles when clicking 'Select all roles' checkbox", async () => {
      const currentRoles = ["admin", "minter"];

      render(<HandleRoles currentRoles={currentRoles} address={mockAddress} />);

      const selectAllCheckbox = screen.getByRole("checkbox", { name: /select all roles/i });

      expect(selectAllCheckbox).not.toBeChecked();

      await user.click(selectAllCheckbox);

      await waitFor(() => {
        const allCheckboxes = screen.getAllByRole("checkbox");
        const roleCheckboxes = allCheckboxes.filter((cb) => cb.id !== "selectAllRoles");

        roleCheckboxes.forEach((checkbox) => {
          expect(checkbox).toBeChecked();
        });
      });
    });

    it("should select all roles when clicking the text label", async () => {
      const currentRoles = ["admin"];

      render(<HandleRoles currentRoles={currentRoles} address={mockAddress} />);

      const selectAllText = screen.getByText(/select all roles/i);

      await user.click(selectAllText);

      await waitFor(() => {
        const selectAllCheckbox = screen.getByRole("checkbox", { name: /select all roles/i });
        expect(selectAllCheckbox).toBeChecked();
      });
    });
  });

  describe("when all roles are selected", () => {
    it("should deselect all roles when current roles match all available roles", async () => {
      render(<HandleRoles currentRoles={[...ALL_BOND_ROLES]} address={mockAddress} />);

      const selectAllCheckbox = screen.getByRole("checkbox", { name: /select all roles/i });

      expect(selectAllCheckbox).toBeChecked();

      await user.click(selectAllCheckbox);

      await waitFor(() => {
        expect(selectAllCheckbox).not.toBeChecked();

        const allCheckboxes = screen.getAllByRole("checkbox");
        const roleCheckboxes = allCheckboxes.filter((cb) => cb.id !== "selectAllRoles");

        roleCheckboxes.forEach((checkbox) => {
          expect(checkbox).not.toBeChecked();
        });
      });
    });
  });

  describe("when starting with only admin role", () => {
    it("should select all roles on first click", async () => {
      const currentRoles = ["admin"];

      render(<HandleRoles currentRoles={currentRoles} address={mockAddress} />);

      const selectAllCheckbox = screen.getByRole("checkbox", { name: /select all roles/i });

      expect(selectAllCheckbox).not.toBeChecked();

      await user.click(selectAllCheckbox);

      await waitFor(() => {
        expect(selectAllCheckbox).toBeChecked();

        const allCheckboxes = screen.getAllByRole("checkbox");
        const roleCheckboxes = allCheckboxes.filter((cb) => cb.id !== "selectAllRoles");

        roleCheckboxes.forEach((checkbox) => {
          expect(checkbox).toBeChecked();
        });
      });
    });
  });

  describe("when starting with empty roles", () => {
    it("should select all roles when clicking 'Select all roles'", async () => {
      const currentRoles: string[] = [];

      render(<HandleRoles currentRoles={currentRoles} address={mockAddress} />);

      const selectAllCheckbox = screen.getByRole("checkbox", { name: /select all roles/i });

      expect(selectAllCheckbox).not.toBeChecked();

      await user.click(selectAllCheckbox);

      await waitFor(() => {
        expect(selectAllCheckbox).toBeChecked();

        const allCheckboxes = screen.getAllByRole("checkbox");
        const roleCheckboxes = allCheckboxes.filter((cb) => cb.id !== "selectAllRoles");

        roleCheckboxes.forEach((checkbox) => {
          expect(checkbox).toBeChecked();
        });
      });
    });

    it("should deselect all roles when clicking again from all selected state", async () => {
      const currentRoles: string[] = [];

      render(<HandleRoles currentRoles={currentRoles} address={mockAddress} />);

      const selectAllCheckbox = screen.getByRole("checkbox", { name: /select all roles/i });

      await user.click(selectAllCheckbox);

      await waitFor(() => {
        expect(selectAllCheckbox).toBeChecked();
      });

      await user.click(selectAllCheckbox);

      await waitFor(() => {
        expect(selectAllCheckbox).not.toBeChecked();

        const allCheckboxes = screen.getAllByRole("checkbox");
        const roleCheckboxes = allCheckboxes.filter((cb) => cb.id !== "selectAllRoles");

        roleCheckboxes.forEach((checkbox) => {
          expect(checkbox).not.toBeChecked();
        });
      });
    });
  });
});
