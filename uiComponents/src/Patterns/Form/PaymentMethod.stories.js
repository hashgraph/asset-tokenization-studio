import { Box, Center, Divider, Flex, HStack, Image, Text, } from "@chakra-ui/react";
import { Button } from "@Components/Interaction/Button";
import { Icon, CustomIcon } from "@/Components/Foundations/Icon";
import React from "react";
import { Clock, NotePencil, Question } from "@phosphor-icons/react";
var palmLogo = require("../assets/Brand.png");
var meta = {
    title: "Patterns/Form Patterns/Payment Method",
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
var TemplatePaymentMethod = function () {
    // The Card Info Component
    var CardView = function () { return (React.createElement(Flex, { borderWidth: 1, borderColor: "neutral.300", w: "full", py: 4, px: 5, alignItems: "center" },
        React.createElement(Center, { w: 12, h: 12, bg: "neutral.100", borderRadius: "50%", mr: 4 },
            React.createElement(CustomIcon, { name: "MasterCardColor", w: 6, h: 6 })),
        React.createElement(Box, null,
            React.createElement(Text, { fontSize: "xs" }, "Default"),
            React.createElement(Text, { fontSize: "sm" }, "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022 2358"),
            React.createElement(Text, { fontSize: "xs" }, "Exp 06/24")),
        React.createElement(Icon, { ml: "auto", h: 6, w: 6, as: NotePencil }))); };
    return (React.createElement(Box, { w: 481, color: "neutral.700" },
        React.createElement(Flex, { alignItems: "center", mb: 2 },
            React.createElement(Text, { fontSize: "xs", as: "b", lineHeight: 4, letterSpacing: "0.01em" }, "PAYMENT METHOD")),
        React.createElement(CardView, null),
        React.createElement(Divider, { my: 8 }),
        React.createElement(Box, null,
            React.createElement(Flex, { alignItems: "center", mb: 3 },
                React.createElement(Text, { fontSize: "lg" }, "Subtotal"),
                React.createElement(Text, { fontSize: "md", ml: "auto" }, "$300.00")),
            React.createElement(Flex, { alignItems: "center", mb: 3 },
                React.createElement(Text, { fontSize: "md", display: "flex", alignItems: "center" },
                    "Service Fees",
                    React.createElement(Icon, { ml: 1, as: Question })),
                React.createElement(Text, { fontSize: "md", ml: "auto" }, "$300.00")),
            React.createElement(Flex, { alignItems: "center", mb: 8 },
                React.createElement(Text, { fontSize: "lg" }, "Total"),
                React.createElement(Text, { as: "b", fontSize: "2xl", ml: "auto", display: "flex", alignItems: "center" },
                    "$300.00",
                    React.createElement(Text, { fontSize: "sm", as: "b", ml: 1 }, "USD")))),
        React.createElement(Center, null,
            React.createElement(Icon, { h: 6, w: 6, mr: 1, as: Clock }),
            React.createElement(Text, null,
                "Your NFT is being held for",
                " ",
                React.createElement(Text, { fontSize: "md", as: "span", color: "green.500" }, "5:00:00 minutes"))),
        React.createElement(HStack, { spacing: 4, mt: 6 },
            React.createElement(Button, { size: "lg", variant: "outline", w: "full" }, "Cancel"),
            React.createElement(Button, { size: "lg", variant: "solid", w: "full" }, "Continue")),
        React.createElement(Flex, { mt: 4 },
            React.createElement(Image, { src: palmLogo, alt: "Palm Logo", w: 20, h: 10, mr: 4 }),
            React.createElement(Text, { fontSize: "10px" }, "By placing your order, you agree to Palm NFT Studio\u2019s Terms of Service and Privacy Policy and acknowledge that Palm NFT Studio is the authorized seller. Check out our FAQs for more details."))));
};
export var PaymentMethod = TemplatePaymentMethod.bind({});
