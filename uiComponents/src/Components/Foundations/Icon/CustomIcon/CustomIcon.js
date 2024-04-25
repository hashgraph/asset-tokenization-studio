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
import { createIcon as createChakraIcon } from "@chakra-ui/icon";
import { forwardRef, useTheme as useChakraTheme } from "@chakra-ui/system";
import _merge from "lodash/merge";
import React from "react";
export var CustomIcon = forwardRef(function (_a, ref) {
    var name = _a.name, props = __rest(_a, ["name"]);
    var configIcons = useChakraTheme().icons;
    if (!(name in configIcons)) {
        throw new Error("Icon '".concat(name, "' not found."));
    }
    var options = _merge(configIcons[name], {
        displayName: name,
        defaultProps: props
    });
    var NewIcon = createChakraIcon(options);
    return React.createElement(NewIcon, { ref: ref });
});
