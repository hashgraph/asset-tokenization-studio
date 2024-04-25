import { Box, Heading, Image, Link, Stack, Text } from "@chakra-ui/react";
import { Button } from "@Components/Interaction/Button";
import { Checkbox } from "@Components/Forms/Checkbox";
import { Input } from "@Components/Forms/Input";
import { CustomIcon } from "@/Components/Foundations/Icon";
import React from "react";
var recaptchaImg = require("../assets/reCAPTCHA.png");
var meta = {
    title: "Patterns/Form Patterns/Sign up",
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
    React.createElement(Text, { fontSize: "xs", as: "b", lineHeight: 4, letterSpacing: "0.01em" }, "REGISTER TO REDEEM YOUR FREE NFT"),
    React.createElement(Heading, { size: "lg", color: "neutral.900", mt: 4 }, "Sign Up"),
    React.createElement(Input, { label: "email", placeholder: "email", size: "md", variant: "outline", mt: 10 }),
    React.createElement(Input, { label: "username", placeholder: "username", size: "md", variant: "outline", my: 4 }),
    React.createElement(Input, { label: "password", placeholder: "password", type: "password", size: "md", variant: "outline", addonRight: React.createElement(CustomIcon, { name: "EyeOff", w: 6, h: 6 }) }),
    React.createElement(Stack, { my: 6, spacing: 4 },
        React.createElement(Checkbox, { size: "sm", variant: "circle" }, "Must be 8 or more characters"),
        React.createElement(Checkbox, { size: "sm", variant: "circle" }, "Must include a special number or character")),
    React.createElement(Input, { label: "retype password", placeholder: "retype password", size: "md", variant: "outline", addonRight: React.createElement(CustomIcon, { name: "EyeOff", w: 6, h: 6 }) }),
    React.createElement(Stack, { my: 8, spacing: 4 },
        React.createElement(Checkbox, { size: "sm" }, "I accept the Terms and Conditions & Privacy Policy"),
        React.createElement(Checkbox, { size: "sm" }, "I want to receive updates, ads and offers from Archie Comics")),
    React.createElement(Image, { w: "100%", src: recaptchaImg, alt: "recaptcha" }),
    React.createElement(Button, { size: "lg", w: "100%", my: 8 }, "Sign Up"),
    React.createElement(Text, { fontSize: "sm", mb: 8 },
        "Already have an account? ",
        React.createElement(Link, { color: "blue.500" }, "Login to account")),
    React.createElement(Text, { fontSize: "xs" }, "*To withdraw your consent and to learn more about your rights and how to exercise them, see Archie Comic\u2019s privacy policy."))); };
export var Signup = TemplateSignup.bind({});
