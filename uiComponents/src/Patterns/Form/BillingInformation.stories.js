import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Box, Flex, Grid, GridItem, Stack, Text } from "@chakra-ui/react";
import { Input, InputIcon } from "@Components/Forms/Input";
import { Select } from "@Components/Forms/Select";
import { Icon } from "@/Components/Foundations/Icon";
import { Question } from "@phosphor-icons/react";
import React from "react";
var meta = {
    title: "Patterns/Form Patterns/Billing Information",
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
var TemplateBillingInformation = function () { return (React.createElement(Box, { w: 481, color: "neutral.700" },
    React.createElement(Flex, { alignItems: "center", mb: 4 },
        React.createElement(Text, { fontSize: "xs", as: "b", lineHeight: 4, letterSpacing: "0.01em" }, "BILLING INFORMATION"),
        React.createElement(Icon, { as: Question, ml: 2 })),
    React.createElement(Stack, { spacing: 3 },
        React.createElement(Select, { label: "Country", options: [
                { label: "option 1", value: 1 },
                { label: "option 2", value: 2 },
            ], placeholder: "Select Country" }),
        React.createElement(Input, { label: "First Name", placeholder: "First Name", addonRight: React.createElement(InputIcon, { icon: React.createElement(PhosphorIcon, { as: Question }) }) }),
        React.createElement(Input, { label: "Last Name", placeholder: "Last Name", addonRight: React.createElement(InputIcon, { icon: React.createElement(PhosphorIcon, { as: Question }) }) }),
        React.createElement(Input, { label: "Address 1", placeholder: "Address 1", addonRight: React.createElement(InputIcon, { icon: React.createElement(PhosphorIcon, { as: Question }) }) }),
        React.createElement(Input, { label: "Address 2 (optional)", placeholder: "Address 2 (optional)", addonRight: React.createElement(InputIcon, { icon: React.createElement(PhosphorIcon, { as: Question }) }) }),
        React.createElement(Input, { label: "City", placeholder: "City" }),
        React.createElement(Grid, { templateColumns: "61% 1fr", gap: 6 },
            React.createElement(GridItem, null,
                React.createElement(Select, { options: [], placeholder: "State" })),
            React.createElement(GridItem, null,
                React.createElement(Input, { label: "Zip Code", placeholder: "Zip Code", addonRight: React.createElement(InputIcon, { icon: React.createElement(PhosphorIcon, { as: Question }) }) })))))); };
export var BillingInformation = TemplateBillingInformation.bind({});
