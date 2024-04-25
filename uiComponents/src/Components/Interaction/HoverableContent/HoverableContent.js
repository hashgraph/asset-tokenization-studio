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
import { useHover } from "@/Hooks";
import { Flex } from "@chakra-ui/react";
import React from "react";
export var HoverableContent = function (_a) {
    var children = _a.children, hiddenContent = _a.hiddenContent, props = __rest(_a, ["children", "hiddenContent"]);
    var _b = useHover(), containerRef = _b[0], isHovered = _b[1], refHover = _b[2];
    var handleEvent = function (eventName) {
        if (refHover.current) {
            refHover.current.dispatchEvent(new Event(eventName));
        }
    };
    return (React.createElement(Flex, __assign({ ref: containerRef, "data-testid": "hoverable-content", tabIndex: 0, onFocus: function () { return handleEvent("mouseenter"); }, onBlur: function () { return handleEvent("mouseleave"); }, _focusVisible: { outline: "var(--chakra-colors-primary-100) auto 1px" } }, props),
        children,
        isHovered && hiddenContent));
};
