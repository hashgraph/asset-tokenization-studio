import { Box, Heading, Link, Text } from "@chakra-ui/react";
import { Button } from "@Components/Interaction/Button";
import React from "react";
var meta = {
    title: "Patterns/Form Patterns/Verify Email",
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
var TemplateVerify = function () { return (React.createElement(Box, { w: 481, color: "neutral.700" },
    React.createElement(Text, { fontSize: "xs", as: "b", lineHeight: 4, letterSpacing: "0.01em" }, "ALMOST THERE"),
    React.createElement(Heading, { size: "lg", color: "neutral.900", mt: 4 }, "Verify your Email"),
    React.createElement(Text, { fontSize: "sm", my: 8 }, "Thanks for creating an account! Check your inbox for an email so we can verify that it\u2019s you."),
    React.createElement(Button, { size: "lg", w: "100%" }, "Proceed to Login"),
    React.createElement(Text, { fontSize: "sm", my: 8 },
        "Didn\u2019t receive an email from us?",
        " ",
        React.createElement(Link, { color: "blue.500" }, "Resend email.")))); };
export var VerifyEmail = TemplateVerify.bind({});
