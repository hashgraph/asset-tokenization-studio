import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { DropdownItem } from "./DropdownItem";
import { CurrencyCircleDollar } from "@phosphor-icons/react";
import { Menu } from "@chakra-ui/react";

const meta = {
  title: "Design System/Data Display/Dropdown/DropdownItem",
  component: DropdownItem,
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
    icon: CurrencyCircleDollar,
  },
} as Meta<typeof DropdownItem>;
export default meta;

const Template: StoryFn<typeof DropdownItem> = (args) => {
  return (
    <Menu>
      <DropdownItem {...args} />
    </Menu>
  );
};

export const Default = Template.bind({});
Default.args = {};

export const WithoutIcon = Template.bind({});
WithoutIcon.args = {
  icon: null,
};
