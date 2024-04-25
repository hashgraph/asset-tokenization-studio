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
import { PasswordController } from "./PasswordController";
import { useForm } from "react-hook-form";
import { Icon } from "@/Components/Foundations/Icon";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { BasePlatformTheme } from "@/Theme";
import { omit as _omit } from "lodash";
import { Eye, EyeSlash } from "@phosphor-icons/react";
var meta = {
    title: "Design System/Forms/Controllers/PasswordController",
    component: PasswordController,
    args: {
        label: "Hello",
        placeholder: "Hello",
        id: "Name"
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
    var form = useForm({ mode: "onChange" });
    return React.createElement(PasswordController, __assign({}, args, { control: form.control }));
};
export var NoValidations = Template.bind({});
NoValidations.args = {};
export var WithValidations = Template.bind({});
WithValidations.args = {
    rules: { required: "This is required" }
};
export var WithMaxValue = Template.bind({});
WithMaxValue.args = {
    maxLength: 4
};
export var HideErrors = Template.bind({});
HideErrors.args = {
    rules: { required: "This is required" },
    showErrors: false
};
export var WithCustomIconsFromProps = Template.bind({});
WithCustomIconsFromProps.args = {
    iconShowPassword: React.createElement(Icon, { as: Eye }),
    iconHidePassword: React.createElement(Icon, { as: EyeSlash })
};
var TemplateNoTheme = function (args) {
    var form = useForm({ mode: "onChange" });
    var originalTheme = BasePlatformTheme;
    //@ts-ignore
    originalTheme.components = _omit(originalTheme.components, "PasswordController");
    return (React.createElement(ChakraProvider, { theme: extendTheme(originalTheme) },
        React.createElement(PasswordController, __assign({}, args, { control: form.control }))));
};
export var WithoutIconsFromTheme = TemplateNoTheme.bind({});
WithoutIconsFromTheme.args = {};
