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
import { Link } from "./Link";
import React from "react";
import { Box } from "@chakra-ui/react";
import { PhosphorIcon } from "../../Foundations/PhosphorIcon";
import { ArrowSquareOut } from "@phosphor-icons/react";
var meta = {
    title: "Design System/Interaction/Link",
    component: Link,
    argTypes: {
        label: {
            description: "Label of the Link",
            control: {
                type: "text"
            }
        },
        variant: {
            options: ["table", "highlighted"],
            control: {
                type: "select"
            }
        },
        isDisabled: {
            control: {
                type: "boolean"
            }
        }
    },
    args: {
        children: "Click me"
    },
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/ioBricks-Design-System?type=design&node-id=3629-47231&t=s4x0jqVtY37T19Tn-4"
        }
    }
};
export default meta;
var Template = function (args) { return (React.createElement(Box, null,
    React.createElement(Link, __assign({}, args)))); };
export var Highlighted = Template.bind({});
Highlighted.args = {
    variant: "highlighted"
};
export var Table = Template.bind({});
Table.args = {
    variant: "table"
};
export var HighlightedDisabled = Template.bind({});
HighlightedDisabled.args = {
    variant: "highlighted",
    isDisabled: true
};
export var WithIcon = Template.bind({});
WithIcon.args = {
    children: (React.createElement(React.Fragment, null,
        "External link ",
        React.createElement(PhosphorIcon, { as: ArrowSquareOut })))
};
