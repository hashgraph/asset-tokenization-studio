import type { Meta, StoryFn } from "@storybook/react";
import React from "react";

import { BarChart } from "./BarChart";

const meta = {
  title: "Design System/Charts/BarChart",
  component: BarChart,
  argTypes: {},
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=775%3A1702",
    },
    docs: {},
  },
  args: {
    max: 100,
    min: 0,
    value: 60,
    isLoading: false,
  },
} as Meta<typeof BarChart>;
export default meta;

const Template: StoryFn<typeof BarChart> = (args) => <BarChart {...args} />;

export const Default = Template.bind({});

Default.args = {
  data: [
    {
      value: 1,
    },
    {
      value: 10,
    },
    {
      value: 25,
    },
    {
      value: 50,
    },
    {
      value: 75,
    },
    {
      value: 90,
    },
    {
      value: 100,
    },
  ],
};
