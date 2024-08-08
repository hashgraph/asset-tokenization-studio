import React from "react";
import { Box } from "@chakra-ui/react";
import type { Meta, StoryFn } from "@storybook/react";
import { ClipboardButton } from "./ClipboardButton";

const meta = {
  title: "Design System/Interaction/ClipboardButton",
  component: ClipboardButton,
  argTypes: {
    value: {
      control: {
        type: "text",
      },
      description: "Text to copy to clipboard",
    },
    label: {
      control: {
        type: "text",
      },
      description: "Label to show when copy to clipboard",
    },
  },
  parameters: {
    docs: {},
  },
  args: {
    value: "Copied from clipboard",
    label: "",
  },
} as Meta<typeof ClipboardButton>;
export default meta;

const Template: StoryFn<typeof ClipboardButton> = (args) => (
  <Box maxWidth="50px">
    <ClipboardButton {...args} />
  </Box>
);

export const WithoutLabelTooltip = Template.bind({});
WithoutLabelTooltip.args = {};
