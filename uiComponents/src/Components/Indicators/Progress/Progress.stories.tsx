import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { Progress } from "./Progress";

const meta = {
  title: "Design System/Indicators/Progress",
  component: Progress,
  argTypes: {
    value: { control: "number" },
    max: { control: "number" },
    min: { control: "number" },
    size: { control: "select", options: ["xs", "sm", "md", "lg"] },
    hasStripe: { control: "boolean" },
    isAnimated: { control: "boolean" },
    isIndeterminate: { control: "boolean" },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A10606",
    },
    docs: {},
  },
  args: {
    max: 100,
    min: 0,
    value: 60,
    size: "sm",
    hasStripe: false,
    isAnimated: false,
    isIndeterminate: false,
  },
} as Meta<typeof Progress>;
export default meta;

const Template: StoryFn<typeof Progress> = (args) => {
  return <Progress {...args}></Progress>;
};

export const ExtraSmall = Template.bind({});
ExtraSmall.args = {
  value: 30,
  size: "xs",
};

export const Small = Template.bind({});
Small.args = {
  value: 30,
  size: "sm",
};

export const Medium = Template.bind({});
Medium.args = {
  value: 30,
  size: "md",
};

export const Large = Template.bind({});
Large.args = {
  value: 30,
  size: "lg",
};
