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
import { Accordion } from ".";
import { AccordionItem } from "../AccordionItem";
import { Box as ChakraBox } from "@chakra-ui/layout";
var AccordionItems = function () {
    return (React.createElement(ChakraBox, null,
        React.createElement(AccordionItem, { title: "First Element" },
            React.createElement("p", null, "Content in First Element")),
        React.createElement(AccordionItem, { title: "Second Element" },
            React.createElement("p", null, "Content in Second Element")),
        React.createElement(AccordionItem, { title: "Third Element" },
            React.createElement("p", null, "Content in Third Element"))));
};
var meta = {
    title: "Design System/Data Display/Accordion",
    component: Accordion,
    argTypes: {},
    parameters: {
        design: {
            type: "figma"
        },
        docs: {}
    },
    args: {
        children: React.createElement(AccordionItems, null)
    }
};
export default meta;
var Template = function (args) {
    return React.createElement(Accordion, __assign({}, args));
};
export var Default = Template.bind({});
Default.args = {
    title: "Default Accordion"
};
export var DefaultWithDescription = Template.bind({});
DefaultWithDescription.args = {
    title: "Accordion with description",
    description: "By default when open an item any other expanded item may be collapsed again"
};
export var AllowMultiple = Template.bind({});
AllowMultiple.args = {
    title: "Expand multiple items at once",
    description: "The accordion permit multiple items to be expanded at once",
    allowMultiple: true
};
