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
import { PopoverTrigger } from "@chakra-ui/popover";
import { format as formatFn } from "date-fns";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { CalendarBlank, CaretDown } from "@phosphor-icons/react";
import { Input } from "@Components/Forms/Input";
export var DEFAULT_FORMAT_DATE = "dd/MM/yyyy";
export var CalendarInputField = function (_a) {
    var value = _a.value, defaultValue = _a.defaultValue, _b = _a.format, format = _b === void 0 ? DEFAULT_FORMAT_DATE : _b, props = __rest(_a, ["value", "defaultValue", "format"]);
    return (React.createElement(PopoverTrigger, null,
        React.createElement(Input, __assign({ "aria-label": "Date", autoComplete: "off", value: value ? formatFn(value, format) : "", addonLeft: React.createElement(PhosphorIcon, { as: CalendarBlank, color: "neutral.500" }), addonRight: React.createElement(PhosphorIcon, { _hover: {
                    cursor: "pointer"
                }, as: CaretDown, size: "lg", color: "neutral.500", "aria-label": "Select a date" }) }, props, { onChange: function () { } }))));
};
