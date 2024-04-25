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
import { ThemeStoryWrapper } from "../../story-config";
import { Heading } from "./Heading";
import { Title } from "@storybook/addon-docs";
import { Box, Grid, GridItem, Link } from "@chakra-ui/react";
import { textStyles } from "@/Theme/textStyles";
var headingTextStyles = Object.keys(textStyles).filter(function (textStyle) {
    return textStyle.startsWith("Heading");
});
var meta = {
    title: "Design System/Foundations/Heading",
    component: Heading,
    argTypes: {
        textStyle: {
            options: headingTextStyles,
            control: { type: "select" },
            description: "The textStyle that the heading has. Must be defined in the theme in the theme key `textStyles` "
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
                    React.createElement(Title, null, "Heading Text styles"),
                    React.createElement(Grid, { templateRows: "repeat(4, 1fr)", gap: 10, mt: 10, alignItems: "center", gridAutoFlow: "column", justifyItems: "center", bg: "neutral" }, headingTextStyles.map(function (name) { return (React.createElement(GridItem, { key: name },
                        React.createElement(Heading, { textStyle: name }, name))); })),
                    React.createElement(Box, { mt: 10 },
                        React.createElement(Link, { href: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1503%3A20660&t=gryWgf3cMhWIZY1U-4", isExternal: true }, "View figma design"))))); }
        }
    },
    args: {}
};
export default meta;
var Template = function (args) { return (React.createElement(Heading, __assign({}, args), "Title")); };
export var Default = Template.bind({});
Default.args = {};
