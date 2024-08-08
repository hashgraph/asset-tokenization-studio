import React from "react";
import type { CardButtonProps } from "./CardButton";
import { CardButton } from "./CardButton";
import { render } from "@/test-utils";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Airplane } from "@phosphor-icons/react";

describe("<CardButton/> component", () => {
  const defaultIcon = <PhosphorIcon as={Airplane} />;
  const defaultText: CardButtonProps["text"] = "Button text";

  const defaultProps: CardButtonProps = {
    text: defaultText,
    icon: defaultIcon,
  };

  const factoryComponent = (props: CardButtonProps = defaultProps) =>
    render(<CardButton {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("show disabled component", async () => {
    const component = factoryComponent({
      ...defaultProps,
      isDisabled: true,
    });
    const container = component.getByTestId("card-button-button");

    expect(container).toBeDisabled();
  });

  test("show selected component", () => {
    const component = factoryComponent({ ...defaultProps, isSelected: true });
    const checkContainer = component.getByTestId("card-button-check-container");

    expect(checkContainer).toBeVisible();
  });
});
