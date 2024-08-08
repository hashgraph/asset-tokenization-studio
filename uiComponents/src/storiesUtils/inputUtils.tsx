import type { InputProps } from "@Components/Forms/Input";
import { InputIcon, InputIconButton } from "@Components/Forms/Input";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Envelope, HouseLine, PlayCircle } from "@phosphor-icons/react";
import React from "react";

const onClick = () => console.log("Clicked!");

export const addonRightInput: Record<
  | "TwoButtonIcon"
  | "OneButtonIcon"
  | "OneIcon"
  | "TwoIcon"
  | "OneIconOneButton",
  InputProps["addonRight"]
> = {
  TwoButtonIcon: (
    <>
      <InputIconButton
        icon={<PhosphorIcon as={HouseLine} />}
        aria-label="Bluetooth"
        onClick={onClick}
      />
      <InputIconButton
        aria-label="Bluetooth"
        icon={<PhosphorIcon as={HouseLine} />}
        onClick={onClick}
      />
    </>
  ),
  OneButtonIcon: (
    <InputIconButton
      aria-label="Bluetooth"
      onClick={onClick}
      icon={<PhosphorIcon as={HouseLine} />}
    />
  ),
  OneIcon: <InputIcon icon={<PhosphorIcon as={HouseLine} />} />,
  TwoIcon: (
    <>
      <InputIcon icon={<PhosphorIcon as={HouseLine} />} />
      <InputIcon icon={<PhosphorIcon as={HouseLine} />} />
    </>
  ),
  OneIconOneButton: (
    <>
      <InputIcon icon={<PhosphorIcon as={HouseLine} />} />
      <InputIconButton
        aria-label="Bluetooth"
        onClick={onClick}
        icon={<PhosphorIcon as={HouseLine} />}
      />
    </>
  ),
};
export const addonLeftInput: Record<
  "Example1" | "Example2",
  InputProps["addonLeft"]
> = {
  Example1: <InputIcon icon={<PhosphorIcon as={PlayCircle} />} />,
  Example2: <InputIcon icon={<PhosphorIcon as={Envelope} />} />,
};

export const inputSizes = ["sm", "md", "lg"];
export const inputArgTypes = {
  size: {
    options: inputSizes,
    control: { type: "select" },
    description: "Size of the input. Must be defined in the theme",
  },
  addonRight: {
    options: Object.keys(addonRightInput),
    mapping: addonRightInput,
    control: {
      type: "select",
      labels: {
        OneButtonIcon: "One button",
        OneIcon: "One Icon",
        TwoIcon: "Two Icons",
        TwoButtonIcon: "Two buttons",
        OneIconOneButton: "One Icon & One IconButton",
      },
    },
    description: "Addon at the right of the input",
  },
  addonLeft: {
    options: Object.keys(addonLeftInput),
    mapping: addonLeftInput,
    control: {
      type: "select",
      labels: {
        Example1: "Example One",
        Example2: "Example Two",
      },
    },
    description: "Addon at the right of the input",
  },
  variant: {
    options: ["outline"],
    control: { type: "radio" },
    description: "Variant of the input. Must be defined in the theme.",
  },
  showRequired: {
    control: { type: "boolean" },
    description:
      "Boolean that toggles whether to show the * if it is required.",
  },
  isRequired: {
    control: { type: "boolean" },
    description: "Boolean to specify that the input is required.",
  },
  isDisabled: {
    control: { type: "boolean" },
    description: "Boolean to specify if the input is disabled.",
  },
  isInvalid: {
    control: { type: "boolean" },
    description: "Boolean to specify if the input is invalid.",
  },
  isSuccess: {
    control: { type: "boolean" },
    description: "Boolean to specify that the input is success and valid.",
  },
  placeholder: {
    description: "Placeholder of the input.",
  },
  label: {
    description: "Label of the input.",
  },
};
