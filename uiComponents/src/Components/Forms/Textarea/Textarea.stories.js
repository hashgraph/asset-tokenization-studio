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
import { Button } from "@Components/Interaction/Button";
import { linkTo } from "@storybook/addon-links";
import React from "react";
import { Textarea } from "./Textarea";
var meta = {
    title: "Design System/Forms/Textarea",
    component: Textarea,
    args: {
        placeholder: "Placeholder",
        label: "Label"
    },
    argTypes: {
        showRequired: {
            control: { type: "boolean" },
            description: "Boolean that toggles whether to show the * if it is required."
        },
        isRequired: {
            control: { type: "boolean" },
            description: "Boolean to specify that the input is required."
        },
        isDisabled: {
            control: { type: "boolean" },
            description: "Boolean to specify if the input is disabled."
        },
        isSuccess: {
            control: { type: "boolean" },
            description: "Boolean to specify that the input is valid and success."
        },
        placeholder: {
            description: "Placeholder of the input."
        },
        label: {
            description: "Label of the input."
        },
        variant: {
            control: false,
            description: "Variant of the input. Must be defined in the theme."
        }
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1503%3A22829&t=CYTpHR0mFDJMv5GO-4"
        },
        docs: {}
    }
};
export default meta;
var Template = function (args) { return React.createElement(Textarea, __assign({}, args)); };
export var Default = Template.bind({});
export var Disabled = Template.bind({});
Disabled.args = {
    isDisabled: true
};
export var Invalid = Template.bind({});
Invalid.args = {
    isInvalid: true
};
export var Valid = Template.bind({});
Valid.args = {
    isSuccess: true
};
export var WithMaxLength = Template.bind({});
WithMaxLength.args = {
    maxLength: 100
};
export var ControlledTextarea = function () { return (React.createElement(Button, { onClick: linkTo("Design System/Forms/Controllers/TextareaController") }, "Check out the TextareaController component stories")); };
