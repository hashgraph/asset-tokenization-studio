import { render } from "@/test-utils";
import { Text as ChakraText } from "@chakra-ui/react";
import { Icon } from "@/Components/Foundations/Icon";
import type { RenderResult } from "@testing-library/react";
import { act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import type { CheckboxProps } from "./Checkbox";
import { Checkbox } from "./Checkbox";
import { HouseLine } from "@phosphor-icons/react";

describe(`<Checkbox />`, () => {
  const testId = "test-checkbox";

  const textCheckbox = "checkbox item";
  const childrenProp = { children: <ChakraText>{textCheckbox}</ChakraText> };
  const sizeExtraSmallProp = { size: "xs" };
  const sizeSmallProp = { size: "sm" };
  const sizeMediumProp = { size: "md" };
  const sizeLargeProp = { size: "lg" };
  const iconProp = { icon: <Icon as={HouseLine} /> };
  const isDisabledProp = { isDisabled: true };
  const isInvalidProp = { isInvalid: true };
  const defaultCheckedProp = { defaultChecked: true };
  const squareVariantProp = { variant: "square" };
  const circleVariantProp = { variant: "circle" };

  const getInput = (component: RenderResult) =>
    component.getByTestId(testId).querySelector("input");

  const clickOnCheckbox = (component: RenderResult) => {
    act(() => {
      userEvent.click(getInput(component)!);
    });
  };

  const checkStatusRadio = (component: RenderResult, status: boolean) =>
    waitFor(() => {
      status
        ? expect(getInput(component)).toBeChecked()
        : expect(getInput(component)).not.toBeChecked();
    });

  const factoryComponent = (props?: CheckboxProps) =>
    render(<Checkbox name="test" data-testid={testId} {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("shows correctly children", () => {
    const component = factoryComponent(childrenProp);

    expect(component.getByText(textCheckbox)).toBeVisible();

    expect(component.asFragment()).toMatchSnapshot("Using children");
  });

  test("shows new state when does click", async () => {
    const component = factoryComponent();

    clickOnCheckbox(component);

    await checkStatusRadio(component, true);
  });

  test("shows correctly when size is extra small", () => {
    const component = factoryComponent(sizeExtraSmallProp);

    expect(component.asFragment()).toMatchSnapshot("Using extra small size");
  });

  test("shows correctly when size is small", () => {
    const component = factoryComponent(sizeSmallProp);

    expect(component.asFragment()).toMatchSnapshot("Using small size");
  });

  test("shows correctly when size is medium", () => {
    const component = factoryComponent(sizeMediumProp);

    expect(component.asFragment()).toMatchSnapshot("Using medium size");
  });

  test("shows correctly when size is large", () => {
    const component = factoryComponent(sizeLargeProp);

    expect(component.asFragment()).toMatchSnapshot("Using large size");
  });

  test("shows correctly when is disabled", async () => {
    const component = factoryComponent(isDisabledProp);

    clickOnCheckbox(component);

    await checkStatusRadio(component, false);

    expect(component.asFragment()).toMatchSnapshot("Using as disabled");
  });

  test("shows correctly when is invalid", () => {
    const component = factoryComponent(isInvalidProp);

    expect(component.asFragment()).toMatchSnapshot("Using as invalid");
  });

  test("shows correctly when is checked by default", () => {
    const component = factoryComponent(defaultCheckedProp);

    expect(component.asFragment()).toMatchSnapshot("Using as default checked");
  });

  test("shows correctly when uses square variant", () => {
    const component = factoryComponent(squareVariantProp);

    expect(component.asFragment()).toMatchSnapshot("Using square variant");
  });

  test("shows correctly when uses circle variant", () => {
    const component = factoryComponent(circleVariantProp);

    expect(component.asFragment()).toMatchSnapshot("Using circle variant");
  });

  test("shows correctly when is checked and disabled", () => {
    const component = factoryComponent({
      ...defaultCheckedProp,
      ...isDisabledProp,
    });

    expect(component.asFragment()).toMatchSnapshot(
      "Using as default checked and disabled"
    );
  });

  test("shows correctly when uses other icon", () => {
    const component = factoryComponent(iconProp);

    expect(component.asFragment()).toMatchSnapshot("Using other icon");
  });
});
