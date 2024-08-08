import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
import { Sidebar } from "./Sidebar";
import { Cookie, Gear, House, UserPlus } from "@phosphor-icons/react";
import { Box, Stack } from "@chakra-ui/react";
import { SidebarItem } from "./Components/SidebarItem";
import { Button } from "../../Interaction/Button";
import { SidebarDropdownItem } from "./Components/SidebarDropdownItem";
import { SidebarItemWithDropdown } from "./Components/SidebarItemWithDropdown";

const meta = {
  title: "Design System/Navigation/Sidebar",
  component: Sidebar,
  argTypes: {},
  parameters: {},
  args: {
    label: "Item molecule",
    icon: Cookie,
  },
} as Meta<typeof Sidebar>;
export default meta;

const Template: StoryFn<typeof Sidebar> = (args) => {
  return (
    <Box>
      <Sidebar {...args} />
    </Box>
  );
};

export const Default = Template.bind({});
Default.args = {
  topContent: (
    <Stack spacing={6}>
      <SidebarItem label="Home" icon={House} />
      <SidebarItem label="Item molecule" icon={Cookie} />
      <SidebarItem label="Item molecule" icon={Cookie} isActive />
      <SidebarItem label="Item molecule" icon={Cookie} />
      <SidebarItem label="Very very very long text" icon={Cookie} />
      <SidebarItem label="Item molecule" icon={Cookie} isDisabled />
      <SidebarItemWithDropdown
        label="Item section"
        icon={Cookie}
        header={
          <Button variant="secondary" size="md">
            Main action
          </Button>
        }
      >
        <SidebarDropdownItem label="Page 1" icon={UserPlus} isActive />
        <SidebarDropdownItem label="Page 2" icon={UserPlus} />
        <SidebarDropdownItem label="Page 2" icon={UserPlus} isDisabled />
      </SidebarItemWithDropdown>
      <SidebarItemWithDropdown label="Item section" icon={Cookie}>
        <SidebarDropdownItem label="Page 1" icon={UserPlus} />
        <SidebarDropdownItem label="Page 2" icon={UserPlus} isActive={true} />
      </SidebarItemWithDropdown>
    </Stack>
  ),
  bottomContent: <SidebarItem label="Configuration" icon={Gear} />,
};

export const SidebarOnlyTopContent = Template.bind({});
SidebarOnlyTopContent.args = {
  topContent: (
    <Stack spacing={6}>
      <SidebarItem label="Item molecule" icon={Cookie} />
      <SidebarItem label="Item molecule" icon={Cookie} isActive />
      <SidebarItem label="Item molecule" icon={Cookie} isDisabled />
    </Stack>
  ),
};

export const SidebarOnlyBottomContent = Template.bind({});
SidebarOnlyBottomContent.args = {
  bottomContent: <SidebarItem label="Configuration" icon={Gear} />,
};
