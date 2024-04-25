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
import { AccordionIcon as ChakraAccordionIcon, AccordionItem as ChakraAccordionItem, AccordionButton as ChakraAccordionButton, AccordionPanel as ChakraAccordionPanel, } from "@chakra-ui/react";
import { Box as ChakraBox } from "@chakra-ui/layout";
import { forwardRef, useMultiStyleConfig as useChakraMultiStyleConfig, } from "@chakra-ui/system";
import React from "react";
var accordionItemPartsList = ["button", "item", "panel"];
export var AccordionItem = forwardRef(function (_a, ref) {
    var children = _a.children, customTitle = _a.customTitle, title = _a.title, icon = _a.icon, props = __rest(_a, ["children", "customTitle", "title", "icon"]);
    var styles = useChakraMultiStyleConfig("AccordionItem");
    return (React.createElement(ChakraAccordionItem, __assign({ ref: ref }, props, { sx: styles.container }),
        title && (React.createElement("h2", null,
            React.createElement(ChakraAccordionButton, { sx: styles.button },
                React.createElement(ChakraBox, { sx: styles.title }, title),
                React.createElement(ChakraAccordionIcon, __assign({}, (icon && { as: icon })))))),
        customTitle && React.createElement(ChakraBox, { w: "full" }, customTitle),
        React.createElement(ChakraAccordionPanel, { sx: styles.panel }, children)));
});
