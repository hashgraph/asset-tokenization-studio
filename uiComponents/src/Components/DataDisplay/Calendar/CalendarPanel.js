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
import { useMultiStyleConfig as useChakraMultiStyleConfig, chakra, } from "@chakra-ui/react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/src/style.css";
import { CalendarFooter as Footer, CalendarHeader as Caption, } from "./components";
import { useCalendarContext } from "./context";
import { Day } from "./components/Day";
var StyledDatepicker = chakra(DayPicker);
export var CalendarPanel = function () {
    var _a = useCalendarContext(), colorScheme = _a.colorScheme, disabled = _a.isDisabled, variant = _a.variant, withTimeInput = _a.withTimeInput, props = __rest(_a, ["colorScheme", "isDisabled", "variant", "withTimeInput"]);
    var styles = useChakraMultiStyleConfig("Calendar", {
        colorScheme: colorScheme,
        disabled: disabled,
        variant: variant
    });
    return (React.createElement(StyledDatepicker, __assign({ sx: styles.container, captionLayout: "dropdown-buttons", components: {
            // TODO:  Agree with the product how it will be implemented
            Footer: withTimeInput ? Footer : undefined,
            Caption: Caption,
            Day: Day
        }, mode: "single", weekStartsOn: 1 }, props)));
};
