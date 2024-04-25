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
import { useBreakpointValue } from "@chakra-ui/react";
import { forwardRef, useMultiStyleConfig as useChakraMultiStyleConfig, } from "@chakra-ui/system";
import { BreadcrumbDesktop } from "./BreadcrumbDesktop";
import { BreadcrumbMobile } from "./BreadcrumbMobile";
export var breadcrumbPartsList = ["container", "isDesktop", "item", "menu", "link", "separator"];
export var Breadcrumb = forwardRef(function (props, ref) {
    var breakpoint = useChakraMultiStyleConfig("Breadcrumb").isDesktop;
    var isDesktop = useBreakpointValue(breakpoint);
    if (isDesktop) {
        return React.createElement(BreadcrumbDesktop, __assign({ ref: ref }, props));
    }
    return React.createElement(BreadcrumbMobile, __assign({ ref: ref }, props));
});
