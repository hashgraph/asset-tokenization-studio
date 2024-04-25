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
import { Spinner } from "./Spinner";
var meta = {
    title: "Design System/Indicators/Spinner",
    component: Spinner,
    argTypes: {
        size: {
            control: "select",
            options: ["xxs", "xs", "sm", "md", "lg"],
            description: "Size of the spinner"
        }
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=2053-17926&t=3ozoVrWQYvgw1fj3-4"
        },
        docs: {}
    }
};
export default meta;
var Template = function (args) {
    return React.createElement(Spinner, __assign({}, args));
};
export var XXS = Template.bind({});
XXS.args = {
    size: "xxs"
};
export var XS = Template.bind({});
XS.args = {
    size: "xs"
};
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
