import { render } from "@/test-utils";
import React from "react";
import type { AddAreaButtonProps } from "./AddAreaButton";
import { AddAreaButton } from "./AddAreaButton";

describe(`<AddAreaButton />`, () => {
  const defaultLabel = "Add element text";
  const defaultProps: AddAreaButtonProps = {
    children: defaultLabel,
  };

  const factoryComponent = (props: AddAreaButtonProps = defaultProps) =>
    render(<AddAreaButton {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("shows correctly children", () => {
    const component = factoryComponent();

    expect(component.getByText(defaultLabel)).toBeVisible();
  });

  test("pass down props", () => {
    const component = factoryComponent({
      isDisabled: true,
      children: defaultLabel,
    });

    expect(component.getByTestId("add-area-button")).toBeDisabled();
  });
});
