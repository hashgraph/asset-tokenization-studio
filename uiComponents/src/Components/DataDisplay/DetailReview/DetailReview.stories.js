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
import { DetailReview } from "./DetailReview";
import { Link } from "@chakra-ui/react";
var meta = {
    title: "Design System/Data Display/DetailReview",
    component: DetailReview,
    argTypes: {},
    parameters: {
        docs: {}
    },
    args: {
        title: "Title",
        value: "This is the description"
    }
};
export default meta;
export var Template = function (args) { return (React.createElement(DetailReview, __assign({}, args))); };
export var WithCustomComponent = function (args) { return (React.createElement(DetailReview, { title: "title", value: React.createElement(Link, null, "link") })); };
export var WithIsLoading = Template.bind({});
WithIsLoading.args = {
    isLoading: true
};
