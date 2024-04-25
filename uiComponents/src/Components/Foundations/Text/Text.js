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
import { Box as ChakraBox } from "@chakra-ui/layout";
import { forwardRef, useStyleConfig as useChakraStyleConfig, } from "@chakra-ui/system";
import React from "react";
export var Text = forwardRef(function (_a, ref) {
    var children = _a.children, _b = _a.as, as = _b === void 0 ? "p" : _b, size = _a.size, variant = _a.variant, textStyle = _a.textStyle, props = __rest(_a, ["children", "as", "size", "variant", "textStyle"]);
    var styles = useChakraStyleConfig("Text", { size: size, variant: variant });
    return (React.createElement(ChakraBox, __assign({ ref: ref, as: as, textStyle: textStyle }, props, (!textStyle && { __css: styles })), children));
});
