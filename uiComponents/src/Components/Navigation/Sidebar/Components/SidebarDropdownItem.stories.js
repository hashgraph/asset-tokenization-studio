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
import { SidebarDropdownItem } from "./SidebarDropdownItem";
import { Cookie } from "@phosphor-icons/react";
import { Menu } from "@chakra-ui/react";
var meta = {
    title: "Design System/Navigation/Sidebar/SidebarDropdownItem",
    component: SidebarDropdownItem,
    argTypes: {
        isActive: {
            control: "boolean",
            description: "Boolean to specify if the item is active."
        },
        isDisabled: {
            control: "boolean",
            description: "Boolean to specify if the item is disabled."
        },
        icon: { control: false, description: "Icon to show in the item" }
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
    return (React.createElement(Menu, null,
        React.createElement(SidebarDropdownItem, __assign({}, args))));
};
export var Default = Template.bind({});
Default.args = {};
export var WithoutIcon = Template.bind({});
WithoutIcon.args = {
    icon: null
};
