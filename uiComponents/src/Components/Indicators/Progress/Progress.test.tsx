import { render } from "@/test-utils";
import React from "react";
import type { ProgressProps } from "./Progress";
import { Progress } from "./Progress";

describe(`<Progress />`, () => {
  const value = 60;

  const min = 0;

  const max = 100;

  const hasStripe = false;

  const isAnimated = false;

  const isIndeterminate = false;

  const defaultProps = {
    value,
    min,
    max,
    hasStripe,
    isAnimated,
    isIndeterminate,
  };

  const factoryComponent = (props: ProgressProps) =>
    render(<Progress {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent({ ...defaultProps });

    const progressStyle = getComputedStyle(component.getByRole("progressbar"));
    expect(progressStyle.width).toBe(
      `${(defaultProps.value / (defaultProps.max - defaultProps.min)) * 100}%`
    );
    expect(component.asFragment()).toMatchSnapshot("Default progress");
  });

  test("renders correctly with stripes", () => {
    const component = factoryComponent({ ...defaultProps, hasStripe: true });

    const progressStyle = getComputedStyle(component.getByRole("progressbar"));
    expect(progressStyle.width).toBe(
      `${(defaultProps.value / (defaultProps.max - defaultProps.min)) * 100}%`
    );
    expect(component.asFragment()).toMatchSnapshot("Striped progress");
  });
  test("renders correctly with stripes and animation", () => {
    const component = factoryComponent({
      ...defaultProps,
      hasStripe: true,
      isAnimated: true,
    });

    const progressStyle = getComputedStyle(component.getByRole("progressbar"));
    expect(progressStyle.width).toBe(
      `${(defaultProps.value / (defaultProps.max - defaultProps.min)) * 100}%`
    );
    expect(component.asFragment()).toMatchSnapshot(
      "Striped progress with animation"
    );
  });
});
