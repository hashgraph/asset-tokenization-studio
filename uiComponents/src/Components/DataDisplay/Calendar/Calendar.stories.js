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
import { Text, Box } from "@chakra-ui/react";
import { Calendar } from "./Calendar";
import { format } from "date-fns";
import es from "date-fns/locale/es";
import en from "date-fns/locale/en-US";
import { commonCalendarArgsTypes } from "@/storiesUtils/calendarUtils";
var localeMap = {
    es: es,
    en: en
};
var localeList = Object.keys(localeMap);
var meta = {
    title: "Design System/Data Display/Calendar",
    component: Calendar,
    argTypes: __assign({ locale: {
            options: localeList,
            mapping: localeMap,
            control: {
                type: "select",
                defaultValue: "en"
            },
            description: "Locale to be used for the calendar"
        }, colorScheme: {
            control: {
                type: "select",
                defaultValue: "primary"
            },
            describe: "Color scheme to be used for the calendar"
        } }, commonCalendarArgsTypes),
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?type=design&node-id=2265-18748&t=8mF1wtSUonz9gMRP-0"
        },
        docs: {}
    }
};
export default meta;
var Template = function (_a) {
    var _b = _a.disabledWeekdays, disabledWeekdays = _b === void 0 ? [] : _b, args = __rest(_a, ["disabledWeekdays"]);
    var _c = React.useState(new Date(2023, 3, 12)), selectedDate = _c[0], setSelectedDate = _c[1];
    return (React.createElement(Box, null,
        React.createElement(Calendar, { selected: selectedDate, fromDate: args.fromDate, toDate: args.toDate, onSelect: setSelectedDate, colorScheme: args.colorScheme, locale: args.locale, todayTooltip: args.todayTooltip, withTimeInput: args.withTimeInput, disabledWeekends: args.disabledWeekends, disabledWeekdays: disabledWeekdays, disabledDates: [args.disabledDates], isDisabled: args.isDisabled }),
        selectedDate && (React.createElement(Text, { mt: 4 },
            "Date: ",
            format(selectedDate, "dd/MM/yyyy - hh:mm:ss")))));
};
export var Default = Template.bind({});
Default.args = {
    fromDate: new Date(2022, 0, 1),
    toDate: new Date(2023, 7, 15)
};
export var WithTimeInput = Template.bind({});
WithTimeInput.args = __assign(__assign({}, Default.args), { withTimeInput: true });
