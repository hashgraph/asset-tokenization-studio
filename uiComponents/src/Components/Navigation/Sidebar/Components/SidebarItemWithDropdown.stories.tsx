import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { SidebarItemWithDropdown } from "./SidebarItemWithDropdown";
import { Cookie, UserPlus } from "@phosphor-icons/react";
import { SidebarDropdownItem } from "./SidebarDropdownItem";
import { Button } from "@Components/Interaction/Button";
import { Box } from "@chakra-ui/react";

const meta = {
  title: "Design System/Navigation/Sidebar/SidebarItemWithDropdown",
  component: SidebarItemWithDropdown,
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
    children: {
      control: false,
      description:
        "Component `SidebarDropdownItem` should be passed as many times as needed",
    },
    header: {
      control: false,
      description: "Component to render in the header of the dropdown",
    },
  },
  parameters: {
    docs: {},
  },
  args: {
    label: "Item molecule",
    icon: Cookie,
  },
} as Meta<typeof SidebarItemWithDropdown>;
export default meta;

const Template: StoryFn<typeof SidebarItemWithDropdown> = (args) => {
  return (
    <Box pos="relative">
      <SidebarItemWithDropdown {...args} />
    </Box>
  );
};

export const WithoutHeader = Template.bind({});
WithoutHeader.args = {
  children: (
    <>
      <SidebarDropdownItem label="Page 1" icon={UserPlus} />
      <SidebarDropdownItem label="Page 2" icon={UserPlus} isActive={true} />
    </>
  ),
};

export const WithHeader = Template.bind({});
WithHeader.args = {
  header: (
    <Button variant="secondary" size="md">
      Main action
    </Button>
  ),
  children: (
    <>
      <SidebarDropdownItem label="Page 1" icon={UserPlus} />
      <SidebarDropdownItem label="Page 2" icon={UserPlus} isActive={true} />
    </>
  ),
};
