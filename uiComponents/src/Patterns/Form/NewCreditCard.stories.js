import { Box, Checkbox, Flex, Grid, GridItem, HStack, Text, } from "@chakra-ui/react";
import { Input } from "@Components/Forms/Input";
import { Icon } from "@/Components/Foundations/Icon";
import React from "react";
import { CreditCard } from "@phosphor-icons/react";
var meta = {
    title: "Patterns/Form Patterns/New Credit Card",
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
var TemplateNewCreditCard = function () { return (React.createElement(Box, { w: 481, color: "neutral.700" },
    React.createElement(Flex, { alignItems: "center", mb: 2 },
        React.createElement(Text, { fontSize: "xs", as: "b", lineHeight: 4, letterSpacing: "0.01em" }, "NEW CREDIT CARD")),
    React.createElement(Input, { label: "Name on Card", placeholder: "Name on Card", size: "md", variant: "outline", my: 6 }),
    React.createElement(Input, { label: "Card Number", placeholder: "Card Number", size: "md", variant: "outline", addonLeft: React.createElement(Icon, { as: CreditCard, w: 6, h: 6 }) }),
    React.createElement(Grid, { templateColumns: "repeat(3, 1fr)", gap: 6, my: 6 },
        React.createElement(GridItem, null,
            React.createElement(Input, { label: "Exp MM / YY", placeholder: "Exp MM / YY", size: "md", variant: "outline" })),
        React.createElement(GridItem, null,
            React.createElement(Input, { label: "CVV", placeholder: "CVV", size: "md", variant: "outline" }))),
    React.createElement(HStack, { spacing: 8 },
        React.createElement(Checkbox, { size: "sm" }, "Save Credit Card"),
        React.createElement(Checkbox, { size: "sm" }, "Set as Primary Payment Method")))); };
export var NewCreditCard = TemplateNewCreditCard.bind({});
