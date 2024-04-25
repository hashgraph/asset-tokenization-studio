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
import { ToggleController } from "./ToggleController";
import { useForm } from "react-hook-form";
var meta = {
    title: "Design System/Forms/Controllers/ToggleController",
    component: ToggleController,
    args: {
        label: "Hello"
    },
    argTypes: {
        control: { control: false },
        defaultValue: { control: false },
        rules: { control: false },
        isDisabled: {
            control: { type: "boolean" },
            description: "Boolean to specify if the input is disabled."
        },
        isInvalid: {
            control: { type: "boolean" },
            description: "Boolean to specify if the input is invalid."
        },
        size: {
            control: false,
            description: "The size of the toggle. Must be defined in the theme (inside Switch component)"
        },
        variant: {
            description: "The variant of the toggle. Must be defined in the theme (inside Switch component)"
        },
        label: { description: "The label of the toggle" }
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1874%3A15429&t=4DeUdPmWLzP51oPO-4"
        },
        docs: {}
    }
};
export default meta;
var Template = function (args) {
    var form = useForm({
        mode: "onChange"
    });
    return React.createElement(ToggleController, __assign({}, args, { id: "toggle", control: form.control }));
};
export var NoValidations = Template.bind({});
NoValidations.args = {};
export var WithValidations = Template.bind({});
WithValidations.args = {
    rules: { validate: { valid: function (val) { return !!val; } } }
};
export var OnChangeCustom = Template.bind({});
OnChangeCustom.args = {
    onChange: function (e) {
        console.log("onChange fired", e);
    }
};
export var OnBlurCustom = Template.bind({});
OnBlurCustom.args = {
    onBlur: function (e) {
        console.log("onBlur fired", e);
    }
};
