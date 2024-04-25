var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/*eslint import/namespace: ['error', { allowComputed: true }]*/
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import * as Icons from "@phosphor-icons/react";
import React from "react";
export var iconList = __spreadArray(["none"], Object.keys(Icons), true);
export var iconLabels = iconList.map(function (iconName) {
    var _a;
    return (_a = {},
        _a[iconName] = iconName === "none" ? undefined : iconName,
        _a);
});
export var mappedIcons = iconList.reduce(function (acc, iconName) {
    var iconKey = iconName === "none" ? undefined : iconName;
    if (iconKey) {
        acc[iconName] = React.createElement(PhosphorIcon, { as: Icons[iconKey] });
    }
    else {
        acc[iconName] = null;
    }
    return acc;
}, {});
