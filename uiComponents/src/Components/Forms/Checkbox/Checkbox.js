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
import { Checkbox as ChakraCheckbox } from "@chakra-ui/checkbox";
import { useFormControlContext as useChakraFormControlContext } from "@chakra-ui/form-control";
import { forwardRef, useMultiStyleConfig as useChakraMultiStyleConfig, } from "@chakra-ui/system";
import React from "react";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Check } from "@phosphor-icons/react";
export var checkboxPartsList = ["container", "icon", "label", "control", "iconCustom"];
export var Checkbox = forwardRef(function (_a, ref) {
    var name = _a.name, isInvalid = _a.isInvalid, props = __rest(_a, ["name", "isInvalid"]);
    var formControl = useChakraFormControlContext() || {};
    var _b = useChakraMultiStyleConfig("Checkbox", __assign(__assign({}, props), { isInvalid: isInvalid })).iconCustom, ThemeIcon = _b === void 0 ? function () { return React.createElement(PhosphorIcon, { as: Check }); } : _b;
    var iconCustom = React.createElement(ThemeIcon, { isChecked: props.isChecked });
    return (React.createElement(ChakraCheckbox, __assign({ ref: ref, isInvalid: isInvalid !== null && isInvalid !== void 0 ? isInvalid : formControl.isInvalid, icon: iconCustom, name: name }, props)));
});
