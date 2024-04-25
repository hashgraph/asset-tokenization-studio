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
import { CheckboxController } from "./CheckboxController";
import { useForm } from "react-hook-form";
var meta = {
    title: "Design System/Forms/Controllers/CheckboxController",
    component: CheckboxController,
    args: {
        id: "Name"
    },
    argTypes: {},
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
    return (React.createElement(CheckboxController, __assign({}, args, { id: "field", control: form.control }), "I accept"));
};
export var NoValidations = Template.bind({});
NoValidations.args = {};
export var WithValidations = Template.bind({});
WithValidations.args = {
    rules: { required: "This is required" }
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
export var HideErrors = Template.bind({});
HideErrors.args = {
    rules: { required: "This is required" },
    showErrors: false
};
