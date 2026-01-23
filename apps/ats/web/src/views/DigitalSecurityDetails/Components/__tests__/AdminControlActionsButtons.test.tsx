// SPDX-License-Identifier: Apache-2.0

import { render } from "../../../../test-utils";
import { useRolesStore } from "../../../../store/rolesStore";
import { SecurityRole } from "../../../../utils/SecurityRole";
import { AdminControlActionsButtons } from "../AdminControlActionsButtons";

jest.mock("../../../../router/RouterManager", () => ({
  RouterManager: {
    ...jest.requireActual("../../../../router/RouterManager").RouterManager,
    getUrl: jest.fn(),
    to: jest.fn(),
  },
}));

jest.mock("../../../../hooks/queries/usePauseSecurity", () => ({
  usePauseSecurity: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
  })),
}));

jest.mock("../../../../hooks/queries/useUnpauseSecurity", () => ({
  useUnpauseSecurity: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false,
  })),
}));

const defaultAdminRole = [SecurityRole._DEFAULT_ADMIN_ROLE];
const initialStoreState = useRolesStore.getState();

describe(`${AdminControlActionsButtons.name}`, () => {
  beforeEach(() => {
    useRolesStore.setState(initialStoreState, true);
    jest.clearAllMocks();
  });

  const factoryComponent = () => render(<AdminControlActionsButtons />);

  test("should render correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot("defaultAdminRole");
  });

  test("by default admin has not freeze manager role", () => {
    const component = factoryComponent();

    expect(component.queryByTestId("freeze-button")).not.toBeInTheDocument();
  });

  describe("Admin has freeze manager role", () => {
    beforeEach(() => {
      useRolesStore.setState({
        ...initialStoreState,
        roles: [...defaultAdminRole, SecurityRole._FREEZE_MANAGER_ROLE],
      });
    });

    test("should render correctly", () => {
      const component = factoryComponent();

      expect(component.asFragment()).toMatchSnapshot("minterRole");
    });

    test("should show freeze manager button", () => {
      const component = factoryComponent();

      expect(component.getByTestId("freeze-button")).toBeInTheDocument();
    });
  });
});
