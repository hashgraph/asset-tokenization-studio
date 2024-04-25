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
import { Icon } from "@/Components/Foundations/Icon";
import { Checkbox } from "./Checkbox";
import { linkTo } from "@storybook/addon-links";
import { Button } from "@Components/Interaction/Button";
import { HouseLine } from "@phosphor-icons/react";
var meta = {
    title: "Design System/Forms/Checkbox",
    component: Checkbox,
    args: {
        variant: "square",
        size: "md"
    },
    argTypes: {
        children: { control: { type: "text" } },
        icon: { control: { type: null } },
        isInvalid: { control: { type: "boolean" } },
        isDisabled: { control: { type: "boolean" } },
        defaultChecked: { control: { type: "boolean" } }
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1874%3A15429&t=GPCIOt6k4o0cCWIe-4"
        },
        docs: {}
    }
};
export default meta;
var Template = function (args) { return React.createElement(Checkbox, __assign({}, args)); };
export var WithChildren = Template.bind({});
WithChildren.args = {
    children: "I accept the Terms and Conditions & Privacy Policy"
};
export var WithOtherIcon = Template.bind({});
WithOtherIcon.args = {
    icon: React.createElement(Icon, { as: HouseLine })
};
export var IsDisabled = Template.bind({});
IsDisabled.args = {
    isDisabled: true
};
export var IsInvalid = Template.bind({});
IsInvalid.args = {
    isInvalid: true
};
export var CheckboxController = function () { return (React.createElement(Button, { onClick: linkTo("Design System/Forms/Controllers/CheckboxController") }, "Check out the CheckboxController component Stories")); };
