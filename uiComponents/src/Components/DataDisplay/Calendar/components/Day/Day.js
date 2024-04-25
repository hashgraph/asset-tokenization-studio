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
import { useMultiStyleConfig as useChakraMultiStyleConfig, Flex, } from "@chakra-ui/react";
import { useDayRender, useDayPicker } from "react-day-picker";
import { Button } from "@Components/Interaction/Button";
import { Tooltip } from "@Components/Overlay/Tooltip";
import { useCalendarContext } from "../../context";
import { isSameDay, format } from "date-fns";
import { parseTimeInputValue } from "../../helpers";
export var Day = function (props) {
    var displayMonth = props.displayMonth, date = props.date, restProps = __rest(props, ["displayMonth", "date"]);
    var buttonRef = React.useRef(null);
    var _a = useDayRender(date, displayMonth, buttonRef), isDayHidden = _a.isHidden, divProps = _a.divProps, buttonProps = _a.buttonProps;
    var _b = useDayPicker(), selected = _b.selected, today = _b.today;
    var isToday = isSameDay(date, today);
    var _c = useCalendarContext(), colorScheme = _c.colorScheme, disabled = _c.isDisabled, _d = _c.todayTooltip, todayTooltip = _d === void 0 ? "Today" : _d, variant = _c.variant, timeInputValue = _c.timeInputValue, setTimeInputValue = _c.setTimeInputValue, _e = _c.disabledWeekends, disabledWeekends = _e === void 0 ? false : _e, _f = _c.disabledWeekdays, disabledWeekdays = _f === void 0 ? [] : _f, _g = _c.disabledDates, disabledDates = _g === void 0 ? [] : _g;
    var styles = useChakraMultiStyleConfig("Calendar", {
        colorScheme: colorScheme,
        disabled: disabled,
        variant: variant,
        isDayHidden: isDayHidden,
        isSelected: selected ? isSameDay(date, selected) : false,
        isToday: isToday
    });
    var handleClick = function (event) {
        var _a, _b;
        (_a = buttonProps.onClick) === null || _a === void 0 ? void 0 : _a.call(buttonProps, event);
        (_b = props.onClick) === null || _b === void 0 ? void 0 : _b.call(props, event);
        var dateTimeInput = parseTimeInputValue(timeInputValue, selected);
        if (dateTimeInput && !isSameDay(date, dateTimeInput)) {
            setTimeInputValue("");
        }
    };
    var checkDisabled = function () {
        if (disabled)
            return true;
        if (disabledWeekends && (date.getDay() === 0 || date.getDay() === 6))
            return true;
        if (disabledWeekdays.includes(date.getDay()))
            return true;
        if (disabledDates.some(function (disabledDate) { return isSameDay(date, disabledDate); }))
            return true;
        return buttonProps.disabled;
    };
    var buttonElement = (React.createElement(Flex, { w: "full", h: "full", justifyContent: "center", alignItems: "center" },
        React.createElement(Button, __assign({ "data-testid": "day-".concat(format(date, "dd")), variant: "none", size: "none", sx: styles.day, ref: buttonRef, isDisabled: checkDisabled(), onClick: handleClick }, restProps), divProps.children)));
    return isToday ? (React.createElement(Tooltip, { label: todayTooltip, sx: styles.todayTooltip }, buttonElement)) : (buttonElement);
};
