import type { Meta, StoryFn } from "@storybook/react";
import React from "react";

import { LineChart } from "./LineChart";

const meta = {
  title: "Design System/Charts/LineChart",
  component: LineChart,
  args: {},
  argTypes: {},
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1273%3A6253",
    },
    docs: {},
  },
} as Meta<typeof LineChart>;
export default meta;

const Template: StoryFn<typeof LineChart> = (args) => <LineChart {...args} />;

const data = [
  {
    key: "2/8",
    value: 200,
  },
  {
    key: "2/14",
    value: 340,
  },
  {
    key: "2/18",
    value: 150,
  },
  {
    key: "2/22",
    value: 390,
  },
  {
    key: "2/22",
    value: 250,
  },
  {
    key: "2/24",
    value: 320,
  },
  {
    key: "3/1",
    value: 200,
  },
];

export const Default = Template.bind({});

Default.args = {
  data,
};
