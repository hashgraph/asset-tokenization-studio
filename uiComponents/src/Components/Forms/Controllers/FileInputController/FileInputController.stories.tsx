import type { Meta, StoryFn } from "@storybook/react";
import { FileInputController } from "./FileInputController";
import React from "react";
import type { FieldValues } from "react-hook-form";
import { useForm } from "react-hook-form";

const meta = {
  title: "Design System/Forms/Controllers/FileInputController",
  component: FileInputController,
  argTypes: {},
  args: {},
  parameters: {},
} as Meta<typeof FileInputController>;
export default meta;

const Template: StoryFn<typeof FileInputController> = (args) => {
  const form = useForm<FieldValues>({ mode: "onChange" });

  return (
    <FileInputController
      {...args}
      id="file"
      control={form.control}
      onChange={(val) => {
        console.log("onChange fired", val);
      }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {};
