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
import { Progress } from "./Progress";
var meta = {
    title: "Design System/Indicators/Progress",
    component: Progress,
    argTypes: {
        value: { control: "number" },
        max: { control: "number" },
        min: { control: "number" },
        size: { control: "select", options: ["xs", "sm", "md", "lg"] },
        hasStripe: { control: "boolean" },
        isAnimated: { control: "boolean" },
        isIndeterminate: { control: "boolean" }
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A10606"
        },
        docs: {}
    },
    args: {
        max: 100,
        min: 0,
        value: 60,
        size: "sm",
        hasStripe: false,
        isAnimated: false,
        isIndeterminate: false
    }
};
export default meta;
var Template = function (args) {
    return React.createElement(Progress, __assign({}, args));
};
export var ExtraSmall = Template.bind({});
ExtraSmall.args = {
    value: 30,
    size: "xs"
};
export var Small = Template.bind({});
Small.args = {
    value: 30,
    size: "sm"
};
export var Medium = Template.bind({});
Medium.args = {
    value: 30,
    size: "md"
};
export var Large = Template.bind({});
Large.args = {
    value: 30,
    size: "lg"
};
