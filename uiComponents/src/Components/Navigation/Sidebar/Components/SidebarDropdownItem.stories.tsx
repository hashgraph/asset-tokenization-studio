import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { SidebarDropdownItem } from "./SidebarDropdownItem";
import { Cookie } from "@phosphor-icons/react";
import { Menu } from "@chakra-ui/react";

const meta = {
  title: "Design System/Navigation/Sidebar/SidebarDropdownItem",
  component: SidebarDropdownItem,
  argTypes: {
    isActive: {
      control: "boolean",
      description: "Boolean to specify if the item is active.",
    },
    isDisabled: {
      control: "boolean",
      description: "Boolean to specify if the item is disabled.",
    },
    icon: { control: false, description: "Icon to show in the item" },
  },
  parameters: {
    docs: {},
  },
  args: {
    label: "Item molecule",
    icon: Cookie,
  },
} as Meta<typeof SidebarDropdownItem>;
export default meta;

const Template: StoryFn<typeof SidebarDropdownItem> = (args) => {
  return (
    <Menu>
      <SidebarDropdownItem {...args} />
    </Menu>
  );
};

export const Default = Template.bind({});
Default.args = {};

export const WithoutIcon = Template.bind({});
WithoutIcon.args = {
  icon: null,
};
