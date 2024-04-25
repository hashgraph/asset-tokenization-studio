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
import { useFormControlContext as useChakraFormControlContext } from "@chakra-ui/form-control";
import { Radio as ChakraRadio } from "@chakra-ui/radio";
import React from "react";
import { forwardRef } from "@chakra-ui/system";
export var radioPartsList = [
    "container",
    "label",
    "control",
];
export var Radio = forwardRef(function (_a, ref) {
    var name = _a.name, isInvalid = _a.isInvalid, label = _a.label, children = _a.children, size = _a.size, variant = _a.variant, isDisabled = _a.isDisabled, props = __rest(_a, ["name", "isInvalid", "label", "children", "size", "variant", "isDisabled"]);
    var formControl = useChakraFormControlContext() || {};
    return (React.createElement(ChakraRadio, __assign({ ref: ref, isInvalid: isInvalid !== null && isInvalid !== void 0 ? isInvalid : formControl.isInvalid, name: name, size: size, variant: variant, isDisabled: isDisabled }, props), children));
});
