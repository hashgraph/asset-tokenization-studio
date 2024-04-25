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
import { CloseButton } from "./CloseButton";
import { iconButtonSizes } from "@/storiesUtils";
var meta = {
    title: "Design System/Interaction/CloseButton",
    component: CloseButton,
    argTypes: {
        size: {
            options: iconButtonSizes,
            control: { type: "radio" }
        },
        isDisabled: {
            control: { type: "boolean" }
        }
    },
    args: {
        size: "md"
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A10670"
        },
        docs: {}
    }
};
export default meta;
var Template = function (args) { return (React.createElement(CloseButton, __assign({}, args))); };
export var Small = Template.bind({});
Small.args = {
    size: "sm"
};
export var Medium = Template.bind({});
Medium.args = {
    size: "md"
};
export var Large = Template.bind({});
Large.args = {
    size: "lg"
};
export var IsDisabled = Template.bind({});
IsDisabled.args = {
    size: "lg",
    isDisabled: true
};
