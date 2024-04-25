import { Box, Heading, Image } from "@chakra-ui/react";
import { Button } from "@Components/Interaction/Button";
import { Input } from "@Components/Forms/Input";
import { onSubmit, ToastComponent } from "./helpers";
import React from "react";
import { ToastConfigurator } from "@Components/Overlay/Toast";
var recaptchaImg = require("../assets/reCAPTCHA.png");
var meta = {
    title: "Patterns/Form Patterns/Forgot Password",
    argTypes: {},
    parameters: {
        previewTabs: {
            canvas: {
                hidden: true
            }
        },
        viewMode: "docs",
        design: {
            type: "figma",
            url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1496%3A27397"
        },
        docs: {}
    },
    args: {}
};
export default meta;
var TemplateForgot = function () {
    var _a = React.useState(""), inputValue = _a[0], setInputValue = _a[1];
    return (React.createElement(Box, { w: 481, color: "neutral.700" },
        React.createElement(ToastConfigurator, { component: ToastComponent }),
        React.createElement(Heading, { size: "lg", color: "neutral.900", mt: 4 }, "Forgot your Password?"),
        React.createElement(Input, { label: "email", placeholder: "email", size: "md", variant: "outline", mt: 10, value: inputValue, onChange: function (e) { return setInputValue(e.target.value); } }),
        React.createElement(Image, { w: "100%", src: recaptchaImg, alt: "recaptcha", my: 8 }),
        React.createElement(Button, { size: "lg", w: "100%", onClick: function () {
                onSubmit(inputValue);
            } }, "Continue")));
};
export var ForgotPassword = TemplateForgot.bind({});
