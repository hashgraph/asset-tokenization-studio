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
import { Box, Flex as ChakraFlex, SkeletonText, useMultiStyleConfig as useChakraMultiStyleConfig, } from "@chakra-ui/react";
import { Text } from "../../Foundations/Text";
import React from "react";
export var detailReviewPartsList = [
    "title",
    "value",
    "container",
];
export var DetailReview = function (_a) {
    var title = _a.title, value = _a.value, isLoading = _a.isLoading, props = __rest(_a, ["title", "value", "isLoading"]);
    var styles = useChakraMultiStyleConfig("DetailReview");
    return (React.createElement(ChakraFlex, __assign({}, props, { sx: styles.container }),
        React.createElement(Text, { sx: styles.title }, title),
        isLoading ? (React.createElement(SkeletonText, { skeletonHeight: 4, noOfLines: 1 })) : (React.createElement(React.Fragment, null, React.isValidElement(value) ? (React.createElement(Box, { sx: styles.value }, value)) : (React.createElement(Text, { sx: styles.value }, value))))));
};
