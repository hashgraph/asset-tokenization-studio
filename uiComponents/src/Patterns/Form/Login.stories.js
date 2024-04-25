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
import { Box, Heading, Link, Text } from "@chakra-ui/react";
import { Button } from "@Components/Interaction/Button";
import { Input } from "@Components/Forms/Input";
import { CustomIcon } from "@/Components/Foundations/Icon";
import { ToastConfigurator, useToast } from "@Components/Overlay/Toast";
import { submitLoginForm } from "@/Patterns/Form/utils";
import { ToastComponent } from "./helpers";
import { useForm } from "react-hook-form";
var meta = {
    title: "Patterns/Form Patterns/Login",
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
var TemplateLogin = function () {
    var toast = useToast();
    var _a = React.useState(false), isLoading = _a[0], setIsLoading = _a[1];
    var _b = useForm(), handleSubmit = _b.handleSubmit, register = _b.register;
    var onSubmit = function (data) {
        setIsLoading(true);
        submitLoginForm(data)
            .then(function (_) {
            toast.show({
                status: "success",
                title: "Login Success",
                description: "You have successfully logged in"
            });
        })["catch"](function (_) {
            toast.show({
                status: "error",
                title: "Login Failed",
                description: "Please check your email and password"
            });
        })["finally"](function () {
            setIsLoading(false);
        });
    };
    return (React.createElement(Box, { as: "form", onSubmit: handleSubmit(onSubmit), w: 481, color: "neutral.700" },
        React.createElement(Text, { fontSize: "xs", as: "b", lineHeight: 4, letterSpacing: "0.01em" }, "WELCOME BACK"),
        React.createElement(Heading, { size: "lg", color: "neutral.900", mt: 4 }, "Login"),
        React.createElement(Input, __assign({ disabled: isLoading, label: "email", placeholder: "email", size: "md", variant: "outline", mb: 4, mt: 8 }, register("email"))),
        React.createElement(Input, __assign({ disabled: isLoading, label: "password", placeholder: "password", type: "password", size: "md", variant: "outline", addonRight: React.createElement(CustomIcon, { name: "EyeOff", w: 6, h: 6 }) }, register("password"))),
        React.createElement(Text, { fontSize: "sm", mt: 4, mb: 12, textDecor: "underline" },
            React.createElement(Link, null, "Forgot password?")),
        React.createElement(Button, { isLoading: isLoading, type: "submit", size: "lg", w: "100%" }, "Login"),
        React.createElement(Text, { fontSize: "sm", mt: 8 },
            "Are you a New user? ",
            React.createElement(Link, { color: "blue.500" }, "Get Signed up")),
        React.createElement(ToastConfigurator, { component: ToastComponent })));
};
export var Login = TemplateLogin.bind({});
