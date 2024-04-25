import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { InterFonts } from "./Foundations/Fonts";
import React from "react";
import { BasePlatformTheme } from "@/Theme";
var theme = extendTheme(BasePlatformTheme);
export var ThemeStoryWrapper = function (_a) {
    var children = _a.children;
    return (React.createElement(ChakraProvider, { theme: theme },
        React.createElement(InterFonts, null),
        children));
};
