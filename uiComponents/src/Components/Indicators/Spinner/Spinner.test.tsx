import { render } from "@/test-utils";
import { ConfigSpinner } from "@/Theme/Components/Spinner";
import React from "react";
import type { SpinnerProps } from "./Spinner";
import { Spinner } from "./Spinner";

describe(`<Spinner />`, () => {
  const factoryComponent = (props: SpinnerProps = {}) =>
    render(<Spinner {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent();

    const spinnerStyle = getComputedStyle(component.getByTestId("spinner"));
    expect(spinnerStyle.borderWidth).toBe(ConfigSpinner.sizes.xxs.borderWidth);
    expect(component.asFragment()).toMatchSnapshot("Default Spinner");
  });

  test("renders correctly with size", () => {
    const component = factoryComponent({ size: "sm" });
    const spinnerStyle = getComputedStyle(component.getByTestId("spinner"));
    expect(spinnerStyle.borderWidth).toBe(ConfigSpinner.sizes.sm.borderWidth);
    expect(component.asFragment()).toMatchSnapshot("Sized Spinner");
  });
});
