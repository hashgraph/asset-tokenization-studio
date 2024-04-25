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
import { Logo } from "./Logo";
var meta = {
    title: "Design System/Basic/Logo",
    component: Logo,
    argTypes: {
        variant: {
            control: false,
            description: "The variant of the Logo. Must be defined in the theme"
        },
        size: {
            options: ["full", "iso"],
            control: { type: "select" },
            description: "Size of the logo. Can be 'full' or 'iso'"
        }
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1826-13793&t=3ozoVrWQYvgw1fj3-4"
        },
        docs: {}
    }
};
export default meta;
var Template = function (args) {
    return React.createElement(Logo, __assign({}, args));
};
export var Full = Template.bind({});
Full.args = {
    size: "full"
};
export var Iso = Template.bind({});
Iso.args = {
    size: "iso"
};
