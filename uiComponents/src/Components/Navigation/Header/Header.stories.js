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
import { Header } from "./Header";
import { Stack } from "@chakra-ui/react";
import { Logo } from "@/Components/Basic/Logo";
import { Text } from "@/Components/Foundations/Text";
import { Avatar } from "@/Components/Basic/Avatar";
var meta = {
    title: "Design System/Navigation/Header",
    component: Header,
    argTypes: {
        leftContent: { control: false, description: "Left content of the header" },
        rightContent: {
            control: false,
            description: "Right content of the header"
        },
        contentContainerProps: {
            control: false,
            description: "Used to modify the wrapper of the left and right content"
        }
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1860-13948&t=3ozoVrWQYvgw1fj3-4"
        },
        docs: {}
    }
};
export default meta;
var Template = function (args) {
    return React.createElement(Header, __assign({}, args));
};
export var Default = Template.bind({});
Default.args = {
    leftContent: React.createElement(Logo, { alt: "IOB" }),
    rightContent: (React.createElement(Stack, { align: "center", direction: "row" },
        React.createElement(Text, { textStyle: "ElementsMediumXS" }, "Username"),
        React.createElement(Avatar, null)))
};
export var HeaderOnlyLeftContent = Template.bind({});
HeaderOnlyLeftContent.args = {
    leftContent: React.createElement(Logo, { alt: "IOB" })
};
export var HeaderOnlyRightContent = Template.bind({});
HeaderOnlyRightContent.args = {
    rightContent: (React.createElement(Stack, { align: "center", direction: "row" },
        React.createElement(Text, { textStyle: "ElementsMediumXS" }, "Username"),
        React.createElement(Avatar, null)))
};
