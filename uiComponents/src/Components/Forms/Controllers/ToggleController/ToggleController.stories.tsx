import type { Meta, StoryFn } from "@storybook/react";
import React from "react";

import { ToggleController } from "./ToggleController";
import { useForm } from "react-hook-form";

const meta = {
  title: "Design System/Forms/Controllers/ToggleController",
  component: ToggleController,
  args: {
    label: "Hello",
  },
  argTypes: {
    control: { control: false },
    defaultValue: { control: false },
    rules: { control: false },

    isDisabled: {
      control: { type: "boolean" },
      description: "Boolean to specify if the input is disabled.",
    },
    isInvalid: {
      control: { type: "boolean" },
      description: "Boolean to specify if the input is invalid.",
    },
    size: {
      control: false,
      description:
        "The size of the toggle. Must be defined in the theme (inside Switch component)",
    },
    variant: {
      description:
        "The variant of the toggle. Must be defined in the theme (inside Switch component)",
    },
    label: { description: "The label of the toggle" },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1874%3A15429&t=4DeUdPmWLzP51oPO-4",
    },
    docs: {},
  },
} as Meta<typeof ToggleController>;
export default meta;

type FieldValue = {
  toggle: boolean;
};
const Template: StoryFn<typeof ToggleController> = (args) => {
  const form = useForm<FieldValue>({
    mode: "onChange",
  });

  return <ToggleController {...args} id="toggle" control={form.control} />;
};

export const NoValidations = Template.bind({});
NoValidations.args = {};

export const WithValidations = Template.bind({});
WithValidations.args = {
  rules: { validate: { valid: (val: boolean) => !!val } },
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
