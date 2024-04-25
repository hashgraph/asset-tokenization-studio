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
import { AccordionItem } from ".";
import { Accordion } from "../Accordion";
import { ArrowDown } from "@phosphor-icons/react";
import { Tag } from "../../Tag";
import { HStack as ChakraHStack, AccordionButton as ChakraAccordionButton, AccordionIcon as ChakraAccordionIcon, Button as ChakraButton, } from "@chakra-ui/react";
var meta = {
    title: "Design System/Data Display/Accordion/AccordionItem",
    component: AccordionItem,
    argTypes: {
        variant: {}
    },
    parameters: {
        design: {},
        docs: {}
    },
    args: {
        children: React.createElement("p", null, "This is the item content")
    }
};
export default meta;
var Template = function (args) {
    return (React.createElement(Accordion, { title: "Accordion Title" },
        React.createElement(AccordionItem, __assign({}, args))));
};
export var DefaultIcon = Template.bind({});
DefaultIcon.args = {
    title: "Accordion Item Title"
};
export var CustomIcon = Template.bind({});
CustomIcon.args = {
    title: "Accordion Item with custom icon from Phosphor",
    icon: ArrowDown
};
export var CustomTitleComponent = function () { return (React.createElement(ChakraHStack, { w: "full", justify: "space-between", px: 4, "data-testid": "custom-title" },
    React.createElement(ChakraHStack, null,
        React.createElement(ChakraAccordionButton, { "data-testid": "custom-title-button" },
            React.createElement("h2", null, "Admin"),
            React.createElement(ChakraAccordionIcon, null)),
        React.createElement(ChakraHStack, { w: "auto" },
            React.createElement(Tag, { label: "Complement", size: "sm" }))),
    React.createElement(ChakraHStack, null,
        React.createElement(ChakraButton, { size: "sm", onClick: function () { return alert("You click on me"); } }, "Click")))); };
export var CustomTitle = Template.bind({});
CustomTitle.args = {
    customTitle: React.createElement(CustomTitleComponent, null)
};
