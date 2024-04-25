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
import { Icon as ChakraIcon } from "@chakra-ui/icon";
import { forwardRef } from "@chakra-ui/system";
import React from "react";
import { CustomIcon } from "./CustomIcon";
export var Icon = forwardRef(function (_a, ref) {
    var name = _a.name, props = __rest(_a, ["name"]);
    if (name) {
        return React.createElement(CustomIcon, __assign({ ref: ref, name: name }, props));
    }
    return React.createElement(ChakraIcon, __assign({ ref: ref }, props));
});
