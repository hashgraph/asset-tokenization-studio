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
import { Weight } from "@/Components/Foundations/PhosphorIcon";
import { usePopupContext } from "../context/PopupContext";
export var PopUpIcon = function (_a) {
    var icon = _a.icon;
    var styles = usePopupContext().styles;
    return React.cloneElement(icon, __assign({ sx: __assign({}, styles.icon), weight: Weight.Fill, size: "md" }, icon.props));
};
