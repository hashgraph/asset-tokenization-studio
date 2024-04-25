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
import React, { useMemo } from "react";
import { forwardRef } from "@chakra-ui/system";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/react";
import { Tab as ChakraTab, TabList as ChakraTabList, TabPanel as ChakraTabPanel, TabPanels as ChakraTabPanels, Tabs as ChakraTabs, TabIndicator as ChakraTabIndicator, } from "@chakra-ui/tabs";
export var tabsPartsList = [
    "root",
    "tab",
    "tablist",
    "tabpanel",
    "tabpanels",
    "indicator",
];
export var Tabs = forwardRef(function (_a, ref) {
    var tabs = _a.tabs, listProps = _a.listProps, panelsProps = _a.panelsProps, variant = _a.variant, isFittedArg = _a.isFitted, props = __rest(_a, ["tabs", "listProps", "panelsProps", "variant", "isFitted"]);
    var isFitted = useMemo(function () {
        if (isFittedArg)
            return true;
        if (variant === "table")
            return true;
    }, [isFittedArg, variant]);
    var styles = useChakraMultiStyleConfig("Tabs", { variant: variant, isFitted: isFitted });
    return (React.createElement(ChakraTabs, __assign({ ref: ref, sx: styles.root }, props),
        React.createElement(ChakraTabList, __assign({ sx: styles.tablist }, listProps), tabs.map(function (_a, ix) {
            var content = _a.content, header = _a.header, tab = __rest(_a, ["content", "header"]);
            return (React.createElement(ChakraTab, __assign({ key: "tab_title_".concat(ix), sx: styles.tab }, tab), header));
        })),
        React.createElement(ChakraTabIndicator, { sx: styles.indicator }),
        React.createElement(ChakraTabPanels, __assign({ sx: styles.tabpanels }, panelsProps), tabs.map(function (_a, ix) {
            var content = _a.content;
            return (React.createElement(ChakraTabPanel, { sx: styles.tabpanel, key: "tab_content_".concat(ix) }, content));
        }))));
});
