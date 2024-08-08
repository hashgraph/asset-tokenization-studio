import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { useForm } from "react-hook-form";

import { RadioGroupController } from "./RadioGroupController";

const meta = {
  title: "Design System/Forms/Controllers/RadioGroupController",
  component: RadioGroupController,
  args: {
    options: [
      { label: "One", value: "1" },
      { label: "Two", value: "2" },
      { label: "Three", value: "3" },
    ],
  },
  argTypes: {
    isDisabled: { control: { type: "boolean" } },
    defaultValue: { control: { type: "text" } },
    id: { control: { type: "text" } },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1874%3A15429&t=GPCIOt6k4o0cCWIe-4",
    },
    docs: {},
  },
} as Meta<typeof RadioGroupController>;
export default meta;

type FieldValue = {
  field: string;
};
const Template: StoryFn<typeof RadioGroupController> = (args) => {
  const form = useForm<FieldValue>({ mode: "onChange" });

  return (
    <RadioGroupController
      {...args}
      id="field"
      control={form.control}
      gap={3}
      display="flex"
    />
  );
};

export const NoValidations = Template.bind({});
NoValidations.args = {};

export const WithValidations = Template.bind({});
WithValidations.args = {
  rules: {
    validate: {
      notTwoValue: (value: string) =>
        value !== "2" || "This value is not valid",
    },
  },
};

export const ShowingErrorMessage = Template.bind({});
ShowingErrorMessage.args = {
  showErrors: true,
  rules: {
    validate: {
      notTwoValue: (value: string) =>
        value !== "2" || "This value is not valid",
    },
  },
};

export const IsDisabled = Template.bind({});
IsDisabled.args = {
  isDisabled: true,
};

export const DefaultValue = Template.bind({});
DefaultValue.args = {
  defaultValue: "3",
};
