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
import { Progress as ChakraProgress } from "@chakra-ui/progress";
import React from "react";
export var progressPartsList = ["label", "track", "filledTrack"];
export var Progress = function (props) {
    return React.createElement(ChakraProgress, __assign({}, props));
};
