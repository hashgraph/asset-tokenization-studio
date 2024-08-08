import React from "react";
import { render } from "../../../test-utils";
import type { HeadingProps } from "./Heading";
import { Heading } from "./Heading";

describe(`<Heading />`, () => {
  const defaultProps = {
    fontSize: "32px",
  };

  const themeCustom = {
    textStyles: {
      red: {
        color: "red",
      },
    },
    components: {
      Heading: {
        variants: {
          light: {
            fontFamily: "Helvetica Neue",
          },
        },
      },
    },
  };

  const factoryComponent = (props: HeadingProps = defaultProps) =>
    render(
      <Heading {...props} data-testid="heading">
        Title
      </Heading>,
      themeCustom
    );

  test("renders correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("renders correctly with text style", () => {
    const component = factoryComponent({ textStyle: "red" });

    expect(component.asFragment()).toMatchSnapshot("WithTextStyle");
  });

  test("renders correctly with variant", () => {
    const component = factoryComponent({ variant: "light" });

    expect(component.asFragment()).toMatchSnapshot("WithVariant");
  });

  test("renders correctly with custom heading tag", () => {
    const component = factoryComponent({ as: "h1" });

    expect(component.getByTestId("heading").tagName).toBe("H1");
    expect(component.asFragment()).toMatchSnapshot("WithCustomTag");
  });
});
