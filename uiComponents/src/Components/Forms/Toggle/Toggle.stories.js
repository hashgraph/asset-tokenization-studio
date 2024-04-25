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
import { Button } from "@Components/Interaction/Button";
import { linkTo } from "@storybook/addon-links";
import React from "react";
import { Toggle } from "./Toggle";
var meta = {
    title: "Design System/Forms/Toggle",
    component: Toggle,
    argTypes: {
        isDisabled: {
            control: { type: "boolean" },
            description: "Boolean to specify if the input is disabled."
        },
        isInvalid: {
            control: { type: "boolean" },
            description: "Boolean to specify if the input is invalid."
        },
        size: {
            control: false,
            description: "The size of the toggle. Must be defined in the theme (inside Switch component)"
        },
        variant: {
            description: "The variant of the toggle. Must be defined in the theme (inside Switch component)"
        },
        label: { description: "The label of the toggle" }
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1874%3A15429&t=GPCIOt6k4o0cCWIe-4"
        },
        docs: {}
    },
    args: {
        size: "md"
    }
};
export default meta;
var Template = function (args) {
    return React.createElement(Toggle, __assign({}, args));
};
export var Simple = Template.bind({});
Simple.args = {};
export var IsDisabled = Template.bind({});
IsDisabled.args = {
    isDisabled: true
};
export var IsInvalid = Template.bind({});
IsInvalid.args = {
    isInvalid: true
};
export var Compound = Template.bind({});
Compound.args = {
    label: "Click to Toggle! :)"
};
export var ControlledToggle = function () { return (React.createElement(Button, { onClick: linkTo("Design System/Forms/Controllers/ToggleController") }, "Check out the ToggleController component Stories")); };
