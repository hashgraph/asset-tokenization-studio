import { addonLeftInput, addonRightInput, inputArgTypes } from "@/storiesUtils";
import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { Select } from "./Select";
import _omit from "lodash/omit";
import { Spinner } from "@Components/Indicators/Spinner";

const options: Array<{
  label: string;
  value: string | number;
}> = [
  { label: "Option 1", value: 1 },
  { label: "Option 2", value: 2 },
];
export default {
  title: "Design System/Forms/Select",
  component: Select,
  args: {
    variant: "outline",
    options,
    placeholder: "Select...",
    label: "Select option",
  },
  argTypes: {
    ..._omit(inputArgTypes, ["isSuccess"]),
    dropdownIndicator: {
      control: false,
      description: "Element to override default arrow icon",
    },
    overrideStyles: {
      control: false,
      description: "Used to override chakraStyles of the select",
    },
    options: {
      description: "Options rendered in the select",
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A9865",
    },
  },
} as Meta<typeof Select>;

const Template: StoryFn<typeof Select> = (args) => <Select {...args} />;

export const Small = Template.bind({});

Small.args = {
  size: "sm",
};

export const Medium = Template.bind({});

Medium.args = {
  size: "md",
};

export const Large = Template.bind({});

Large.args = {
  size: "lg",
};

export const WithIconLeft = Template.bind({});

WithIconLeft.args = {
  addonLeft: addonLeftInput.Example1,
};

export const WithIconRight = Template.bind({});

WithIconRight.args = {
  addonRight: addonRightInput.OneIcon,
};

export const IsDisabled = Template.bind({});

IsDisabled.args = {
  isDisabled: true,
};

export const IsInvalid = Template.bind({});

IsInvalid.args = {
  isInvalid: true,
};

export const IsLoading = Template.bind({});

IsLoading.args = {
  isLoading: true,
};

export const IsLoadingCustom = Template.bind({});

IsLoadingCustom.args = {
  isLoading: true,
  loadingIndicator: <Spinner color="error" />,
};

export const LongSelect = Template.bind({});

LongSelect.args = {
  options: [
    { label: "Option 1", value: 1 },
    { label: "Option 2", value: 2 },
    { label: "Option 3", value: 1 },
    { label: "Option 4", value: 2 },
    { label: "Option 5", value: 5 },
    { label: "This is a very long option lorem ipsum", value: 6 },
    { label: "Option 7", value: 7 },
    { label: "Option 8", value: 8 },
    { label: "Option 9", value: 9 },
    { label: "Option 10", value: 10 },
  ],
};
