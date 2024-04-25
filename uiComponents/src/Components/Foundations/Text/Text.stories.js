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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React from "react";
import { ThemeStoryWrapper } from "../../story-config";
import { Text } from "./Text";
import { Title, Subtitle } from "@storybook/addon-docs";
import { Box, Divider, Grid, GridItem, Link } from "@chakra-ui/react";
import { textStyles } from "@/Theme/textStyles";
var bodyTextStyles = Object.keys(textStyles).filter(function (textStyle) {
    return textStyle.startsWith("Body");
});
var elementTextStyles = Object.keys(textStyles).filter(function (textStyle) {
    return textStyle.startsWith("Elements");
});
var meta = {
    title: "Design System/Foundations/Text",
    component: Text,
    argTypes: {
        textStyle: {
            options: __spreadArray(__spreadArray([], bodyTextStyles, true), elementTextStyles, true),
            control: { type: "select" },
            description: "The textStyle that the text has. Must be defined in the theme in the theme key `textStyles` "
        },
        size: {
            description: "The size of the text. We recommend using `textStyle` instead. "
        },
        variant: {
            description: "The variant of the text. Must be defined in the theme inside `Text` component."
        }
    },
    parameters: {
        docs: {
            page: function () { return (React.createElement(ThemeStoryWrapper, null,
                React.createElement(React.Fragment, null,
                    React.createElement(Title, null, "Text styles"),
                    React.createElement(Box, { my: 10 },
                        React.createElement(Subtitle, null, "Body Text")),
                    React.createElement(Grid, { templateRows: "repeat(4, 1fr)", gap: 10, alignItems: "center", gridAutoFlow: "column", justifyItems: "center", bg: "neutral" }, bodyTextStyles.map(function (name) { return (React.createElement(GridItem, { key: name },
                        React.createElement(Text, { textStyle: name }, name))); })),
                    React.createElement(Divider, { my: 10 }),
                    React.createElement(Box, { mb: 10 },
                        React.createElement(Subtitle, null, "Elements")),
                    React.createElement(Grid, { templateRows: "repeat(5, 1fr)", gap: 10, alignItems: "center", gridAutoFlow: "column", justifyItems: "center", bg: "neutral", maxW: "2000px", overflowX: "scroll" }, elementTextStyles.map(function (name) { return (React.createElement(GridItem, { key: name },
                        React.createElement(Text, { textStyle: name }, name))); })),
                    React.createElement(Box, { mt: 10 },
                        React.createElement(Link, { href: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1503%3A20660&t=gryWgf3cMhWIZY1U-4", isExternal: true }, "View figma design"))))); }
        }
    },
    args: {}
};
export default meta;
var Template = function (args) { return (React.createElement(Text, __assign({}, args), "Text example")); };
export var Default = Template.bind({});
Default.args = {};
