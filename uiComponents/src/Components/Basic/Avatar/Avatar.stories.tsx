import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { Avatar } from "./Avatar";

const image =
  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60";

const meta = {
  title: "Design System/Basic/Avatar",
  component: Avatar,
  args: {
    isLoading: false,
  },
  argTypes: {
    size: {
      control: "select",
      options: ["md"],
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1825-13768&t=3ozoVrWQYvgw1fj3-4",
    },
    docs: {},
  },
} as Meta<typeof Avatar>;
export default meta;

const Template: StoryFn<typeof Avatar> = (args) => <Avatar {...args} />;

export const Default = Template.bind({});

export const WithImage = Template.bind({});

WithImage.args = {
  src: image,
};

export const WithBadge = Template.bind({});

WithBadge.args = {
  showBadge: true,
};

export const WithCustomBadgeColor = Template.bind({});

WithCustomBadgeColor.args = {
  showBadge: true,
  badgeColor: "red.500",
};

export const WithInitialsAndBadge = Template.bind({});

WithInitialsAndBadge.args = {
  name: "John Doe",
  showBadge: true,
};

export const WithImageAndBadge = Template.bind({});

WithImageAndBadge.args = {
  src: image,
  name: "John Doe",
  showBadge: true,
};

export const WithIsLoading = Template.bind({});
WithIsLoading.args = {
  isLoading: true,
};
