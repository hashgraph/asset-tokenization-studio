import React from "react";

import type { Meta, StoryFn } from "@storybook/react";
import { Breadcrumb } from "./Breadcrumb";
import { customProps, defaultProps } from "./commonTests";

const meta = {
  title: "Design System/Navigation/Breadcrumb",
  component: Breadcrumb,
  argTypes: {},
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1864-15216&t=gdDySJaKa7oQ5zb9-4",
    },
    docs: {},
  },
  args: {
    ...defaultProps,
  },
} as Meta<typeof Breadcrumb>;
export default meta;

const Template: StoryFn<typeof Breadcrumb> = (args) => <Breadcrumb {...args} />;

export const ShowMaxItems = Template.bind({});
ShowMaxItems.args = {
  showMaxItems: true,
};

export const WithoutShowMaxItems = Template.bind({});
WithoutShowMaxItems.args = {
  showMaxItems: false,
};

export const WithCustomLink = Template.bind({});
WithCustomLink.args = {
  ...customProps,
};

export const WithLoadingItem = Template.bind({});
WithLoadingItem.args = {
  items: [
    ...customProps.items,
    {
      label: "Loading",
      link: "/loading",
      isLoading: true,
    },
  ],
};
