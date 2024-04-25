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
import { ThemeStoryWrapper } from "@Components/story-config";
import { InputNumberController } from "./InputNumberController";
import { useForm } from "react-hook-form";
import { inputArgTypes } from "@/storiesUtils";
import { Title, ArgsTable, PRIMARY_STORY } from "@storybook/addon-docs";
import { MarkdownText } from "@/Components/Foundations/MarkdownText";
var rulesOptions = {
    Required: { required: "This is required " },
    MaxLength: { maxLength: { value: 5, message: "Max length is 5" } }
};
var meta = {
    title: "Design System/Forms/Controllers/InputNumberController",
    component: InputNumberController,
    args: {
        label: "Label",
        placeholder: "Placeholder",
        id: "Name",
        variant: "outline",
        onValueChange: undefined,
        suffix: "€"
    },
    argTypes: __assign(__assign({}, inputArgTypes), { control: { control: false }, defaultValue: { control: false }, rules: {
            options: Object.keys(rulesOptions),
            mapping: rulesOptions,
            control: {
                type: "select",
                labels: {
                    MaxLength: "Max length of 5",
                    Required: "Required field"
                }
            },
            description: "Addon at the right of the input"
        }, onValueChange: { control: false } }),
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1503%3A22829&t=4DeUdPmWLzP51oPO-4"
        },
        docs: {
            page: function () { return (React.createElement(ThemeStoryWrapper, null,
                React.createElement(Title, null),
                React.createElement(MarkdownText, null, "This component uses the library [react-number-format](https://github.com/s-yadav/react-number-format). Please refer to the documentation for more information on the props that InputNumberController can receive."),
                React.createElement(ArgsTable, { story: PRIMARY_STORY }))); }
        }
    }
};
export default meta;
var Template = function (args) {
    var form = useForm({ mode: "onChange" });
    return React.createElement(InputNumberController, __assign({}, args, { id: "field", control: form.control }));
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
export var WithDefaultValue = Template.bind({});
WithDefaultValue.args = {
    defaultValue: 0
};
export var WithMaxValue = Template.bind({});
WithMaxValue.args = {
    maxValue: 100
};
export var WithMinValue = Template.bind({});
WithMinValue.args = {
    minValue: 50
};
export var WithMinAndMaxValue = Template.bind({});
WithMinAndMaxValue.args = {
    minValue: 10,
    maxValue: 20
};
