import type { Meta, StoryFn } from "@storybook/react";
import React from "react";

import { useForm } from "react-hook-form";
import { CheckboxGroupController } from "./CheckboxGroupController";

const meta = {
  title: "Design System/Forms/Controllers/CheckboxGroupController",
  component: CheckboxGroupController,
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
} as Meta<typeof CheckboxGroupController>;
export default meta;

type FormValues = {
  field: string[];
};
const Template: StoryFn<typeof CheckboxGroupController> = (args) => {
  const form = useForm<FormValues>({ mode: "onChange" });

  return (
    <CheckboxGroupController
      {...args}
      control={form.control}
      id="field"
      options={[
        { label: "value 1", value: "value1" },
        { label: "value 2", value: "value2" },
        { label: "value 3", value: "value3" },
      ]}
    />
  );
};

export const Default = Template.bind({});
Default.args = {};
