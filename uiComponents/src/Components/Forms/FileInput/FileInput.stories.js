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
import { FileInput } from "./FileInput";
import React, { useState } from "react";
import { Box } from "@chakra-ui/react";
import { FileCard } from "@Components/DataDisplay/FileCard";
import { linkTo } from "@storybook/addon-links";
import { Button } from "@Components/Interaction/Button";
var meta = {
    title: "Design System/Forms/FileInput",
    component: FileInput,
    argTypes: {},
    args: {},
    parameters: {}
};
export default meta;
var Template = function (args) {
    var _a = useState(null), file = _a[0], setFile = _a[1];
    var handleFile = function (fileSelected) {
        setFile(fileSelected);
    };
    return (React.createElement(Box, { w: "full" },
        React.createElement(FileInput, __assign({}, args, { onChange: handleFile })),
        React.createElement(Box, { w: "full", mt: 5 }, file && React.createElement(FileCard, { file: file, onRemove: function () { return setFile(null); } }))));
};
export var Default = Template.bind({});
Default.args = {};
export var OnlyPDFFile = Template.bind({});
OnlyPDFFile.args = {
    acceptedFileTypes: {
        "application/pdf": [".pdf"]
    }
};
export var Disabled = Template.bind({});
Disabled.args = {
    isDisabled: true
};
export var Invalid = Template.bind({});
Invalid.args = {
    isInvalid: true
};
export var FileInputController = function () { return (React.createElement(Button, { onClick: linkTo("Design System/Forms/Controllers/FileInputController") }, "Check out the FileInputController component Stories")); };
