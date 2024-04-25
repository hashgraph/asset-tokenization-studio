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
import { Slider } from "./Slider";
var meta = {
    title: "Design System/Forms/Slider",
    component: Slider,
    argTypes: {
        orientation: {
            control: { type: "radio" },
            options: ["horizontal", "vertical"]
        }
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A9914"
        }
    },
    args: {
        defaultValue: 30
    }
};
export default meta;
var Template = function (args) { return React.createElement(Slider, __assign({}, args)); };
export var Horizontal = Template.bind({});
Horizontal.args = {
    orientation: "horizontal",
    minW: 50,
    maxW: 200
};
export var Vertical = Template.bind({});
Vertical.args = {
    orientation: "vertical",
    minH: 32,
    maxH: 200
};
