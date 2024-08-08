import { AddSecurityButton } from "../AddSecurityButton";
import { render } from "../../../../test-utils";
import userEvent from "@testing-library/user-event";
import { RouterManager } from "../../../../router/RouterManager";
import { RouteName } from "../../../../router/RouteName";
import { waitFor } from "@testing-library/react";

jest.mock("../../../../router/RouterManager", () => ({
  RouterManager: {
    ...jest.requireActual("../../../../router/RouterManager").RouterManager,
    getUrl: jest.fn(),
  },
}));

describe(`${AddSecurityButton.name}`, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("render correctly", () => {
    const component = render(<AddSecurityButton />);

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("if click on button then redirect to Add Security page", async () => {
    const component = render(<AddSecurityButton />);

    const button = component.getByTestId("add-security-button");
    userEvent.click(button);

    await waitFor(() => {
      expect(RouterManager.getUrl).toHaveBeenCalledTimes(1);
      expect(RouterManager.getUrl).toHaveBeenCalledWith(RouteName.AddSecurity);
    });
  });
});
