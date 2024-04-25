import { render } from "@/test-utils";
import React from "react";
import type { ButtonProps } from "./Button";
import { Button } from "./Button";

describe(`<Button />`, () => {
  const defaultText = "Content of the button";
  const defaultProps: ButtonProps = {
    children: <>{defaultText}</>,
  };

  const baseSizesList = ["md", "lg"];
  const baseVariantsList = ["primary", "tertiary", "secondary"];
  const statusColors = ["success", "error", "warning", "info"];
  const factoryComponent = (props: ButtonProps = defaultProps) =>
    render(<Button {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("shows correctly children", () => {
    const label = "Text of the button";
    const component = factoryComponent({ children: <>{label}</> });

    expect(component.getByText(label)).toBeVisible();
  });

  test("pass down props", () => {
    const component = factoryComponent({
      isDisabled: true,
      children: <>{defaultText}</>,
    });

    expect(component.getByText(defaultText)).toBeDisabled();
  });

  baseVariantsList.forEach((variant) => {
    baseSizesList.forEach((size) => {
      statusColors.forEach((status) => {
        test(`renders correctly for size ${size} & variant ${variant}`, () => {
          const component = factoryComponent({
            ...defaultProps,
            size,
            variant,
            status,
          });
          expect(component.asFragment()).toMatchSnapshot(
            `Button-${variant}-${size}-${status}`
          );
        });
      });
    });
  });
});
