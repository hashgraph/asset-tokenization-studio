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
import { Box } from "@chakra-ui/react";
import { ClipboardButton } from "./ClipboardButton";
var meta = {
    title: "Design System/Interaction/ClipboardButton",
    component: ClipboardButton,
    argTypes: {
        value: {
            control: {
                type: "text"
            },
            description: "Text to copy to clipboard"
        },
        label: {
            control: {
                type: "text"
            },
            description: "Label to show when copy to clipboard"
        }
    },
    parameters: {
        docs: {}
    },
    args: {
        value: "Copied from clipboard",
        label: ""
    }
};
export default meta;
var Template = function (args) { return (React.createElement(Box, { maxWidth: "50px" },
    React.createElement(ClipboardButton, __assign({}, args)))); };
export var WithoutLabelTooltip = Template.bind({});
WithoutLabelTooltip.args = {};
