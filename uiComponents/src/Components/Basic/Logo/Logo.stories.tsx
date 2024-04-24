import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { Logo } from "./Logo";

const meta = {
  title: "Design System/Basic/Logo",
  component: Logo,
  argTypes: {
    variant: {
      control: false,
      description: "The variant of the Logo. Must be defined in the theme",
    },
    size: {
      options: ["full", "iso"],
      control: { type: "select" },
      description: "Size of the logo. Can be 'full' or 'iso'",
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1826-13793&t=3ozoVrWQYvgw1fj3-4",
    },
    docs: {},
  },
} as Meta<typeof Logo>;
export default meta;

const Template: StoryFn<typeof Logo> = (args) => {
  return <Logo {...args} />;
};

export const Full = Template.bind({});
Full.args = {
  size: "full",
};

export const Iso = Template.bind({});
Iso.args = {
  size: "iso",
};
