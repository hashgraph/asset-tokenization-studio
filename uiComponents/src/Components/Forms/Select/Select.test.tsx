import { render } from "@/test-utils";
import { addonLeftInput, addonRightInput } from "@/storiesUtils";
import React from "react";
import { Select, type SelectProps } from "./Select";

const options: Array<{
  label: string;
  value: string | number;
}> = [
  { label: "Option 1", value: 1 },
  { label: "Option 2", value: 2 },
];

describe(`<Select />`, () => {
  const defaultProps: SelectProps = {
    placeholder: "Hello",
    options,
  };

  const factoryComponent = (props: SelectProps = defaultProps) =>
    render(<Select {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent();
    expect(component.asFragment()).toMatchSnapshot();
  });

  const sizes = ["sm", "md", "lg"];

  sizes.forEach((size) => {
    test(`renders correctly with size ${size}`, () => {
      const component = factoryComponent({ ...defaultProps, size });
      expect(component.asFragment()).toMatchSnapshot(`Using size ${size}`);
    });
  });

  test("renders correctly with addonRight", () => {
    const component = factoryComponent({
      ...defaultProps,
      addonRight: addonRightInput.OneIcon,
    });
    expect(component.asFragment()).toMatchSnapshot("Using addonRight");
  });

  test("renders correctly with addonLeft", () => {
    const component = factoryComponent({
      ...defaultProps,
      addonLeft: addonLeftInput.Example1,
    });
    expect(component.asFragment()).toMatchSnapshot("Using addonLeft");
  });

  test("renders correctly with custom dropdownIndicator", () => {
    const component = factoryComponent({
      ...defaultProps,
      dropdownIndicator: addonLeftInput.Example1,
    });
    expect(component.asFragment()).toMatchSnapshot(
      "Using custom dropdownIndicator"
    );
  });

  test("renders correctly with isDisabled", () => {
    const component = factoryComponent({ ...defaultProps, isDisabled: true });
    expect(component.asFragment()).toMatchSnapshot("Using as disabled");
  });

  test("renders correctly with isInvalid", () => {
    const component = factoryComponent({ ...defaultProps, isInvalid: true });
    expect(component.asFragment()).toMatchSnapshot("Using as invalid");
  });

  test("renders correctly with isRequired", () => {
    const component = factoryComponent({ ...defaultProps, isRequired: true });
    expect(component.asFragment()).toMatchSnapshot("With isRequired");
  });

  test("renders correctly with label", () => {
    const component = factoryComponent({
      ...defaultProps,
      label: "Example label",
    });
    expect(component.getByText("Example label")).toBeInTheDocument();
    expect(component.asFragment()).toMatchSnapshot("Using label");
  });
});
