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
import { Stack as ChakraStack } from "@chakra-ui/react";
import React from "react";
import { Radio } from "../Radio/Radio";
import { RadioGroup } from "./RadioGroup";
import { linkTo } from "@storybook/addon-links";
import { Button } from "@Components/Interaction/Button";
var meta = {
    title: "Design System/Forms/RadioGroup",
    component: RadioGroup,
    args: {
        children: (React.createElement(ChakraStack, { align: "flex-start" },
            React.createElement(Radio, { value: "check1" }, "Check1"),
            React.createElement(Radio, { value: "check2" }, "Check2"),
            React.createElement(Radio, { value: "check3" }, "Check3")))
    },
    argTypes: {
        isDisabled: { control: { type: "boolean" } },
        defaultValue: { control: { type: "text" } },
        name: { control: { type: "text" } }
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1874%3A15429&t=GPCIOt6k4o0cCWIe-4"
        },
        docs: {}
    }
};
export default meta;
var Template = function (args) { return React.createElement(RadioGroup, __assign({}, args)); };
export var DefaultValue = Template.bind({});
DefaultValue.args = {
    defaultValue: "check2"
};
export var IsDisabled = Template.bind({});
IsDisabled.args = {
    isDisabled: true
};
export var ControlledRadioGroup = function () { return (React.createElement(Button, { onClick: linkTo("Design System/Forms/Controllers/RadioGroupController") }, "Check out the RadioGroupController component Stories")); };
