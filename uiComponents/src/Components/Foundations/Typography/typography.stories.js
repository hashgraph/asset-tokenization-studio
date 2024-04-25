import { Heading } from "@/Components/Foundations/Heading";
import { Text } from "@/Components/Foundations/Text";
import { Box, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import React from "react";
var meta = {
    title: "Design System/Foundations/Typography",
    argTypes: {},
    args: {},
    parameters: {}
};
export default meta;
export var Headings = function () {
    var variants = ["Regular", "Medium", "Semibold", "Bold"];
    var sizes = ["xl", "lg", "md", "sm", "xs"];
    var pixels = ["24 | 32", "20 | 28", "16 | 24", "14 | 20", "12 | 16"];
    return (React.createElement(Box, { mt: 8 },
        React.createElement(RenderTable, { variants: variants, sizes: sizes, pixels: pixels, type: "Heading" })));
};
export var Texts = function () {
    var variants = ["Regular", "Medium", "Semibold", "Bold"];
    var sizes = ["lg", "md", "sm", "xs"];
    var pixels = ["20 | 28", "16 | 24", "14 | 20", "12 | 16"];
    return (React.createElement(Box, { mt: 8 },
        React.createElement(RenderTable, { variants: variants, sizes: sizes, pixels: pixels, type: "Body" })));
};
export var Elements = function () {
    var variants = ["Light", "Regular", "Medium", "Semibold", "Bold"];
    var sizes = ["2xl", "xl", "lg", "md", "sm", "xs"];
    var pixels = [
        "32 | 42",
        "24 | 32",
        "20 | 28",
        "16 | 24",
        "14 | 20",
        "12 | 16",
    ];
    return (React.createElement(Box, { mt: 8 },
        React.createElement(RenderTable, { variants: variants, sizes: sizes, pixels: pixels, type: "Elements" })));
};
var RenderTable = function (_a) {
    var sizes = _a.sizes, variants = _a.variants, pixels = _a.pixels, type = _a.type;
    return (React.createElement(Table, null,
        React.createElement(Thead, null,
            React.createElement(Tr, null,
                React.createElement(Th, { w: "200px" },
                    React.createElement(Text, { textStyle: "ElementsRegularSM", color: "neutral.700" }, "Size | Line height")),
                variants.map(function (variant) {
                    return (React.createElement(Th, null,
                        React.createElement(Text, { textStyle: "ElementsRegularSM", color: "neutral.700" }, variant)));
                }))),
        React.createElement(Tbody, null, sizes.map(function (size, index) {
            return (React.createElement(Tr, { key: size, h: 20 },
                React.createElement(Td, { w: "200px" },
                    React.createElement(Text, { textStyle: "ElementsRegularSM", mb: 1, color: "neutral.700" }, pixels[index])),
                variants.map(function (variant) {
                    return (React.createElement(Td, null, type === "Heading" ? (React.createElement(Heading, { textStyle: "Heading".concat(variant).concat(size.toUpperCase()) },
                        "Heading ",
                        size.toUpperCase())) : (React.createElement(Text, { textStyle: "".concat(type).concat(variant).concat(size.toUpperCase()) },
                        type,
                        " ",
                        size.toUpperCase()))));
                })));
        }))));
};
