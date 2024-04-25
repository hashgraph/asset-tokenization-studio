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
import { Weight } from "@/Components/Foundations/PhosphorIcon";
import { focusVisible } from "@/Theme/utils";
import { sidebarPartsList } from "@Components/Navigation/Sidebar";
var iconActiveStyle = {
    bg: "primary.100",
    color: "neutral.900"
};
var iconHoverStyle = {
    bg: "neutral.200"
};
var iconDisabledStyle = {
    color: "neutral.200"
};
var labelActiveStyle = {
    textStyle: "ElementsSemiboldXS",
    color: "neutral.900"
};
var labelDisabledStyle = {
    color: "neutral.200"
};
export var ConfigSidebarItem = {
    parts: sidebarPartsList,
    baseStyle: function (_a) {
        var isHovered = _a.isHovered, isActive = _a.isActive, isDisabled = _a.isDisabled;
        var isItemActive = isActive && !isDisabled;
        return {
            iconWeight: isActive && !isDisabled ? Weight.Fill : Weight.Regular,
            icon: __assign(__assign(__assign({ _focusVisible: focusVisible, borderColor: "red", color: "neutral.800", p: 1, borderRadius: "8px", transition: "all .3s ease", svg: {
                    color: "inherit"
                } }, (isHovered && iconHoverStyle)), (isItemActive && iconActiveStyle)), (isDisabled && iconDisabledStyle)),
            label: __assign(__assign({ transition: "all .3s ease", color: "neutral.800", textStyle: "ElementsMediumXS", mt: 1, px: 1 }, (isItemActive && labelActiveStyle)), (isDisabled && labelDisabledStyle)),
            container: {
                cursor: isDisabled ? "not-allowed" : "pointer",
                px: 2
            }
        };
    }
};
