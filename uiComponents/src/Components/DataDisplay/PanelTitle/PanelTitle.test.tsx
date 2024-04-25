import { render } from "@/test-utils";
import React from "react";
import type { PanelTitleProps } from "@Components/DataDisplay/PanelTitle";
import { PanelTitle } from "@Components/DataDisplay/PanelTitle";

describe("<PanelTitle/>", () => {
  const defaultText = "Panel title";
  const defaultProps: PanelTitleProps = {
    title: defaultText,
  };

  const factoryComponent = (props?: Partial<PanelTitleProps>) =>
    render(<PanelTitle {...defaultProps} {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
    expect(component.getByText(defaultText)).toBeVisible();
  });
});
