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
import { Flex as ChakraFlex, FormLabel as ChakraFormLabel, } from "@chakra-ui/react";
import { Switch as ChakraSwitch } from "@chakra-ui/switch";
import { forwardRef, useMultiStyleConfig as useChakraMultiStyleConfig, } from "@chakra-ui/system";
import React from "react";
export var togglePartsList = ["container", "track", "thumb", "label"];
export var Toggle = forwardRef(function (_a, ref) {
    var label = _a.label, props = __rest(_a, ["label"]);
    var styles = useChakraMultiStyleConfig("Switch", {
        size: props.size,
        variant: props.variant
    });
    return (React.createElement(ChakraFlex, { align: "center" },
        React.createElement(ChakraSwitch, __assign({ ref: ref }, props)),
        React.createElement(ChakraFormLabel, { htmlFor: props.id, sx: styles.label }, label)));
});
