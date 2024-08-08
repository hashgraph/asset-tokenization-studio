import type { Meta, StoryFn } from "@storybook/react";
import React from "react";

import { CheckboxController } from "./CheckboxController";
import { useForm } from "react-hook-form";

const meta = {
  title: "Design System/Forms/Controllers/CheckboxController",
  component: CheckboxController,
  args: {
    id: "Name",
  },
  argTypes: {},
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1874%3A15429&t=GPCIOt6k4o0cCWIe-4",
    },
    docs: {},
  },
} as Meta<typeof CheckboxController>;
export default meta;

type FieldValue = {
  field: string;
};
const Template: StoryFn<typeof CheckboxController> = (args) => {
  const form = useForm<FieldValue>({ mode: "onChange" });
  return (
    <CheckboxController {...args} id="field" control={form.control}>
      I accept
    </CheckboxController>
  );
};

export const NoValidations = Template.bind({});
NoValidations.args = {};

export const WithValidations = Template.bind({});
WithValidations.args = {
  rules: { required: "This is required" },
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
