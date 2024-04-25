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
import { Sidebar } from "./Sidebar";
import { Cookie, Gear, House, UserPlus } from "@phosphor-icons/react";
import { Box, Stack } from "@chakra-ui/react";
import { SidebarItem } from "./Components/SidebarItem";
import { Button } from "../../Interaction/Button";
import { SidebarDropdownItem } from "./Components/SidebarDropdownItem";
import { SidebarItemWithDropdown } from "./Components/SidebarItemWithDropdown";
var meta = {
    title: "Design System/Navigation/Sidebar",
    component: Sidebar,
    argTypes: {},
    parameters: {},
    args: {
        label: "Item molecule",
        icon: Cookie
    }
};
export default meta;
var Template = function (args) {
    return (React.createElement(Box, null,
        React.createElement(Sidebar, __assign({}, args))));
};
export var Default = Template.bind({});
Default.args = {
    topContent: (React.createElement(Stack, { spacing: 6 },
        React.createElement(SidebarItem, { label: "Home", icon: House }),
        React.createElement(SidebarItem, { label: "Item molecule", icon: Cookie }),
        React.createElement(SidebarItem, { label: "Item molecule", icon: Cookie, isActive: true }),
        React.createElement(SidebarItem, { label: "Item molecule", icon: Cookie }),
        React.createElement(SidebarItem, { label: "Very very very long text", icon: Cookie }),
        React.createElement(SidebarItem, { label: "Item molecule", icon: Cookie, isDisabled: true }),
        React.createElement(SidebarItemWithDropdown, { label: "Item section", icon: Cookie, header: React.createElement(Button, { variant: "secondary", size: "md" }, "Main action") },
            React.createElement(SidebarDropdownItem, { label: "Page 1", icon: UserPlus, isActive: true }),
            React.createElement(SidebarDropdownItem, { label: "Page 2", icon: UserPlus }),
            React.createElement(SidebarDropdownItem, { label: "Page 2", icon: UserPlus, isDisabled: true })),
        React.createElement(SidebarItemWithDropdown, { label: "Item section", icon: Cookie },
            React.createElement(SidebarDropdownItem, { label: "Page 1", icon: UserPlus }),
            React.createElement(SidebarDropdownItem, { label: "Page 2", icon: UserPlus, isActive: true })))),
    bottomContent: React.createElement(SidebarItem, { label: "Configuration", icon: Gear })
};
export var SidebarOnlyTopContent = Template.bind({});
SidebarOnlyTopContent.args = {
    topContent: (React.createElement(Stack, { spacing: 6 },
        React.createElement(SidebarItem, { label: "Item molecule", icon: Cookie }),
        React.createElement(SidebarItem, { label: "Item molecule", icon: Cookie, isActive: true }),
        React.createElement(SidebarItem, { label: "Item molecule", icon: Cookie, isDisabled: true })))
};
export var SidebarOnlyBottomContent = Template.bind({});
SidebarOnlyBottomContent.args = {
    bottomContent: React.createElement(SidebarItem, { label: "Configuration", icon: Gear })
};
