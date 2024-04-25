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
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
import { CopySimple } from "@phosphor-icons/react";
import { IconButton } from "@Components/Interaction/IconButton";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { useClipboard } from "@chakra-ui/react";
export var clipboardButtonPartsList = ["iconButton", "icon", "tooltip"];
export var ClipboardButton = function (_a) {
    var value = _a.value, variant = _a.variant, _b = _a.size, size = _b === void 0 ? "xxs" : _b, props = __rest(_a, ["value", "variant", "size"]);
    var styles = useChakraMultiStyleConfig("ClipboardButton", { variant: variant });
    var onCopy = useClipboard(value).onCopy;
    return (React.createElement(IconButton, __assign({ "aria-label": "Copy to clipboard-".concat(value), icon: React.createElement(PhosphorIcon, { sx: styles.icon, size: size, as: CopySimple }), onClick: function (e) {
            e.stopPropagation();
            onCopy();
        }, variant: "tertiary", sx: styles.iconButton }, props)));
};
