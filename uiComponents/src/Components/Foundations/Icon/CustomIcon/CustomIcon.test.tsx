import { render } from "@/test-utils";
import React from "react";
import type { CustomIconProps } from "./CustomIcon";
import { CustomIcon } from "./CustomIcon";

describe(`<CustomIcon />`, () => {
  const defaultProps = {
    name: "Progress",
  };

  const factoryComponent = (props: CustomIconProps = defaultProps) =>
    render(<CustomIcon {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("rase exception when icon not found", () => {
    expect(() => factoryComponent({ name: "other" })).toThrowError();
  });
});
