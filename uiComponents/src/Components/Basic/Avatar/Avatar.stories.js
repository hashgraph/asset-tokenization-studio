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
import { Avatar } from "./Avatar";
var image = "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60";
var meta = {
    title: "Design System/Basic/Avatar",
    component: Avatar,
    args: {
        isLoading: false
    },
    argTypes: {
        size: {
            control: "select",
            options: ["md"]
        }
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1825-13768&t=3ozoVrWQYvgw1fj3-4"
        },
        docs: {}
    }
};
export default meta;
var Template = function (args) { return React.createElement(Avatar, __assign({}, args)); };
export var Default = Template.bind({});
export var WithImage = Template.bind({});
WithImage.args = {
    src: image
};
export var WithBadge = Template.bind({});
WithBadge.args = {
    showBadge: true
};
export var WithCustomBadgeColor = Template.bind({});
WithCustomBadgeColor.args = {
    showBadge: true,
    badgeColor: "red.500"
};
export var WithInitialsAndBadge = Template.bind({});
WithInitialsAndBadge.args = {
    name: "John Doe",
    showBadge: true
};
export var WithImageAndBadge = Template.bind({});
WithImageAndBadge.args = {
    src: image,
    name: "John Doe",
    showBadge: true
};
export var WithIsLoading = Template.bind({});
WithIsLoading.args = {
    isLoading: true
};
