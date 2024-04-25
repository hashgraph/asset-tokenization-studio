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
import { IconButton as ChakraIconButton } from "@chakra-ui/button";
import { forwardRef, useStyleConfig as useChakraStyleConfig, } from "@chakra-ui/system";
import _merge from "lodash/merge";
export var IconButton = forwardRef(function (_a, ref) {
    var size = _a.size, variant = _a.variant, icon = _a.icon, color = _a.color, sx = _a.sx, status = _a.status, props = __rest(_a, ["size", "variant", "icon", "color", "sx", "status"]);
    var themeStyles = useChakraStyleConfig("IconButton", {
        size: size,
        variant: variant,
        color: color,
        status: status
    });
    var styles = React.useMemo(function () { return _merge(themeStyles, sx); }, [themeStyles, sx]);
    return React.createElement(ChakraIconButton, __assign({ ref: ref, sx: styles }, props, { icon: icon }));
});
