// SPDX-License-Identifier: Apache-2.0

import { SearchByRole } from "../SearchByRole";
import { render } from "../../../../../test-utils";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe(`${SearchByRole.name}`, () => {
  const factoryComponent = () => render(<SearchByRole />);

  test("should render correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test.only("should fill form", async () => {
    const component = factoryComponent();

    const submitButton = component.getByTestId("select-role-button");
    expect(submitButton).toBeDisabled();

    const selector = component.container.querySelector("input#role")!;
    await userEvent.click(selector);

    const adminRoleOption = component.getByText("Admin role");
    expect(adminRoleOption).toBeVisible();
    await userEvent.click(adminRoleOption);

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });

    await userEvent.click(submitButton);
  });
});
