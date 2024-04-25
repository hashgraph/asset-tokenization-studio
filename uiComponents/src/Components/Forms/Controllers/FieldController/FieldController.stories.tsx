import type { Meta, StoryFn } from "@storybook/react";
import React from "react";

import { FieldController } from "./FieldController";
import { Box } from "@chakra-ui/react";

const meta = {
  title: "Design System/Forms/Controllers/FieldController",
  component: FieldController,
  args: {},
  argTypes: {
    fieldState: {
      table: {
        disable: true,
      },
      control: false,
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1503%3A22829&t=4DeUdPmWLzP51oPO-4",
    },
    docs: {},
  },
} as Meta<typeof FieldController>;
export default meta;

const Template: StoryFn<typeof FieldController> = (args) => {
  return (
    <Box bg="neutral.100" p={4}>
      <FieldController {...args}>
        <input type="text" />
      </FieldController>
    </Box>
  );
};
export const Variant = Template.bind({});
Variant.args = {
  errorMessageVariant: "flushed",
  fieldState: {
    error: { type: "example", message: "This is an error" },
    invalid: true,
    isTouched: true,
    isDirty: true,
  },
};

export const WithErrors = Template.bind({});
WithErrors.args = {
  fieldState: {
    error: { type: "example", message: "This is an error" },
    invalid: true,
    isTouched: true,
    isDirty: true,
  },
};
