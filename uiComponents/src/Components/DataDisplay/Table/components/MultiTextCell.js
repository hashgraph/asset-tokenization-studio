import { Flex as ChakraFlex } from "@chakra-ui/layout";
import React from "react";
import { Text } from "@/Components/Foundations/Text";
import { useTableContext } from "../Table";
export var MultiTextCell = function (_a) {
    var text = _a.text, subtext = _a.subtext, type = _a.type;
    var styles = useTableContext().styles;
    return (React.createElement(ChakraFlex, { direction: "column" },
        type === "upper" && React.createElement(Text, { sx: styles.subtext }, subtext),
        React.isValidElement(text) ? text : React.createElement(Text, null, text),
        type === "lower" && React.createElement(Text, { sx: styles.subtext }, subtext)));
};
