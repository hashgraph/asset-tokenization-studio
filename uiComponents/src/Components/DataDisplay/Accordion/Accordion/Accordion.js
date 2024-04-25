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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { Accordion as ChakraAccordion } from "@chakra-ui/accordion";
import { Box as ChakraBox, Divider as ChakraDivider } from "@chakra-ui/layout";
import { forwardRef, useMultiStyleConfig as useChakraMultiStyleConfig, } from "@chakra-ui/system";
import React from "react";
import { Text } from "@/Components/Foundations/Text";
var accordionPartsList = ["container", "title", "item"];
export var Accordion = forwardRef(function (_a, ref) {
    var children = _a.children, description = _a.description, title = _a.title, props = __rest(_a, ["children", "description", "title"]);
    var styles = useChakraMultiStyleConfig("Accordion");
    return (React.createElement(ChakraAccordion, __assign({ ref: ref }, props, { sx: styles.container }),
        React.createElement(ChakraBox, { sx: styles.titleContainer },
            React.createElement(Text, { sx: styles.title }, title)),
        React.createElement(ChakraDivider, { sx: styles.divider }),
        description && (React.createElement(ChakraBox, { sx: styles.descriptionContainer },
            React.createElement(Text, { sx: styles.description }, description))),
        React.createElement(ChakraBox, { sx: styles.itemsContainer }, children)));
});
