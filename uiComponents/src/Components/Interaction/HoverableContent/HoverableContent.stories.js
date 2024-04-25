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
import { HoverableContent } from "./HoverableContent";
import React from "react";
import { Box } from "@chakra-ui/react";
var meta = {
    title: "Design System/Interaction/HoverableContent",
    component: HoverableContent,
    args: {
        hiddenContent: React.createElement(Box, { ml: 6 }, "Hello!")
    },
    parameters: {}
};
export default meta;
var Template = function (args) { return (React.createElement(HoverableContent, __assign({}, args),
    React.createElement(Box, null, "Hover to display content"))); };
export var Default = Template.bind({});
Default.args = {};
