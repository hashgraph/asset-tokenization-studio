import type { Meta, StoryFn } from "@storybook/react";
import React from "react";

import { TextareaController } from "./TextareaController";
import { useForm } from "react-hook-form";

const meta = {
  title: "Design System/Forms/Controllers/TextareaController",
  component: TextareaController,
  args: {
    label: "Hello",
    placeholder: "Hello",
    id: "Name",
    variant: "outline",
  },
  argTypes: {},
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1503%3A22829&t=4DeUdPmWLzP51oPO-4",
    },
    docs: {},
  },
} as Meta<typeof TextareaController>;
export default meta;

type FieldValue = {
  field: string;
};
const Template: StoryFn<typeof TextareaController> = (args) => {
  const form = useForm<FieldValue>({
    mode: "onChange",
  });
  return <TextareaController {...args} id="field" control={form.control} />;
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

export const WithMaxLength = Template.bind({});
WithMaxLength.args = {
  rules: { required: "This is required" },
  maxLength: 500,
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
