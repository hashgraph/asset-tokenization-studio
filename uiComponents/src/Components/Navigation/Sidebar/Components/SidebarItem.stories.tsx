import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { SidebarItem } from "./SidebarItem";
import { Cookie } from "@phosphor-icons/react";

const meta = {
  title: "Design System/Navigation/Sidebar/SidebarItem",
  component: SidebarItem,
  argTypes: {
    isActive: { control: "boolean" },
    isDisabled: { control: "boolean" },
    icon: { control: false },
  },
  parameters: {
    docs: {},
  },
  args: {
    label: "Item molecule",
    icon: Cookie,
  },
} as Meta<typeof SidebarItem>;
export default meta;

const Template: StoryFn<typeof SidebarItem> = (args) => {
  return <SidebarItem {...args} />;
};

export const Default = Template.bind({});
Default.args = {};
