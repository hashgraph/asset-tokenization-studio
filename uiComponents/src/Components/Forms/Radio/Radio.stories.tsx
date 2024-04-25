import type { Meta, StoryFn } from "@storybook/react";
import React from "react";

import { Radio } from "./Radio";

const meta = {
  title: "Design System/Forms/Radio",
  component: Radio,
  args: {
    size: "md",
    children: "Hola mundo",
  },
  argTypes: {
    isInvalid: { control: { type: "boolean" } },
    isDisabled: { control: { type: "boolean" } },
    defaultChecked: { control: { type: "boolean" } },
    isChecked: { control: { type: "boolean" } },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1874%3A15429&t=GPCIOt6k4o0cCWIe-4",
    },
    docs: {},
  },
} as Meta<typeof Radio>;
export default meta;

const Template: StoryFn<typeof Radio> = (args) => <Radio {...args} />;

export const WithChildren = Template.bind({});
WithChildren.args = {};

export const IsDisabled = Template.bind({});
IsDisabled.args = {
  isDisabled: true,
};

export const IsChecked = Template.bind({});
IsChecked.args = {
  isChecked: true,
};

export const IsInvalid = Template.bind({});
IsInvalid.args = {
  isInvalid: true,
};

export const DefaultChecked = Template.bind({});
DefaultChecked.args = {
  defaultChecked: true,
};
