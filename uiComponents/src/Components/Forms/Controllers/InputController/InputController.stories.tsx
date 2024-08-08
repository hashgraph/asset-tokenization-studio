import type { Meta, StoryFn } from "@storybook/react";
import React from "react";

import { InputController } from "./InputController";
import { useForm } from "react-hook-form";
import { inputArgTypes } from "@/storiesUtils";

const rulesOptions = {
  Required: { required: "This is required " },
  MaxLength: { maxLength: { value: 5, message: "Max length is 5" } },
};

const meta = {
  title: "Design System/Forms/Controllers/InputController",
  component: InputController,
  args: {
    label: "Label",
    placeholder: "Placeholder",
    id: "Name",
    variant: "outline",
  },
  argTypes: {
    ...inputArgTypes,
    control: { control: false },
    defaultValue: { control: false },
    rules: {
      options: Object.keys(rulesOptions),
      mapping: rulesOptions,
      control: {
        type: "select",
        labels: {
          MaxLength: "Max length of 5",
          Required: "Required field",
        },
      },
      description: "Addon at the right of the input",
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1503%3A22829&t=4DeUdPmWLzP51oPO-4",
    },
    docs: {},
  },
} as Meta<typeof InputController>;
export default meta;

type FieldValue = {
  field: string;
};
const Template: StoryFn<typeof InputController> = (args) => {
  const form = useForm<FieldValue>({ mode: "onChange" });
  return <InputController {...args} id="field" control={form.control} />;
};

export const NoValidations = Template.bind({});
NoValidations.args = {};

export const WithValidations = Template.bind({});
WithValidations.args = {
  rules: { required: "This is required" },
};

export const ShowIsSuccess = Template.bind({});
ShowIsSuccess.args = {
  showIsSuccess: true,
};

export const OnChangeCustom = Template.bind({});
OnChangeCustom.args = {
  onChange: (e) => {
    console.log("onChange fired", e);
  },
};

export const OnBlurCustom = Template.bind({});
OnBlurCustom.args = {
  onBlur: (e) => {
    console.log("onBlur fired", e);
  },
};

export const HideErrors = Template.bind({});
HideErrors.args = {
  rules: { required: "This is required" },
  showErrors: false,
};

export const WithDefaultValue = Template.bind({});
WithDefaultValue.args = {
  defaultValue: "Default value",
};

export const IsClearable = Template.bind({});
IsClearable.args = {
  isClearable: true,
  onClear: () => console.log("After clear"),
};
