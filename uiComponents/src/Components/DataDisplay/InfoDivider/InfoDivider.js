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
import { SimpleGrid as ChakraSimpleGrid, Divider as ChakraDivider, Flex as ChakraFlex, useMultiStyleConfig as useChakraMultiStyleConfig, Skeleton, } from "@chakra-ui/react";
import React from "react";
import { Text } from "../../Foundations/Text";
export var infoDividerPartsList = ["container", "titleContainer", "number", "step", "title", "divider"];
export var InfoDivider = function (_a) {
    var title = _a.title, number = _a.number, step = _a.step, type = _a.type, _b = _a.as, as = _b === void 0 ? "div" : _b, isLoading = _a.isLoading, props = __rest(_a, ["title", "number", "step", "type", "as", "isLoading"]);
    var styles = useChakraMultiStyleConfig("InfoDivider", {
        type: type,
        hasStep: step !== undefined,
        hasNumber: number !== undefined
    });
    return (React.createElement(ChakraSimpleGrid, __assign({ "data-testid": "info-divider", as: as }, props, { sx: styles.container }),
        isLoading ? (React.createElement(Skeleton, { w: 20, h: 4 })) : (React.createElement(ChakraFlex, { sx: styles.titleContainer },
            number && (React.createElement(Text, { sx: styles.number }, String(number).padStart(2, "0"))),
            step && type === "main" && React.createElement(Text, { sx: styles.step }, step),
            React.createElement(Text, { sx: styles.title }, title))),
        React.createElement(ChakraDivider, { orientation: "horizontal", sx: styles.divider })));
};
