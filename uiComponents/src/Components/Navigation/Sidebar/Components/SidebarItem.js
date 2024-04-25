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
import { forwardRef, useMultiStyleConfig as useChakraMultiStyleConfig, } from "@chakra-ui/system";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Text } from "@/Components/Foundations/Text";
import { useHover } from "@/Hooks";
import { Center as ChakraCenter, Flex as ChakraFlex, useMergeRefs as useChakraMergeRefs, } from "@chakra-ui/react";
export var sidebarPartsList = ["iconWeight", "icon", "label", "container"];
export var SidebarItem = forwardRef(function (_a, ref) {
    var isActive = _a.isActive, isDisabled = _a.isDisabled, label = _a.label, icon = _a.icon, props = __rest(_a, ["isActive", "isDisabled", "label", "icon"]);
    var _b = useHover(), containerRef = _b[0], isHovered = _b[1];
    var refs = useChakraMergeRefs(containerRef, ref);
    var styles = useChakraMultiStyleConfig("SidebarItem", {
        isHovered: isHovered,
        isActive: isActive,
        isDisabled: isDisabled
    });
    return (React.createElement(ChakraFlex, __assign({ align: "center", direction: "column", outline: "none", "data-testid": "sidebar-item-".concat(label), disabled: isDisabled, ref: refs }, props, { sx: styles.container }),
        React.createElement(ChakraCenter, { as: "button", sx: styles.icon },
            React.createElement(PhosphorIcon, { size: "xs", as: icon, weight: styles.iconWeight })),
        React.createElement(Text, { sx: styles.label },
            label,
            " ")));
});
