import type { Meta } from "@storybook/react";
import React from "react";
import { Dropdown } from "./Dropdown";
import { Menu, MenuButton } from "@chakra-ui/react";
import { DropdownItem } from "./Components/DropdownItem";
import { Avatar } from "@/Components/Basic/Avatar";

const meta = {
  title: "Design System/Data Display/Dropdown",
  component: Dropdown,
  argTypes: {},
  parameters: {
    docs: {},
  },
  args: {},
} as Meta<typeof Dropdown>;
export default meta;

export const Default = () => {
  return (
    <Menu isOpen={true}>
      <Dropdown>
        <DropdownItem label="Dropdow Item" isActive />
        <DropdownItem label="Dropdow Item" />
        <DropdownItem label="Dropdow Item" />
        <DropdownItem label="Dropdow Item" />
      </Dropdown>
    </Menu>
  );
};

export const AvatarExample = () => {
  return (
    <Menu>
      <MenuButton>
        <Avatar />
      </MenuButton>
      <Dropdown>
        <DropdownItem label="Dropdow Item" isActive />
        <DropdownItem label="Dropdow Item" />
        <DropdownItem label="Dropdow Item" />
        <DropdownItem label="Dropdow Item" />
      </Dropdown>
    </Menu>
  );
};

export const ShortMenu = () => {
  return (
    <Menu>
      <MenuButton>
        <Avatar />
      </MenuButton>
      <Dropdown>
        <DropdownItem label="1" isActive />
        <DropdownItem label="1" />
        <DropdownItem label="1" />
        <DropdownItem label="1" />
      </Dropdown>
    </Menu>
  );
};
