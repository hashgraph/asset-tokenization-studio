import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { render as testingLibraryRender } from "@testing-library/react";
import React from "react";
import { BasePlatformTheme } from "./Theme/theme";
var DefaultTheme = extendTheme(BasePlatformTheme);
export var render = function (ui, theme) {
    if (theme === void 0) { theme = DefaultTheme; }
    var wrapper = function (_a) {
        var children = _a.children;
        return (React.createElement(ChakraProvider, { theme: theme }, children));
    };
    return testingLibraryRender(ui, { wrapper: wrapper });
};
