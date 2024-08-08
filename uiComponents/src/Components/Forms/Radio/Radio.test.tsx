import { render } from "@/test-utils";
import { Box as ChakraBox, Text as ChakraText } from "@chakra-ui/react";
import type { RenderResult } from "@testing-library/react";
import { act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import type { RadioProps } from "./Radio";
import { Radio } from "./Radio";

describe(`<Radio />`, () => {
  const testId = "test-radio";

  const textRadio = "radio item";
  const childrenProp = { children: <ChakraText>{textRadio}</ChakraText> };
  const isDisabledProp = { isDisabled: true };
  const isInvalidProp = { isInvalid: true };
  const defaultCheckedProp = { defaultChecked: true };

  const getInput = (component: RenderResult) =>
    component.getByTestId(testId).querySelector("input");

  const clickOnRadio = (component: RenderResult) => {
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

  const factoryComponent = (props?: RadioProps) =>
    render(
      <ChakraBox data-testid={testId}>
        <Radio name="test" {...props} />
      </ChakraBox>
    );

  test("renders correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("shows correctly children", () => {
    const component = factoryComponent(childrenProp);

    expect(component.getByText(textRadio)).toBeVisible();

    expect(component.asFragment()).toMatchSnapshot("Using children");
  });

  test("shows new state when does click", async () => {
    const component = factoryComponent();

    clickOnRadio(component);

    await checkStatusRadio(component, true);
  });

  test("shows correctly when is disabled", async () => {
    const component = factoryComponent(isDisabledProp);

    clickOnRadio(component);

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

  test("shows correctly when is checked and disabled", () => {
    const component = factoryComponent({
      ...defaultCheckedProp,
      ...isDisabledProp,
    });

    expect(component.asFragment()).toMatchSnapshot(
      "Using as default checked and disabled"
    );
  });
});
