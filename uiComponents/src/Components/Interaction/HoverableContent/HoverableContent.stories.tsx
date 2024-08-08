import type { Meta, StoryFn } from "@storybook/react";
import { HoverableContent } from "./HoverableContent";
import React from "react";
import { Box } from "@chakra-ui/react";

const meta = {
  title: "Design System/Interaction/HoverableContent",
  component: HoverableContent,
  args: {
    hiddenContent: <Box ml={6}>Hello!</Box>,
  },
  parameters: {},
} as Meta<typeof HoverableContent>;
export default meta;

const Template: StoryFn<typeof HoverableContent> = (args) => (
  <HoverableContent {...args}>
    <Box>Hover to display content</Box>
  </HoverableContent>
);

export const Default = Template.bind({});
Default.args = {};
