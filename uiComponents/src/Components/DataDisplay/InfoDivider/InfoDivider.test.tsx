import React from "react";
import { render } from "@/test-utils";
import type { InfoDividerProps } from "./InfoDivider";
import { InfoDivider } from "./InfoDivider";

const defaultProps: InfoDividerProps = {
  title: "Example",
  type: "main",
};

describe(`< ${InfoDivider.name} />`, () => {
  const factoryComponent = (props: InfoDividerProps = defaultProps) =>
    render(<InfoDivider {...props} />);

  describe(`type: main`, () => {
    test("Should render correctly with just title", () => {
      const component = factoryComponent();
      expect(component.asFragment()).toMatchSnapshot("Main - just title");
      expect(component.getByText(defaultProps.title)).toBeInTheDocument();
    });

    test("Should render correctly with number", () => {
      const number = 1;
      const component = factoryComponent({ ...defaultProps, number });
      expect(component.asFragment()).toMatchSnapshot("Main - with number");
      expect(component.getByText("01")).toBeInTheDocument();
    });

    test("Should render correctly with step", () => {
      const step = 1;
      const component = factoryComponent({ ...defaultProps, step });
      expect(component.asFragment()).toMatchSnapshot("Main - with step");
      expect(component.getByText(step)).toBeInTheDocument();
    });
  });

  describe(`type: secondary`, () => {
    test("Should render correctly with just title", () => {
      const component = factoryComponent({
        ...defaultProps,
        type: "secondary",
      });
      expect(component.asFragment()).toMatchSnapshot("Secondary - just title");
    });

    test("Should render correctly with number", () => {
      const number = 1;
      const component = factoryComponent({
        ...defaultProps,
        type: "secondary",
        number,
      });
      expect(component.asFragment()).toMatchSnapshot("Secondary - with number");
      expect(component.getByText("01")).toBeInTheDocument();
    });
  });

  test("should be wrapped by a legend if as is passed", () => {
    const component = factoryComponent({ ...defaultProps, as: "legend" });

    expect(component.getByTestId("info-divider").nodeName).toBe("LEGEND");
  });

  test("should be wrapped by a div by default", () => {
    const component = factoryComponent();

    expect(component.getByTestId("info-divider").nodeName).toBe("DIV");
  });

  test("should show skeleton when isLoading is true", () => {
    const component = factoryComponent({ isLoading: true, ...defaultProps });

    expect(component.container).toMatchSnapshot("WithLoading");
  });
});
