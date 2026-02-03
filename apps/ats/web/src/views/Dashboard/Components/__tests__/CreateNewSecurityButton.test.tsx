// SPDX-License-Identifier: Apache-2.0

import { CreateNewSecurityButton } from "../CreateNewSecurityButton";
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

describe(`${CreateNewSecurityButton.name}`, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("render correctly", () => {
    const component = render(<CreateNewSecurityButton />);

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("if click on button then redirect to Create Security page", async () => {
    const component = render(<CreateNewSecurityButton />);

    const button = component.getByTestId("create-new-security-button");
    userEvent.click(button);

    await waitFor(() => {
      expect(RouterManager.getUrl).toHaveBeenCalledTimes(1);
      expect(RouterManager.getUrl).toHaveBeenCalledWith(RouteName.CreateSecurity);
    });
  });
});
