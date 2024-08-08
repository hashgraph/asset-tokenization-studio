import type { Meta, StoryFn } from "@storybook/react";
import React from "react";

import { SelectController } from "./SelectController";
import { useForm } from "react-hook-form";

const meta = {
  title: "Design System/Forms/Controllers/SelectController",
  component: SelectController,
  args: {
    label: "Hello",
    placeholder: "Hello",
    id: "Name",
  },
  argTypes: {},
  parameters: {
    docs: {},
  },
} as Meta<typeof SelectController>;
export default meta;

interface FieldValues {
  field: number;
}

const Template: StoryFn<typeof SelectController> = (args) => {
  const form = useForm<FieldValues>({ mode: "onChange" });
  return (
    <SelectController
      {...args}
      id="field"
      label="Label example"
      control={form.control}
      options={[
        { value: 1, label: "One" },
        { value: 2, label: "Two" },
        { value: 3, label: "Three" },
      ]}
      onChange={(val) => {
        console.log("onChange fired", val);
      }}
    />
  );
};

export const NoValidations = Template.bind({});
NoValidations.args = {};

export const WithValidations = Template.bind({});
WithValidations.args = {
  rules: {
    required: true,
    validate: { notSecond: (val: number) => val !== 2 || "Option not valid" },
  },
};

export const HideErrors = Template.bind({});
HideErrors.args = {
  rules: {
    required: true,
    validate: { notSecond: (val: number) => val !== 2 || "Option not valid" },
  },
  showErrors: false,
};

export const SetsFullOption = Template.bind({});
SetsFullOption.args = {
  setsFullOption: true,
};
