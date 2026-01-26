// SPDX-License-Identifier: Apache-2.0

import { GobackButton, GobackButtonProps } from "../GobackButton";
import { render } from "../../test-utils";
import { RouteName } from "../../router/RouteName";
import { RouterManager } from "../../router/RouterManager";
import { RoutePath } from "../../router/RoutePath";
import userEvent from "@testing-library/user-event";
import { waitFor } from "@testing-library/react";

jest.mock("../../router/RouterManager", () => ({
  RouterManager: {
    ...jest.requireActual("../../router/RouterManager").RouterManager,
    goBack: jest.fn(),
    getUrl: jest.fn(),
  },
}));

const defaultProps: GobackButtonProps = {
  label: RouteName.DigitalSecuritiesList,
};

describe(`${GobackButton.name}`, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should render correctly without to prop", () => {
    const component = render(<GobackButton {...defaultProps} />);

    expect(component.asFragment()).toMatchSnapshot("withoutTo");
  });

  test("should render correctly with to prop", () => {
    const component = render(<GobackButton {...defaultProps} to={RouterManager.getUrl(RouteName.Dashboard)} />);

    expect(component.asFragment()).toMatchSnapshot("withTo");
  });

  test("should have a label", () => {
    const component = render(<GobackButton {...defaultProps} />);

    const label = component.getByTestId("go-back-button-label");
    expect(label).toHaveTextContent(defaultProps.label);
  });

  test("if have to prop should redirect to desired route", () => {
    const component = render(<GobackButton {...defaultProps} to={RoutePath.DIGITAL_SECURITIES_LIST} />);

    expect(component.getByRole("link")).toHaveAttribute("href", RoutePath.DIGITAL_SECURITIES_LIST);
  });

  test("if not have to prop shoul render as a button and goback to previous route on click", async () => {
    const component = render(<GobackButton {...defaultProps} />);

    const button = component.getByTestId("go-back-button-button");
    userEvent.click(button);

    await waitFor(() => {
      expect(RouterManager.goBack).toHaveBeenCalledTimes(1);
    });
  });
});
