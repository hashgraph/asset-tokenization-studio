import { AdminActionsButtons } from "../AdminActionsButtons";
import { render } from "../../../../test-utils";
import { useRolesStore } from "../../../../store/rolesStore";
import { SecurityRole } from "../../../../utils/SecurityRole";
import userEvent from "@testing-library/user-event";
import { RouterManager } from "../../../../router/RouterManager";
import { RouteName } from "../../../../router/RouteName";
import { waitFor } from "@testing-library/react";
import { usePauseSecurity } from "../../../../hooks/queries/usePauseSecurity";
import { useUnpauseSecurity } from "../../../../hooks/queries/useUnpauseSecurity";

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

describe(`${AdminActionsButtons.name}`, () => {
  beforeEach(() => {
    useRolesStore.setState(initialStoreState, true);
    jest.clearAllMocks();
  });

  const factoryComponent = () => render(<AdminActionsButtons />);

  test("should render correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot("defaultAdminRole");
  });

  test("by default admin has not minter role", () => {
    const component = factoryComponent();

    expect(component.queryByTestId("mint-button")).not.toBeInTheDocument();
  });

  test("by default admin has not controller role", () => {
    const component = factoryComponent();

    expect(
      component.queryByTestId("force-transfer-button"),
    ).not.toBeInTheDocument();
    expect(
      component.queryByTestId("force-redeem-button"),
    ).not.toBeInTheDocument();
  });

  test("by default admin has not pauser role", () => {
    const component = factoryComponent();

    expect(component.queryByTestId("pauser-button")).not.toBeInTheDocument();
  });

  describe("Admin has minter role", () => {
    beforeEach(() => {
      useRolesStore.setState({
        ...initialStoreState,
        roles: [...defaultAdminRole, SecurityRole._ISSUER_ROLE],
      });
    });

    test("should render correctly", () => {
      const component = factoryComponent();

      expect(component.asFragment()).toMatchSnapshot("minterRole");
    });

    test("should show mint button", () => {
      const component = factoryComponent();

      expect(component.getByTestId("mint-button")).toBeInTheDocument();
    });

    test("if click on mint button should redirect to mint page", async () => {
      const component = factoryComponent();

      const button = component.getByTestId("mint-button");
      expect(button).toBeInTheDocument();

      await userEvent.click(button);

      expect(RouterManager.getUrl).toHaveBeenCalled();
      expect(RouterManager.getUrl).toHaveBeenCalledWith(
        RouteName.DigitalSecurityMint,
        { params: { id: "" } },
      );
    });
  });

  describe("Admin has controller role", () => {
    beforeEach(() => {
      useRolesStore.setState({
        ...initialStoreState,
        roles: [...defaultAdminRole, SecurityRole._CONTROLLER_ROLE],
      });
    });

    test("should render correctly", () => {
      const component = factoryComponent();

      expect(component.asFragment()).toMatchSnapshot("controllerRole");
    });

    test("should show force transfer and force redeem buttons", () => {
      const component = factoryComponent();

      expect(
        component.getByTestId("force-transfer-button"),
      ).toBeInTheDocument();
      expect(component.getByTestId("force-redeem-button")).toBeInTheDocument();
    });

    test("if click on force transfer button should redirect to force transfer page", async () => {
      const component = factoryComponent();

      const button = component.getByTestId("force-transfer-button");
      expect(button).toBeInTheDocument();

      await userEvent.click(button);

      expect(RouterManager.getUrl).toHaveBeenCalled();
      expect(RouterManager.getUrl).toHaveBeenCalledWith(
        RouteName.DigitalSecurityForceTransfer,
        { params: { id: "" } },
      );
    });

    test("if click on force redeem button should redirect to force redeem page", async () => {
      const component = factoryComponent();

      const dropdown = component.getByTestId("dropdown-actions-button");
      expect(dropdown).toBeInTheDocument();

      await userEvent.click(dropdown);

      await waitFor(() => {
        expect(
          component.getByTestId("dropdown-actions-menu"),
        ).toBeInTheDocument();
      });

      const button = component.getByTestId("force-redeem-button");
      expect(button).toBeInTheDocument();

      await userEvent.click(button);

      expect(RouterManager.to).toHaveBeenCalled();
      expect(RouterManager.to).toHaveBeenCalledWith(
        RouteName.DigitalSecurityForceRedeem,
        { params: { id: "" } },
      );
    });
  });

  describe("Admin has pauser role", () => {
    beforeEach(() => {
      useRolesStore.setState({
        ...initialStoreState,
        roles: [...defaultAdminRole, SecurityRole._PAUSER_ROLE],
      });
    });

    test("should render correctly", () => {
      const component = factoryComponent();

      expect(component.asFragment()).toMatchSnapshot("pauserRole");
    });

    test("should show pauser toogle", () => {
      const component = factoryComponent();

      expect(component.getByTestId("pauser-button")).toBeInTheDocument();
    });

    test("if click on pauser button should call to pause or unpause security function", async () => {
      const component = factoryComponent();

      const dropdown = component.getByTestId("dropdown-actions-button");
      expect(dropdown).toBeInTheDocument();

      await userEvent.click(dropdown);

      await waitFor(() => {
        expect(
          component.getByTestId("dropdown-actions-menu"),
        ).toBeInTheDocument();
      });

      const button = component.getByTestId("pauser-button");
      expect(button).toBeInTheDocument();

      await userEvent.click(button);

      expect(usePauseSecurity).toHaveBeenCalled();
      expect(usePauseSecurity).toHaveBeenCalledWith({
        onSettled: expect.anything(),
      });

      await userEvent.click(button);

      expect(useUnpauseSecurity).toHaveBeenCalled();
      expect(useUnpauseSecurity).toHaveBeenCalledWith({
        onSettled: expect.anything(),
      });
    });
  });
});
