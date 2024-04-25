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
import { Input, InputIcon } from "./Input";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { omit as _omit } from "lodash";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Button } from "@Components/Interaction/Button";
import { linkTo } from "@storybook/addon-links";
import { Alert } from "@Components/Overlay/Alert";
import { Envelope } from "@phosphor-icons/react";
import { BasePlatformTheme } from "@/Theme";
import { addonRightInput, inputArgTypes } from "@/storiesUtils";
var meta = {
    title: "Design System/Forms/Input",
    component: Input,
    args: {
        variant: "outline",
        label: "Label",
        placeholder: "Placeholder"
    },
    argTypes: inputArgTypes,
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1503%3A22829&t=CYTpHR0mFDJMv5GO-4"
        },
        docs: {}
    }
};
export default meta;
var Template = function (args) { return (React.createElement(Input, __assign({ variant: "random" }, args))); };
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
export var ExtraLarge = function () { return (React.createElement(Button, { onClick: linkTo("Design System/Forms/Textarea") }, "Check out the TextArea component stories")); };
export var ControlledInput = function () { return (React.createElement(Button, { onClick: linkTo("Design System/Forms/Controllers/InputController") }, "Check out the InputController component stories")); };
export var WithIconLeft = Template.bind({});
WithIconLeft.args = {
    addonLeft: React.createElement(InputIcon, { icon: React.createElement(PhosphorIcon, { as: Envelope }) })
};
export var WithInformativeIconRight = Template.bind({});
WithInformativeIconRight.args = {
    addonRight: addonRightInput.OneIcon
};
export var WithIconButtonRight = Template.bind({});
WithIconButtonRight.args = {
    addonRight: addonRightInput.OneButtonIcon
};
export var WithTwoIconRight = Template.bind({});
WithTwoIconRight.args = {
    addonRight: addonRightInput.TwoIcon
};
export var IsDisabled = Template.bind({});
IsDisabled.args = {
    isDisabled: true
};
export var IsInvalid = Template.bind({});
IsInvalid.args = {
    isInvalid: true
};
export var ShowRequired = Template.bind({});
ShowRequired.args = {
    isRequired: true,
    showRequired: true
};
export var IsSuccess = Template.bind({});
IsSuccess.args = {
    isSuccess: true
};
export var IsClearable = Template.bind({});
IsClearable.args = {
    isClearable: true,
    onClear: function () { return console.log("Click"); }
};
var TemplateNoTheme = function (args) {
    var originalTheme = BasePlatformTheme;
    //@ts-ignore
    originalTheme.components = _omit(originalTheme.components, "Input");
    return (React.createElement(ChakraProvider, { theme: extendTheme(originalTheme) },
        React.createElement(Alert, { status: "warning", mb: 2 }, "This component doesn't have any theme configured."),
        React.createElement(Input, __assign({}, args))));
};
export var IsInvalidWithDefaultErrorIcon = TemplateNoTheme.bind({});
IsInvalidWithDefaultErrorIcon.args = {
    isInvalid: true
};
export var withLongPlaceholder = Template.bind({});
withLongPlaceholder.args = {
    placeholder: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
};
export var withTopDescription = Template.bind({});
withTopDescription.args = {
    topDescription: "This is a description"
};
export var withBottomDescription = Template.bind({});
withBottomDescription.args = {
    bottomDescription: "This is a description"
};
export var withSublabel = Template.bind({});
withSublabel.args = {
    subLabel: "This is a sublabel"
};
