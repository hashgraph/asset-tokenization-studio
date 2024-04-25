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
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/react";
import { Popover, PopoverContent } from "@chakra-ui/popover";
import { CalendarInputField } from "./CalendarInputField";
import { Calendar } from "@Components/DataDisplay/Calendar";
import _merge from "lodash/merge";
export var CalendarInput = function (_a) {
    var colorScheme = _a.colorScheme, locale = _a.locale, todayTooltip = _a.todayTooltip, variant = _a.variant, onClose = _a.onClose, withTimeInput = _a.withTimeInput, fromDate = _a.fromDate, toDate = _a.toDate, disabledWeekends = _a.disabledWeekends, disabledWeekdays = _a.disabledWeekdays, disabledDates = _a.disabledDates, _b = _a.calendarProps, calendarPropsArgs = _b === void 0 ? {} : _b, props = __rest(_a, ["colorScheme", "locale", "todayTooltip", "variant", "onClose", "withTimeInput", "fromDate", "toDate", "disabledWeekends", "disabledWeekdays", "disabledDates", "calendarProps"]);
    var styles = useChakraMultiStyleConfig("Calendar", {
        colorScheme: colorScheme,
        variant: variant,
        isDisabled: props.isDisabled
    });
    var calendarProps = _merge({}, {
        mode: "single",
        colorScheme: colorScheme,
        locale: locale,
        todayTooltip: todayTooltip,
        variant: variant,
        onClose: onClose,
        withTimeInput: withTimeInput,
        fromDate: fromDate,
        toDate: toDate,
        disabledWeekends: disabledWeekends,
        disabledWeekdays: disabledWeekdays,
        disabledDates: disabledDates,
        selected: props.value,
        onDayClick: props.onChange,
        onChange: props.onChange,
        isDisabled: props.isDisabled
    }, calendarPropsArgs);
    return (React.createElement(Popover, { isLazy: true, onClose: function () {
            var _a;
            (_a = props.onBlur) === null || _a === void 0 ? void 0 : _a.call(props);
        }, placement: "bottom-start", offset: [0, 4] },
        React.createElement(CalendarInputField, __assign({ sx: styles.input }, props)),
        React.createElement(PopoverContent, { maxW: "none", p: 0, bgColor: "transparent", border: "none" },
            React.createElement(Calendar, __assign({}, calendarProps)))));
};
