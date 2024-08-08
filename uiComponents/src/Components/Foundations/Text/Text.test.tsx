import React from "react";
import { render } from "../../../test-utils";
import type { TextProps } from "./Text";
import { Text } from "./Text";

describe(`<Text />`, () => {
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
      Text: {
        variants: {
          regular: {
            fontFamily: "Helvetica Neue",
          },
        },
      },
    },
  };

  const factoryComponent = (props: TextProps = defaultProps) =>
    render(
      <Text {...props} data-testid="Text">
        Text example
      </Text>,
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
    const component = factoryComponent({ variant: "regular" });

    expect(component.asFragment()).toMatchSnapshot("WithVariant");
  });

  test("renders correctly with custom Text tag", () => {
    const component = factoryComponent({ as: "span" });

    expect(component.getByTestId("Text").tagName).toBe("SPAN");
    expect(component.asFragment()).toMatchSnapshot("WithCustomTag");
  });
});
