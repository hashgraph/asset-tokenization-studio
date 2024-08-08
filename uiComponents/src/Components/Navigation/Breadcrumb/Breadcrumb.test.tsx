import React from "react";
import { render } from "@/test-utils";
import type { BreadcrumbProps } from "./Breadcrumb";
import { Breadcrumb } from "./Breadcrumb";
import { defaultProps } from "./commonTests";

describe(`<Breadcrumb />`, () => {
  const factoryComponent = (props: BreadcrumbProps) =>
    render(<Breadcrumb {...props} />);

  test("renders correctly default", () => {
    const component = factoryComponent(defaultProps);

    expect(component.asFragment()).toMatchSnapshot("default");
  });

  test("renders correctly with MaxItems to show", () => {
    const component = factoryComponent({ ...defaultProps, showMaxItems: true });

    expect(component.asFragment()).toMatchSnapshot("showMaxItems");
  });
});
