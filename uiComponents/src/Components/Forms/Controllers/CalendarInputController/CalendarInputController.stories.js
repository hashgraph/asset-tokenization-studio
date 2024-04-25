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
import { CalendarInputController } from "./CalendarInputController";
import { useForm } from "react-hook-form";
import { inputArgTypes } from "@/storiesUtils";
import { Flex, Text } from "@chakra-ui/react";
import { format } from "date-fns";
import { commonCalendarArgsTypes } from "@/storiesUtils/calendarUtils";
var rulesOptions = {
    Required: { required: "This is required " },
    MaxLength: { maxLength: { value: 5, message: "Max length is 5" } }
};
var meta = {
    title: "Design System/Forms/Controllers/CalendarInputController",
    component: CalendarInputController,
    args: {
        label: "Label",
        placeholder: "Placeholder",
        id: "Name",
        variant: "outline",
        fromDate: new Date(2021, 0, 1),
        toDate: new Date(2023, 11, 31)
    },
    argTypes: __assign(__assign(__assign({}, commonCalendarArgsTypes), inputArgTypes), { control: { control: false }, defaultValue: { control: false }, rules: {
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
        }, value: {
            control: "date"
        } }),
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
    var form = useForm({ mode: "onBlur" });
    var value = form.watch("field");
    return (React.createElement(Flex, { flexDirection: "column" },
        React.createElement(CalendarInputController, __assign({}, args, { id: "field", control: form.control })),
        React.createElement(Text, null, value && format(value, "dd/MM/yyyy HH:mm:ss"))));
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
    onBlur: function () {
        console.log("onBlur fired");
    }
};
export var HideErrors = Template.bind({});
HideErrors.args = {
    rules: { required: "This is required" },
    showErrors: false
};
export var WithDefaultValue = Template.bind({});
WithDefaultValue.args = {
    defaultValue: new Date()
};
