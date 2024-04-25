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
import { Flex, useMultiStyleConfig as useChakraMultiStyleConfig, } from "@chakra-ui/react";
import React from "react";
import { Text } from "@/Components/Foundations/Text";
export var panelTitlePartsList = [
    "title",
    "container",
];
export var PanelTitle = function (_a) {
    var title = _a.title, titleProps = _a.titleProps, props = __rest(_a, ["title", "titleProps"]);
    var styles = useChakraMultiStyleConfig("PanelTitle");
    return (React.createElement(Flex, __assign({ sx: styles.container }, props),
        React.createElement(Text, __assign({ sx: styles.title }, titleProps), title)));
};
