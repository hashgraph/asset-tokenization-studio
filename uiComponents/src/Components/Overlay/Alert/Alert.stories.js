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
import { Box } from "@chakra-ui/react";
import React from "react";
import { Alert } from "./Alert";
var meta = {
    title: "Design System/Overlay/Alert",
    component: Alert,
    argTypes: {
        status: {
            options: ["info", "warning", "error", "success"],
            control: { type: "select" }
        },
        isInline: { control: { type: "boolean" } },
        variant: {
            options: ["subtle", "solid", "left-accent"],
            control: { type: "select" }
        }
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A10080"
        },
        docs: {}
    },
    args: {
        onClose: function () {
            console.log("onClose");
        },
        status: "info",
        description: "Toast description",
        variant: "subtle"
    }
};
export default meta;
var Template = function (args) {
    return React.createElement(Alert, __assign({}, args));
};
export var TemplateWithCustomContent = function () {
    return (React.createElement(Alert, null,
        React.createElement(Box, { color: "blue", fontWeight: "bold" }, "Custom text"),
        React.createElement(Box, null, "Custom text 2")));
};
export var Error = Template.bind({});
Error.args = {
    status: "error",
    title: "Error title"
};
export var Info = Template.bind({});
Info.args = {
    status: "info",
    title: "Info title"
};
export var Success = Template.bind({});
Success.args = {
    status: "success",
    title: "Success title"
};
export var Warning = Template.bind({});
Warning.args = {
    status: "warning",
    title: "Warning title"
};
export var Loading = Template.bind({});
Loading.args = {
    status: "loading",
    title: "Loading title"
};
export var ErrorLeftAccent = Template.bind({});
ErrorLeftAccent.args = {
    status: "error",
    variant: "leftAccent"
};
export var WarningLeftAccent = Template.bind({});
WarningLeftAccent.args = {
    status: "warning",
    variant: "leftAccent"
};
export var InfoLeftAccent = Template.bind({});
InfoLeftAccent.args = {
    status: "info",
    variant: "leftAccent"
};
export var SuccessLeftAccent = Template.bind({});
SuccessLeftAccent.args = {
    status: "success",
    variant: "leftAccent"
};
export var LoadingLeftAccent = Template.bind({});
LoadingLeftAccent.args = {
    status: "loading",
    variant: "leftAccent"
};
export var CustomChildren = function () { return (React.createElement(Alert, null,
    React.createElement(Box, { color: "blue", fontWeight: "bold" }, "Custom text"),
    React.createElement(Box, null, "Custom text 2"))); };
