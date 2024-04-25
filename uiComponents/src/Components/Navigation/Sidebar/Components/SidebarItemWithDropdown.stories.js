var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React from "react";
import { SidebarItemWithDropdown } from "./SidebarItemWithDropdown";
import { Cookie, UserPlus } from "@phosphor-icons/react";
import { SidebarDropdownItem } from "./SidebarDropdownItem";
import { Button } from "@Components/Interaction/Button";
import { Box } from "@chakra-ui/react";
var meta = {
    title: "Design System/Navigation/Sidebar/SidebarItemWithDropdown",
    component: SidebarItemWithDropdown,
    argTypes: {
        isActive: {
            control: "boolean",
            description: "Boolean to specify if the item is active."
        },
        isDisabled: {
            control: "boolean",
            description: "Boolean to specify if the item is disabled."
        },
        icon: { control: false, description: "Icon to show in the item" },
        children: {
            control: false,
            description: "Component `SidebarDropdownItem` should be passed as many times as needed"
        },
        header: {
            control: false,
            description: "Component to render in the header of the dropdown"
        }
    },
    parameters: {
        docs: {}
    },
    args: {
        label: "Item molecule",
        icon: Cookie
    }
};
export default meta;
var Template = function (args) {
    return (React.createElement(Box, { pos: "relative" },
        React.createElement(SidebarItemWithDropdown, __assign({}, args))));
};
export var WithoutHeader = Template.bind({});
WithoutHeader.args = {
    children: (React.createElement(React.Fragment, null,
        React.createElement(SidebarDropdownItem, { label: "Page 1", icon: UserPlus }),
        React.createElement(SidebarDropdownItem, { label: "Page 2", icon: UserPlus, isActive: true })))
};
export var WithHeader = Template.bind({});
WithHeader.args = {
    header: (React.createElement(Button, { variant: "secondary", size: "md" }, "Main action")),
    children: (React.createElement(React.Fragment, null,
        React.createElement(SidebarDropdownItem, { label: "Page 1", icon: UserPlus }),
        React.createElement(SidebarDropdownItem, { label: "Page 2", icon: UserPlus, isActive: true })))
};
