import { Box, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { Button } from "@Components/Interaction/Button";
import { Checkbox } from "@Components/Forms/Checkbox";
import { Input } from "@Components/Forms/Input";
import { CustomIcon } from "@/Components/Foundations/Icon";
import React from "react";
var meta = {
    title: "Patterns/Form Patterns/Reset Password",
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
var TemplateSignup = function () { return (React.createElement(Box, { w: 481, color: "neutral.700" },
    React.createElement(Heading, { size: "lg", color: "neutral.900", mb: 8 },
        "Reset your Password?",
        " "),
    React.createElement(Input, { label: "password", placeholder: "password", type: "password", size: "md", variant: "outline", addonRight: React.createElement(CustomIcon, { name: "EyeOff", w: 6, h: 6 }) }),
    React.createElement(Stack, { my: 6, spacing: 4 },
        React.createElement(Checkbox, { size: "sm", variant: "circle" }, "Must be 8 or more characters"),
        React.createElement(Checkbox, { size: "sm", variant: "circle" }, "Must include a special number or character")),
    React.createElement(Input, { label: "retype password", placeholder: "retype password", size: "md", variant: "outline", addonRight: React.createElement(CustomIcon, { name: "EyeOff", w: 6, h: 6 }) }),
    React.createElement(Button, { size: "lg", w: "100%", my: 8 }, "Reset Password"),
    React.createElement(Text, { fontSize: "sm", mb: 8 },
        "Didn\u2019t receive an email from us?",
        " ",
        React.createElement(Link, { color: "blue.500" }, "Resend email.")))); };
export var ResetPassword = TemplateSignup.bind({});
