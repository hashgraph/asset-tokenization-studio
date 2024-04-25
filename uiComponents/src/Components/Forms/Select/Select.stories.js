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
import { addonLeftInput, addonRightInput, inputArgTypes } from "@/storiesUtils";
import React from "react";
import { Select } from "./Select";
import _omit from "lodash/omit";
import { Spinner } from "@Components/Indicators/Spinner";
var options = [
    { label: "Option 1", value: 1 },
    { label: "Option 2", value: 2 },
];
export default {
    title: "Design System/Forms/Select",
    component: Select,
    args: {
        variant: "outline",
        options: options,
        placeholder: "Select...",
        label: "Select option"
    },
    argTypes: __assign(__assign({}, _omit(inputArgTypes, ["isSuccess"])), { dropdownIndicator: {
            control: false,
            description: "Element to override default arrow icon"
        }, overrideStyles: {
            control: false,
            description: "Used to override chakraStyles of the select"
        }, options: {
            description: "Options rendered in the select"
        } }),
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A9865"
        }
    }
};
var Template = function (args) { return React.createElement(Select, __assign({}, args)); };
export var Small = Template.bind({});
Small.args = {
    size: "sm"
};
export var Medium = Template.bind({});
Medium.args = {
    size: "md"
};
export var Large = Template.bind({});
Large.args = {
    size: "lg"
};
export var WithIconLeft = Template.bind({});
WithIconLeft.args = {
    addonLeft: addonLeftInput.Example1
};
export var WithIconRight = Template.bind({});
WithIconRight.args = {
    addonRight: addonRightInput.OneIcon
};
export var IsDisabled = Template.bind({});
IsDisabled.args = {
    isDisabled: true
};
export var IsInvalid = Template.bind({});
IsInvalid.args = {
    isInvalid: true
};
export var IsLoading = Template.bind({});
IsLoading.args = {
    isLoading: true
};
export var IsLoadingCustom = Template.bind({});
IsLoadingCustom.args = {
    isLoading: true,
    loadingIndicator: React.createElement(Spinner, { color: "error" })
};
export var LongSelect = Template.bind({});
LongSelect.args = {
    options: [
        { label: "Option 1", value: 1 },
        { label: "Option 2", value: 2 },
        { label: "Option 3", value: 1 },
        { label: "Option 4", value: 2 },
        { label: "Option 5", value: 5 },
        { label: "This is a very long option lorem ipsum", value: 6 },
        { label: "Option 7", value: 7 },
        { label: "Option 8", value: 8 },
        { label: "Option 9", value: 9 },
        { label: "Option 10", value: 10 },
    ]
};
