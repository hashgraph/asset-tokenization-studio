import { HolderActionsButtons } from "../HolderActionsButtons";
import { render } from "../../../../test-utils";
import userEvent from "@testing-library/user-event";
import { RouteName } from "../../../../router/RouteName";
import { RouterManager } from "../../../../router/RouterManager";

jest.mock("../../../../router/RouterManager", () => ({
  RouterManager: {
    ...jest.requireActual("../../../../router/RouterManager").RouterManager,
    getUrl: jest.fn(),
  },
}));

describe(`${HolderActionsButtons}.name`, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const factoryComponent = () => render(<HolderActionsButtons />);

  test("should render correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("should have a transfer button", () => {
    const component = factoryComponent();

    expect(component.getByTestId("transfer-button")).toBeInTheDocument();
  });

  test("transfer button should redirect to transfer page", async () => {
    const component = factoryComponent();

    const button = component.getByTestId("transfer-button");
    await userEvent.click(button);

    expect(RouterManager.getUrl).toHaveBeenCalled();
    expect(RouterManager.getUrl).toHaveBeenCalledWith(
      RouteName.DigitalSecurityTransfer,
      { params: { id: "" } },
    );
  });

  test("should have a redeem button", () => {
    const component = factoryComponent();

    expect(component.getByTestId("redeem-button")).toBeInTheDocument();
  });

  test("redeem button should redirect to redeem page", async () => {
    const component = factoryComponent();

    const button = component.getByTestId("redeem-button");
    await userEvent.click(button);

    expect(RouterManager.getUrl).toHaveBeenCalled();
    expect(RouterManager.getUrl).toHaveBeenCalledWith(
      RouteName.DigitalSecurityRedeem,
      { params: { id: "" } },
    );
  });
});
