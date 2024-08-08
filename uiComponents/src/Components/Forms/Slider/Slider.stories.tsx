import type { Meta, StoryFn } from "@storybook/react";
import React from "react";

import { Slider } from "./Slider";

const meta = {
  title: "Design System/Forms/Slider",
  component: Slider,
  argTypes: {
    orientation: {
      control: { type: "radio" },
      options: ["horizontal", "vertical"],
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A9914",
    },
  },
  args: {
    defaultValue: 30,
  },
} as Meta<typeof Slider>;
export default meta;

const Template: StoryFn<typeof Slider> = (args) => <Slider {...args} />;

export const Horizontal = Template.bind({});

Horizontal.args = {
  orientation: "horizontal",
  minW: 50,
  maxW: 200,
};

export const Vertical = Template.bind({});
Vertical.args = {
  orientation: "vertical",
  minH: 32,
  maxH: 200,
};
