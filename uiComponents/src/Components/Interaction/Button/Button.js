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
import { Button as ChakraButton } from "@chakra-ui/button";
import { useStyleConfig } from "@chakra-ui/react";
import { forwardRef } from "@chakra-ui/system";
import { Spinner } from "../../Indicators/Spinner/Spinner";
import _merge from "lodash/merge";
export var Button = forwardRef(function (_a, ref) {
    var children = _a.children, sx = _a.sx, status = _a.status, props = __rest(_a, ["children", "sx", "status"]);
    var themeStyles = useStyleConfig("Button", __assign(__assign({}, props), { status: status }));
    var loadingText = typeof children === "string" && !props.loadingText
        ? children
        : props.loadingText;
    var styles = React.useMemo(function () { return _merge(themeStyles, sx); }, [themeStyles, sx]);
    return (React.createElement(ChakraButton, __assign({ ref: ref, loadingText: loadingText, spinner: React.createElement(Spinner, { size: "xxs" }) }, props, { sx: styles }), children));
});
