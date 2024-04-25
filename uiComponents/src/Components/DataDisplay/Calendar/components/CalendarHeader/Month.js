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
import { Flex, useMultiStyleConfig as useChakraMultiStyleConfig, } from "@chakra-ui/react";
import { MenuItem } from "@chakra-ui/menu";
import { useCalendarContext } from "../../context";
export var Month = function (_a) {
    var isSelected = _a.isSelected, label = _a.label, props = __rest(_a, ["isSelected", "label"]);
    var _b = useCalendarContext(), colorScheme = _b.colorScheme, variant = _b.variant;
    var styles = useChakraMultiStyleConfig("Calendar", {
        isSelected: isSelected,
        colorScheme: colorScheme,
        variant: variant
    });
    return (React.createElement(Flex, { width: "100%" },
        React.createElement(MenuItem, __assign({ sx: styles.month }, props, { justifyItems: "flex-start" }), label)));
};
