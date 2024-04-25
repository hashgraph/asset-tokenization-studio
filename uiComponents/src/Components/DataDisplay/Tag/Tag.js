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
import { forwardRef, useMultiStyleConfig as useChakraMultiStyleConfig, chakra, } from "@chakra-ui/system";
import { Tag as ChakraTag, TagLabel as ChakraTagLabel } from "@chakra-ui/tag";
import { SkeletonCircle } from "@chakra-ui/react";
export var tagPartsList = [
    "container",
    "label",
];
export var Tag = forwardRef(function (_a, ref) {
    var _b = _a.label, label = _b === void 0 ? "" : _b, icon = _a.icon, disabled = _a.disabled, leftIcon = _a.leftIcon, rightIcon = _a.rightIcon, isLoading = _a.isLoading, props = __rest(_a, ["label", "icon", "disabled", "leftIcon", "rightIcon", "isLoading"]);
    var styles = useChakraMultiStyleConfig("Tag", {
        disabled: disabled,
        size: props.size,
        variant: props.variant
    });
    var renderIcon = function (icon, options) {
        return React.cloneElement(icon, __assign({ size: "xxs", verticalAlign: "top" }, options));
    };
    if (isLoading) {
        return React.createElement(SkeletonCircle, { size: "8", w: 20 });
    }
    return (React.createElement(ChakraTag, __assign({ as: chakra.button, ref: ref, sx: styles.container }, props),
        leftIcon && renderIcon(leftIcon),
        icon ? (renderIcon(icon)) : (React.createElement(ChakraTagLabel, { sx: styles.label }, label)),
        rightIcon && renderIcon(rightIcon)));
});
