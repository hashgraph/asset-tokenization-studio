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
import { forwardRef, useMultiStyleConfig as useChakraMultiStyleConfig, } from "@chakra-ui/system";
import { FormLabel as ChakraFormLabel } from "@chakra-ui/form-control";
import { Textarea as ChakraTextarea, } from "@chakra-ui/textarea";
import React from "react";
import { Text } from "@/Components/Foundations/Text";
import { Box } from "@chakra-ui/react";
export var textareaPartsList = ["container", "label", "labelContainer", "length"];
export var Textarea = forwardRef(function (_a, ref) {
    var size = _a.size, variant = _a.variant, isInvalid = _a.isInvalid, isSuccess = _a.isSuccess, isDisabled = _a.isDisabled, isRequired = _a.isRequired, label = _a.label, _b = _a.showRequired, showRequired = _b === void 0 ? true : _b, id = _a.id, value = _a.value, maxLength = _a.maxLength, props = __rest(_a, ["size", "variant", "isInvalid", "isSuccess", "isDisabled", "isRequired", "label", "showRequired", "id", "value", "maxLength"]);
    var styles = useChakraMultiStyleConfig("Textarea", {
        size: size,
        variant: variant,
        isInvalid: isInvalid,
        isSuccess: isSuccess,
        isDisabled: isDisabled,
        hasLabel: Boolean(label)
    });
    return (React.createElement(ChakraFormLabel, { sx: styles.labelContainer, htmlFor: id, flex: 1, position: "relative", ref: ref },
        label && (React.createElement(Text, { as: "span", id: "label", display: "flex", sx: styles.label },
            label,
            showRequired && isRequired && "*")),
        React.createElement(Box, { pos: "relative" },
            React.createElement(ChakraTextarea, __assign({ variant: variant, size: size, ref: ref, id: id, isDisabled: isDisabled, isInvalid: isInvalid, value: value, maxLength: maxLength, sx: styles.container }, props)),
            maxLength && (React.createElement(Text, { sx: styles.length },
                (value === null || value === void 0 ? void 0 : value.toString().length) || 0,
                "/",
                maxLength)))));
});
