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
import { useForm } from "react-hook-form";
import { RadioGroupController } from "./RadioGroupController";
var meta = {
    title: "Design System/Forms/Controllers/RadioGroupController",
    component: RadioGroupController,
    args: {
        options: [
            { label: "One", value: "1" },
            { label: "Two", value: "2" },
            { label: "Three", value: "3" },
        ]
    },
    argTypes: {
        isDisabled: { control: { type: "boolean" } },
        defaultValue: { control: { type: "text" } },
        id: { control: { type: "text" } }
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
var Template = function (args) {
    var form = useForm({ mode: "onChange" });
    return (React.createElement(RadioGroupController, __assign({}, args, { id: "field", control: form.control, gap: 3, display: "flex" })));
};
export var NoValidations = Template.bind({});
NoValidations.args = {};
export var WithValidations = Template.bind({});
WithValidations.args = {
    rules: {
        validate: {
            notTwoValue: function (value) {
                return value !== "2" || "This value is not valid";
            }
        }
    }
};
export var ShowingErrorMessage = Template.bind({});
ShowingErrorMessage.args = {
    showErrors: true,
    rules: {
        validate: {
            notTwoValue: function (value) {
                return value !== "2" || "This value is not valid";
            }
        }
    }
};
export var IsDisabled = Template.bind({});
IsDisabled.args = {
    isDisabled: true
};
export var DefaultValue = Template.bind({});
DefaultValue.args = {
    defaultValue: "3"
};
