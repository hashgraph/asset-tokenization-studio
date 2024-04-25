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
import { InfoDivider } from "./InfoDivider";
var meta = {
    title: "Design System/Data Display/InfoDivider",
    component: InfoDivider,
    parameters: {
        docs: {}
    },
    argTypes: {
        type: { options: ["main", "secondary"], control: { type: "radio" } }
    },
    args: {
        title: "Title",
        type: "main"
    }
};
export default meta;
export var Template = function (args) { return (React.createElement(InfoDivider, __assign({}, args))); };
export var WithTitle = Template.bind({});
export var WithNumber = Template.bind({});
WithNumber.args = {
    number: 3
};
export var WithStep = Template.bind({});
WithStep.args = {
    step: 2
};
export var WithIsLoading = Template.bind({});
WithIsLoading.args = {
    isLoading: true
};
