import { render } from "@/test-utils";
import type { RenderResult } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import type { ToggleProps } from "./Toggle";
import { Toggle } from "./Toggle";

describe(`<Toggle />`, () => {
  const testId = "radioTest";

  const defaultProps: ToggleProps = {};

  const factoryComponent = (props = defaultProps) =>
    render(<Toggle data-testid={testId} {...props} />);

  const getInput = (component: RenderResult) =>
    component.getByTestId(testId).querySelector("input");

  test("renders correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("could be marked as disabled", () => {
    const component = factoryComponent({ isDisabled: true });

    expect(getInput(component)).toBeDisabled();
  });

  test("could set value", () => {
    const component = factoryComponent({ isChecked: true });

    expect(getInput(component)).toBeChecked();
  });

  test("value could be changed", async () => {
    const onChangeCallback = jest.fn();
    const component = factoryComponent({ onChange: onChangeCallback });

    expect(getInput(component)).not.toBeChecked();

    await userEvent.click(component.getByTestId(testId));

    await waitFor(() => {
      expect(onChangeCallback).toHaveBeenCalled();
      expect(getInput(component)).toBeChecked();
    });
  });
});
