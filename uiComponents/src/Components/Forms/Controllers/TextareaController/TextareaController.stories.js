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
import { TextareaController } from "./TextareaController";
import { useForm } from "react-hook-form";
var meta = {
    title: "Design System/Forms/Controllers/TextareaController",
    component: TextareaController,
    args: {
        label: "Hello",
        placeholder: "Hello",
        id: "Name",
        variant: "outline"
    },
    argTypes: {},
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
    var form = useForm({
        mode: "onChange"
    });
    return React.createElement(TextareaController, __assign({}, args, { id: "field", control: form.control }));
};
export var NoValidations = Template.bind({});
NoValidations.args = {};
export var WithValidations = Template.bind({});
WithValidations.args = {
    rules: { required: "This is required" }
};
export var ShowIsSuccess = Template.bind({});
ShowIsSuccess.args = {
    showIsSuccess: true
};
export var WithMaxLength = Template.bind({});
WithMaxLength.args = {
    rules: { required: "This is required" },
    maxLength: 500
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
