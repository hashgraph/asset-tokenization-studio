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
import { Box } from "@chakra-ui/layout";
import { forwardRef } from "@chakra-ui/system";
import React from "react";
import ReactMarkdown from "react-markdown";
import { ChakraUIMarkdownRenderer } from "./ChakraUIMarkdownRenderer";
export var MarkdownText = forwardRef(function (_a, ref) {
    var styles = _a.styles, children = _a.children, sx = _a.sx, linkTarget = _a.linkTarget, theme = _a.theme;
    return (React.createElement(Box, __assign({ ref: ref }, styles, { sx: sx }),
        React.createElement(ReactMarkdown, { linkTarget: linkTarget, components: ChakraUIMarkdownRenderer(theme) }, children)));
});
