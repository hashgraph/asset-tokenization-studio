import React from "react";
import { Dropdown } from "./Dropdown";
import { Menu, MenuButton } from "@chakra-ui/react";
import { DropdownItem } from "./Components/DropdownItem";
import { Avatar } from "@/Components/Basic/Avatar";
var meta = {
    title: "Design System/Data Display/Dropdown",
    component: Dropdown,
    argTypes: {},
    parameters: {
        docs: {}
    },
    args: {}
};
export default meta;
export var Default = function () {
    return (React.createElement(Menu, { isOpen: true },
        React.createElement(Dropdown, null,
            React.createElement(DropdownItem, { label: "Dropdow Item", isActive: true }),
            React.createElement(DropdownItem, { label: "Dropdow Item" }),
            React.createElement(DropdownItem, { label: "Dropdow Item" }),
            React.createElement(DropdownItem, { label: "Dropdow Item" }))));
};
export var AvatarExample = function () {
    return (React.createElement(Menu, null,
        React.createElement(MenuButton, null,
            React.createElement(Avatar, null)),
        React.createElement(Dropdown, null,
            React.createElement(DropdownItem, { label: "Dropdow Item", isActive: true }),
            React.createElement(DropdownItem, { label: "Dropdow Item" }),
            React.createElement(DropdownItem, { label: "Dropdow Item" }),
            React.createElement(DropdownItem, { label: "Dropdow Item" }))));
};
export var ShortMenu = function () {
    return (React.createElement(Menu, null,
        React.createElement(MenuButton, null,
            React.createElement(Avatar, null)),
        React.createElement(Dropdown, null,
            React.createElement(DropdownItem, { label: "1", isActive: true }),
            React.createElement(DropdownItem, { label: "1" }),
            React.createElement(DropdownItem, { label: "1" }),
            React.createElement(DropdownItem, { label: "1" }))));
};
