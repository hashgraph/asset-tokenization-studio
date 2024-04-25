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
import { CircularSlider } from "./CircularSlider";
var meta = {
    title: "Design System/Charts/CircularSlider",
    component: CircularSlider,
    args: {
        size: "sm",
        color: "blue.500",
        value: 40,
        isLoading: false
    },
    argTypes: {
        label: {
            control: { type: "text" }
        },
        value: {
            control: { type: "number" }
        },
        size: {
            options: ["sm", "md"],
            control: { type: "radio" }
        },
        color: {
            control: { type: "color" }
        }
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A8803"
        },
        docs: {}
    }
};
export default meta;
var Template = function (args) { return (React.createElement(CircularSlider, __assign({}, args))); };
export var Small = Template.bind({});
Small.args = {
    size: "sm"
};
export var Medium = Template.bind({});
Medium.args = {
    size: "md"
};
export var WithLabel = Template.bind({});
WithLabel.args = {
    label: "40%"
};
