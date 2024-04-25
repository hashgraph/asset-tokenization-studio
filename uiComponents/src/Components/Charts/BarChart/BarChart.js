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
import { Stack as ChakraStack, } from "@chakra-ui/layout";
import { Progress as ChakraProgress, } from "@chakra-ui/progress";
import { Skeleton as ChakraSkeleton } from "@chakra-ui/react";
import { forwardRef, useMultiStyleConfig as useChakraMultiStyleConfig, } from "@chakra-ui/system";
import React from "react";
export var barChartPartsList = [
    "label",
    "track",
    "filledTrack",
];
export var BarChart = forwardRef(function (_a, ref) {
    var data = _a.data, _b = _a.spacingBars, spacingBars = _b === void 0 ? "4" : _b, isLoading = _a.isLoading, _c = _a.loadingColumnsCount, loadingColumnsCount = _c === void 0 ? 3 : _c;
    var styles = useChakraMultiStyleConfig("BarChart");
    return (React.createElement(ChakraStack, { ref: ref, sx: styles.container, spacing: spacingBars }, isLoading
        ? Array.from({ length: loadingColumnsCount }).map(function (_, index) { return (React.createElement(ChakraSkeleton, { key: index, width: "".concat(((index + 1) / loadingColumnsCount) * 100, "%"), h: 3 })); })
        : data.map(function (itemProps, index) { return (React.createElement(ChakraProgress, __assign({ key: index }, itemProps, { sx: styles.progress }))); })));
});
