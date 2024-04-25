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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React from "react";
import { Breadcrumb } from "./Breadcrumb";
import { customProps, defaultProps } from "./commonTests";
var meta = {
    title: "Design System/Navigation/Breadcrumb",
    component: Breadcrumb,
    argTypes: {},
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1864-15216&t=gdDySJaKa7oQ5zb9-4"
        },
        docs: {}
    },
    args: __assign({}, defaultProps)
};
export default meta;
var Template = function (args) { return React.createElement(Breadcrumb, __assign({}, args)); };
export var ShowMaxItems = Template.bind({});
ShowMaxItems.args = {
    showMaxItems: true
};
export var WithoutShowMaxItems = Template.bind({});
WithoutShowMaxItems.args = {
    showMaxItems: false
};
export var WithCustomLink = Template.bind({});
WithCustomLink.args = __assign({}, customProps);
export var WithLoadingItem = Template.bind({});
WithLoadingItem.args = {
    items: __spreadArray(__spreadArray([], customProps.items, true), [
        {
            label: "Loading",
            link: "/loading",
            isLoading: true
        },
    ], false)
};
