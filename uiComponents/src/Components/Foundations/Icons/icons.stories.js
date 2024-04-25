import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Text } from "@/Components/Foundations/Text";
import { Box, Divider, Grid, VStack } from "@chakra-ui/react";
import React from "react";
import { Bluetooth } from "@phosphor-icons/react";
var meta = {
    title: "Design System/Foundations/Icons",
    argTypes: {},
    args: {},
    parameters: {}
};
export default meta;
export var Icons = function () {
    var sizes = ["xxs", "xs", "sm", "md"];
    return (React.createElement(Box, { mt: 8 },
        React.createElement(Grid, { templateColumns: "1fr 1fr 1fr 1fr" }, sizes.map(function (size) {
            return (React.createElement(VStack, { alignItems: "flex-start" },
                React.createElement(Text, { textStyle: "ElementsRegularMD", mb: 1, color: "neutral.700" }, size.toUpperCase()),
                React.createElement(Divider, { style: { marginBottom: "10px" } }),
                React.createElement(PhosphorIcon, { as: Bluetooth, size: size })));
        }))));
};
