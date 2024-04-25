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
import { SelectController } from "./SelectController";
import { useForm } from "react-hook-form";
var meta = {
    title: "Design System/Forms/Controllers/SelectController",
    component: SelectController,
    args: {
        label: "Hello",
        placeholder: "Hello",
        id: "Name"
    },
    argTypes: {},
    parameters: {
        docs: {}
    }
};
export default meta;
var Template = function (args) {
    var form = useForm({ mode: "onChange" });
    return (React.createElement(SelectController, __assign({}, args, { id: "field", label: "Label example", control: form.control, options: [
            { value: 1, label: "One" },
            { value: 2, label: "Two" },
            { value: 3, label: "Three" },
        ], onChange: function (val) {
            console.log("onChange fired", val);
        } })));
};
export var NoValidations = Template.bind({});
NoValidations.args = {};
export var WithValidations = Template.bind({});
WithValidations.args = {
    rules: {
        required: true,
        validate: { notSecond: function (val) { return val !== 2 || "Option not valid"; } }
    }
};
export var HideErrors = Template.bind({});
HideErrors.args = {
    rules: {
        required: true,
        validate: { notSecond: function (val) { return val !== 2 || "Option not valid"; } }
    },
    showErrors: false
};
export var SetsFullOption = Template.bind({});
SetsFullOption.args = {
    setsFullOption: true
};
