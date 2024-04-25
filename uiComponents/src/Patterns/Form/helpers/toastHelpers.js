import React from "react";
import { Box, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { Button } from "@Components/Interaction/Button";
export function ToastComponent(_a) {
    var status = _a.status, onClose = _a.onClose, description = _a.description, title = _a.title;
    return (React.createElement(ToastWrapper, null,
        React.createElement(Box, { py: 4, px: 12, backgroundColor: useColorModeValue("neutral", status === "error"
                ? "red.500"
                : status === "success"
                    ? "green.500"
                    : "neutral.700") },
            React.createElement(Text, { fontWeight: "500", fontSize: "2xl" }, title),
            React.createElement(Text, { fontSize: "md", color: useColorModeValue("neutral.500", "neutral.200") }, description)),
        React.createElement(VStack, { bg: useColorModeValue("neutral.50", "neutral.700"), py: 4, borderBottomRadius: "xl" },
            React.createElement(Box, { w: "80%", pt: 7 },
                React.createElement(Button, { onClick: onClose, w: "full", colorScheme: status === "error"
                        ? "red"
                        : status === "success"
                            ? "green"
                            : "neutral", variant: "outline" }, "Close")))));
}
function ToastWrapper(_a) {
    var children = _a.children;
    return (React.createElement(Box, { mb: 4, shadow: "base", borderWidth: "1px", alignSelf: { base: "center", lg: "flex-start" }, borderColor: useColorModeValue("neutral.200", "neutral.500"), borderRadius: "xl" }, children));
}
