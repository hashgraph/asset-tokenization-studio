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
import { FieldController } from "./FieldController";
import { Box } from "@chakra-ui/react";
var meta = {
    title: "Design System/Forms/Controllers/FieldController",
    component: FieldController,
    args: {},
    argTypes: {
        fieldState: {
            table: {
                disable: true
            },
            control: false
        }
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1503%3A22829&t=4DeUdPmWLzP51oPO-4"
        },
        docs: {}
    }
};
export default meta;
var Template = function (args) {
    return (React.createElement(Box, { bg: "neutral.100", p: 4 },
        React.createElement(FieldController, __assign({}, args),
            React.createElement("input", { type: "text" }))));
};
export var Variant = Template.bind({});
Variant.args = {
    errorMessageVariant: "flushed",
    fieldState: {
        error: { type: "example", message: "This is an error" },
        invalid: true,
        isTouched: true,
        isDirty: true
    }
};
export var WithErrors = Template.bind({});
WithErrors.args = {
    fieldState: {
        error: { type: "example", message: "This is an error" },
        invalid: true,
        isTouched: true,
        isDirty: true
    }
};
