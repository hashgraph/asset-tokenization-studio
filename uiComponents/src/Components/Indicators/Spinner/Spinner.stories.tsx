import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { Spinner } from "./Spinner";

const meta = {
  title: "Design System/Indicators/Spinner",
  component: Spinner,
  argTypes: {
    size: {
      control: "select",
      options: ["xxs", "xs", "sm", "md", "lg"],
      description: "Size of the spinner",
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=2053-17926&t=3ozoVrWQYvgw1fj3-4",
    },
    docs: {},
  },
} as Meta<typeof Spinner>;
export default meta;

const Template: StoryFn<typeof Spinner> = (args) => {
  return <Spinner {...args} />;
};

export const XXS = Template.bind({});
XXS.args = {
  size: "xxs",
};

export const XS = Template.bind({});
XS.args = {
  size: "xs",
};

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
