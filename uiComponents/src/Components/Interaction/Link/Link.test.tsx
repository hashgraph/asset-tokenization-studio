import { render } from "@/test-utils";
import { act, fireEvent } from "@testing-library/react";
import React from "react";
import type { LinkProps } from "./Link";
import { Link } from "./Link";

describe("<Link/> component", () => {
  const defaultText = "Click me";

  const defaultProps: LinkProps = {
    children: defaultText,
  };

  const factoryComponent = (props: LinkProps = defaultProps) =>
    render(<Link {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("show disabled component", async () => {
    const component = factoryComponent({
      ...defaultProps,
      isDisabled: true,
      variant: "highlighted",
    });
    const container = component.getByTestId("link");

    expect(container).not.toHaveStyle("cursor: pointer");
    expect(container).toHaveStyle("cursor: not-allowed");
  });

  test("you cannot click on a disabled link", async () => {
    const onClick = jest.fn();
    const component = factoryComponent({
      ...defaultProps,
      isDisabled: true,
      onClick,
    });
    const container = component.getByTestId("link");

    await act(() => fireEvent.click(container));
    expect(onClick).not.toHaveBeenCalled();
  });
});
