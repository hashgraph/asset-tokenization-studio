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
import React from "react";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
export var logoPartsList = [
    "fullImage",
    "isoImage",
];
export var Logo = function (_a) {
    var _b = _a.size, size = _b === void 0 ? "full" : _b, variant = _a.variant, _c = _a.width, width = _c === void 0 ? "auto" : _c, _d = _a.height, height = _d === void 0 ? "auto" : _d, customStyle = _a.customStyle, alt = _a.alt;
    var _e = useChakraMultiStyleConfig("Logo", {
        variant: variant
    }), fullImage = _e.fullImage, isoImage = _e.isoImage;
    var srcBySize = {
        full: fullImage,
        iso: isoImage
    };
    return (React.createElement("img", { alt: alt, src: srcBySize[size], style: __assign({ width: width, height: height }, customStyle) }));
};
