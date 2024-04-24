import { render } from "@/test-utils";
import { Radio } from "@Components/Forms/Radio";
import React from "react";
import type { RadioGroupProps } from "./RadioGroup";
import { RadioGroup } from "./RadioGroup";

describe(`<RadioGroup />`, () => {
  const childrenProp = {
    children: (
      <>
        <Radio value="check1">Check1</Radio>
        <Radio value="check2">Check2</Radio>
        <Radio value="check3">Check3</Radio>
      </>
    ),
  };
  const isDisabledProp = { isDisabled: true };
  const defaultValueProp = { defaultValue: "check2" };

  const factoryComponent = (props?: Partial<RadioGroupProps>) =>
    render(<RadioGroup name="test-group" {...childrenProp} {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("shows correctly when is disabled", async () => {
    const component = factoryComponent(isDisabledProp);

    expect(component.asFragment()).toMatchSnapshot("Using as disabled");
  });

  test("shows correctly when sets value by default", () => {
    const component = factoryComponent(defaultValueProp);

    expect(component.asFragment()).toMatchSnapshot("Using as default value");
  });

  test("shows correctly when is checked and disabled", () => {
    const component = factoryComponent({
      ...defaultValueProp,
      ...isDisabledProp,
    });

    expect(component.asFragment()).toMatchSnapshot(
      "Using as default checked and disabled"
    );
  });
});
