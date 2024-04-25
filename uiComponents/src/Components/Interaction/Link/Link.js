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
import { Link as ChakraLink, forwardRef, useStyleConfig as useChakraStyleConfig, } from "@chakra-ui/react";
import React from "react";
export var Link = forwardRef(function (_a, ref) {
    var children = _a.children, variant = _a.variant, isDisabled = _a.isDisabled, sx = _a.sx, props = __rest(_a, ["children", "variant", "isDisabled", "sx"]);
    var themeStyles = useChakraStyleConfig("Link", {
        isDisabled: isDisabled,
        variant: variant
    });
    return (React.createElement(ChakraLink, __assign({ "data-testid": "link", ref: ref, as: isDisabled ? "span" : "a", tabIndex: 0, sx: themeStyles, variant: variant }, props, { onClick: isDisabled ? function () { return false; } : props.onClick }), children));
});
