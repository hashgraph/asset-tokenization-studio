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
import { SkeletonCircle as ChakraSkeletonCircle } from "@chakra-ui/react";
import React from "react";
import { CircularProgress as ChakraCircularProgress, CircularProgressLabel as ChakraCircularProgressLabel, } from "@chakra-ui/progress";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
export var circularSliderPartsList = [
    "label",
    "track",
];
export var CircularSlider = function (_a) {
    var label = _a.label, size = _a.size, isLoading = _a.isLoading, props = __rest(_a, ["label", "size", "isLoading"]);
    var styles = useChakraMultiStyleConfig("CircularSlider", { size: size });
    if (isLoading) {
        return React.createElement(ChakraSkeletonCircle, { sx: styles.track });
    }
    return (React.createElement(ChakraCircularProgress, __assign({ sx: styles.track }, props), label !== undefined && (React.createElement(ChakraCircularProgressLabel, { sx: styles.label }, label))));
};
