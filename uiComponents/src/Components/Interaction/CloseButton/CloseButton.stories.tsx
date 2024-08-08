import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { CloseButton } from "./CloseButton";
import { iconButtonSizes } from "@/storiesUtils";

const meta = {
  title: "Design System/Interaction/CloseButton",
  component: CloseButton,
  argTypes: {
    size: {
      options: iconButtonSizes,
      control: { type: "radio" },
    },
    isDisabled: {
      control: { type: "boolean" },
    },
  },
  args: {
    size: "md",
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A10670",
    },
    docs: {},
  },
} as Meta<typeof CloseButton>;
export default meta;

const Template: StoryFn<typeof CloseButton> = (args) => (
  <CloseButton {...args} />
);

export const Small = Template.bind({});
Small.args = {
  size: "sm",
};

export const Medium = Template.bind({});
Medium.args = {
  size: "md",
};

export const Large = Template.bind({});
Large.args = {
  size: "lg",
};

export const IsDisabled = Template.bind({});
IsDisabled.args = {
  size: "lg",
  isDisabled: true,
};
