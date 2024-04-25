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
import { Stepper as ChakraStepper } from "@chakra-ui/stepper";
export var stepperPartsList = [
    "description",
    "icon",
    "indicator",
    "number",
    "separator",
    "title",
    "step",
    "stepper",
    "stepTextContainer",
    "stepContainer",
];
export var Stepper = function (props) {
    var styles = useChakraMultiStyleConfig("Stepper", {});
    return React.createElement(ChakraStepper, __assign({}, props, { sx: styles.stepper }));
};
