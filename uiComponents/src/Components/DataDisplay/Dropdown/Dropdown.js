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
import { MenuList as ChakraMenuList, Stack as ChakraStack, } from "@chakra-ui/react";
import React from "react";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
export var dropdownPartsList = ["wrapper", "container", "itemIconWeight", "itemLabel", "itemContainer"];
export var Dropdown = function (_a) {
    var children = _a.children, variant = _a.variant, props = __rest(_a, ["children", "variant"]);
    var styles = useChakraMultiStyleConfig("Dropdown", {
        variant: variant,
        hasMaxWidth: true
    });
    return (React.createElement(ChakraMenuList, __assign({ position: "relative", sx: styles.wrapper }, props),
        React.createElement(ChakraStack, { spacing: 1, sx: styles.container }, children)));
};
