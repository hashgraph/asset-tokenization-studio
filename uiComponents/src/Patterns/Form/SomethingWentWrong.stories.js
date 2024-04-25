import { Flex, Heading, Text } from "@chakra-ui/react";
import { Button } from "@Components/Interaction/Button";
import React from "react";
var meta = {
    title: "Patterns/Form Patterns/Something Went Wrong",
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
var TemplateSWW = function () { return (React.createElement(Flex, { w: 481, color: "neutral.700", flexDir: "column", alignItems: "center" },
    React.createElement(Heading, { size: "lg", color: "neutral.900", mb: 4 }, "Something Went Wrong"),
    React.createElement(Text, null, "This link has expired. Would you like to send a new one?"),
    React.createElement(Button, { size: "lg", my: 8 }, "Re-Send Confirmation"))); };
export var SomethingWentWrong = TemplateSWW.bind({});
