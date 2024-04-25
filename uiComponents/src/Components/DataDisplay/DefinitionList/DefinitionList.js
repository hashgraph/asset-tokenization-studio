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
import React from "react";
import { Flex as ChakraFlex, VStack as ChakraVStack } from "@chakra-ui/layout";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
import { Text } from "@chakra-ui/react";
import { DefinitionListItem } from "./DefinitionListItem";
export var definitionListPartsList = [
    "listTitle",
    "listItem",
    "listItemTitle",
    "listItemDescription",
    "container",
    "definitionListGrid",
];
export var DefinitionList = function (_a) {
    var variant = _a.variant, title = _a.title, items = _a.items, isLoading = _a.isLoading, props = __rest(_a, ["variant", "title", "items", "isLoading"]);
    var styles = useChakraMultiStyleConfig("DefinitionList", {
        variant: variant
    });
    return (React.createElement(ChakraVStack, __assign({ spacing: 0, sx: styles.container }, props),
        title && (React.createElement(ChakraFlex, { sx: styles.listItem },
            React.createElement(Text, { sx: styles.listTitle }, title))),
        items.map(function (item, index) { return (React.createElement(DefinitionListItem, __assign({ key: index, isLoading: isLoading || item.isLoading, listItemStyles: styles.listItem, listItemTitleStyles: styles.listItemTitle, listItemDescriptionStyles: styles.listItemDescription }, item))); })));
};
