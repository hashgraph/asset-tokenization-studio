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
import { Box } from "@chakra-ui/react";
import { Step as ChakraStep, StepIndicator, StepNumber, StepSeparator, StepStatus, StepTitle, } from "@chakra-ui/stepper";
import { Text } from "@/Components/Foundations";
export var Step = function (_a) {
    var complete = _a.complete, incomplete = _a.incomplete, active = _a.active, title = _a.title, description = _a.description, variant = _a.variant, titleComponent = _a.titleComponent, props = __rest(_a, ["complete", "incomplete", "active", "title", "description", "variant", "titleComponent"]);
    var styles = useChakraMultiStyleConfig("Stepper", {
        variant: variant
    });
    return (React.createElement(ChakraStep, __assign({}, props),
        React.createElement(StepIndicator, { sx: styles.indicator },
            React.createElement(StepStatus, { complete: complete || React.createElement(StepNumber, null), incomplete: incomplete || React.createElement(StepNumber, null), active: active || React.createElement(StepNumber, null) })),
        React.createElement(Box, { sx: styles.stepTextContainer },
            React.createElement(StepTitle, { as: titleComponent, noOfLines: 2 }, title),
            description && (React.createElement(Text, { sx: styles.description, noOfLines: 2 }, description))),
        React.createElement(StepSeparator, null)));
};
