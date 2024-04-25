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
import { SidebarItem } from "./SidebarItem";
import { Cookie } from "@phosphor-icons/react";
var meta = {
    title: "Design System/Navigation/Sidebar/SidebarItem",
    component: SidebarItem,
    argTypes: {
        isActive: { control: "boolean" },
        isDisabled: { control: "boolean" },
        icon: { control: false }
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
    return React.createElement(SidebarItem, __assign({}, args));
};
export var Default = Template.bind({});
Default.args = {};
