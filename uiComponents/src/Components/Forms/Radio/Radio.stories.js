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
import { Radio } from "./Radio";
var meta = {
    title: "Design System/Forms/Radio",
    component: Radio,
    args: {
        size: "md",
        children: "Hola mundo"
    },
    argTypes: {
        isInvalid: { control: { type: "boolean" } },
        isDisabled: { control: { type: "boolean" } },
        defaultChecked: { control: { type: "boolean" } },
        isChecked: { control: { type: "boolean" } }
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
var Template = function (args) { return React.createElement(Radio, __assign({}, args)); };
export var WithChildren = Template.bind({});
WithChildren.args = {};
export var IsDisabled = Template.bind({});
IsDisabled.args = {
    isDisabled: true
};
export var IsChecked = Template.bind({});
IsChecked.args = {
    isChecked: true
};
export var IsInvalid = Template.bind({});
IsInvalid.args = {
    isInvalid: true
};
export var DefaultChecked = Template.bind({});
DefaultChecked.args = {
    defaultChecked: true
};
