import type { Meta, StoryFn } from "@storybook/react";
import React from "react";

import { CircularSlider } from "./CircularSlider";

const meta = {
  title: "Design System/Charts/CircularSlider",
  component: CircularSlider,
  args: {
    size: "sm",
    color: "blue.500",
    value: 40,
    isLoading: false,
  },
  argTypes: {
    label: {
      control: { type: "text" },
    },
    value: {
      control: { type: "number" },
    },
    size: {
      options: ["sm", "md"],
      control: { type: "radio" },
    },
    color: {
      control: { type: "color" },
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A8803",
    },
    docs: {},
  },
} as Meta<typeof CircularSlider>;
export default meta;

const Template: StoryFn<typeof CircularSlider> = (args) => (
  <CircularSlider {...args} />
);

export const Small = Template.bind({});
Small.args = {
  size: "sm",
};

export const Medium = Template.bind({});
Medium.args = {
  size: "md",
};

export const WithLabel = Template.bind({});
WithLabel.args = {
  label: "40%",
};
