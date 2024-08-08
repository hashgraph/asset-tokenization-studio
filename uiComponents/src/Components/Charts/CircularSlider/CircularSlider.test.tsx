import { render } from "@/test-utils";
import React from "react";
import type { CircularSliderProps } from "./CircularSlider";
import { CircularSlider } from "./CircularSlider";

describe(`<CircularSlider />`, () => {
  const textLabel = "radio item";
  const labelProp = { label: textLabel };
  const valueProp = { value: 40 };
  const sizeSmallProp = { size: "sm" };
  const sizeMediumProp = { size: "md" };
  const colorProp = { color: "red" };

  const factoryComponent = (props?: CircularSliderProps) =>
    render(<CircularSlider {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("shows correctly when a label is passed over it ", () => {
    const component = factoryComponent(labelProp);

    expect(component.getByText(textLabel)).toBeVisible();

    expect(component.asFragment()).toMatchSnapshot("Using label");
  });

  test("shows correctly when a value is passed over it ", () => {
    const component = factoryComponent(valueProp);

    expect(component.asFragment()).toMatchSnapshot("Using value");
  });

  test("shows correctly when size is small", () => {
    const component = factoryComponent(sizeSmallProp);

    expect(component.asFragment()).toMatchSnapshot("Using small size");
  });

  test("shows correctly when size is medium", () => {
    const component = factoryComponent(sizeMediumProp);

    expect(component.asFragment()).toMatchSnapshot("Using medium size");
  });

  test("shows correctly when a color is passed over it ", () => {
    const component = factoryComponent(colorProp);

    expect(component.asFragment()).toMatchSnapshot("Using color");
  });

  test("shows correctly when isLoading is true", () => {
    const component = factoryComponent({ isLoading: true });

    expect(component.asFragment()).toMatchSnapshot("Using isLoading");
  });
});
