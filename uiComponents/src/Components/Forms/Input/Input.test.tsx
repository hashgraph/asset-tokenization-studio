import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { render } from "@/test-utils";
import type { RenderResult } from "@testing-library/react";
import { Bluetooth } from "@phosphor-icons/react";
import React from "react";
import type { InputProps } from "./Input";
import { InputIcon, InputIconButton, Input } from "./Input";

describe(`<Input />`, () => {
  const id = "test-input";
  const label = "label";
  const placeholder = "placeholder";
  const defaultProps = {
    id,
    label,
    placeholder,
  };
  const sizeMedium = { size: "md" };
  const sizeLarge = { size: "lg" };
  const addonLeft = {
    addonLeft: <InputIcon icon={<PhosphorIcon as={Bluetooth} />} />,
  };
  const addonRight = {
    addonRight: (
      <InputIconButton
        aria-label="Bluetooth"
        onClick={jest.fn()}
        icon={<PhosphorIcon as={Bluetooth} />}
      />
    ),
  };
  const isDisabled = { isDisabled: true };
  const isInvalid = { isInvalid: true };
  const outlineVariant = { variant: "outline" };
  const topDescription = { topDescription: "This is a description" };
  const bottomDescription = { bottomDescription: "This is a description" };
  const subLabel = { subLabel: "This is a sublabel" };

  const getLabelElement = (component: RenderResult) =>
    component.container.querySelector("span#label");

  const factoryComponent = (props: InputProps = defaultProps) =>
    render(<Input {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent();
    expect(component.asFragment()).toMatchSnapshot();
  });

  test("shows correctly when size is medium", () => {
    const component = factoryComponent({ ...defaultProps, ...sizeMedium });
    expect(component.asFragment()).toMatchSnapshot("Using medium size");
  });

  test("shows correctly when size is large", () => {
    const component = factoryComponent({ ...defaultProps, ...sizeLarge });
    const labelBlock = getLabelElement(component);
    expect(labelBlock).toHaveTextContent(label);
    expect(component.asFragment()).toMatchSnapshot("Using large size");
  });

  test("shows correctly when is disabled", () => {
    const component = factoryComponent({ ...defaultProps, ...isDisabled });
    expect(component.asFragment()).toMatchSnapshot("Using as disabled");
  });

  test("shows correctly when is invalid", () => {
    const component = factoryComponent({ ...defaultProps, ...isInvalid });
    expect(component.asFragment()).toMatchSnapshot("Using as invalid");
  });

  test("shows correctly when uses outline variant", () => {
    const component = factoryComponent({ ...defaultProps, ...outlineVariant });
    expect(component.asFragment()).toMatchSnapshot("Using outline variant");
  });

  test("shows correctly when uses addon left", () => {
    const component = factoryComponent({ ...defaultProps, ...addonLeft });
    expect(component.asFragment()).toMatchSnapshot("Using addon left");
  });

  test("shows correctly when uses addon right", () => {
    const component = factoryComponent({ ...defaultProps, ...addonRight });
    expect(component.asFragment()).toMatchSnapshot("Using addon right");
  });

  test("shows correctly when isSuccess", () => {
    const component = factoryComponent({ ...defaultProps, isSuccess: true });
    expect(component.asFragment()).toMatchSnapshot("Is Success");
  });

  test("shows correctly when isRequired", () => {
    const component = factoryComponent({ ...defaultProps, isRequired: true });
    expect(component.asFragment()).toMatchSnapshot("Is required");
  });

  test("shows correctly when uses addon right and input is invalid", () => {
    const component = factoryComponent({
      ...defaultProps,
      ...addonRight,
      ...isInvalid,
    });
    expect(component.asFragment()).toMatchSnapshot(
      "Using addon right and invalid"
    );
  });

  test("shows correctly with topDescription", () => {
    const component = factoryComponent({ ...defaultProps, ...topDescription });
    expect(
      component.getByText(topDescription.topDescription)
    ).toBeInTheDocument();
    expect(component.asFragment()).toMatchSnapshot("Top Description");
  });

  test("shows correctly with bottomDescription", () => {
    const component = factoryComponent({
      ...defaultProps,
      ...bottomDescription,
    });
    expect(
      component.getByText(bottomDescription.bottomDescription)
    ).toBeInTheDocument();
    expect(component.asFragment()).toMatchSnapshot("Bottom Description");
  });
  test("shows correctly with subLabel", () => {
    const component = factoryComponent({
      ...defaultProps,
      ...subLabel,
    });
    expect(component.getByText(subLabel.subLabel)).toBeInTheDocument();
    expect(component.asFragment()).toMatchSnapshot("Bottom Description");
  });
});
