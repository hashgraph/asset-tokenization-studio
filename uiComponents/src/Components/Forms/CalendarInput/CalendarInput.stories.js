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
import { Flex, Text } from "@chakra-ui/react";
import { format } from "date-fns";
import { CalendarInput } from "./CalendarInput";
import { commonCalendarArgsTypes } from "@/storiesUtils/calendarUtils";
var meta = {
    title: "Design System/Forms/CalendarInput",
    component: CalendarInput,
    args: {
        format: "dd/MM/yyyy",
        withTimeInput: true
    },
    argTypes: __assign({}, commonCalendarArgsTypes),
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=1874%3A15429&t=GPCIOt6k4o0cCWIe-4"
        },
        docs: {}
    }
};
export default meta;
var Template = function (args) {
    var _a = React.useState(new Date(2023, 3, 12)), selectedDate = _a[0], setSelectedDate = _a[1];
    return (React.createElement(Flex, { flexDirection: "column", width: "200px" },
        React.createElement(CalendarInput, __assign({}, args, { value: selectedDate, onChange: setSelectedDate })),
        selectedDate && (React.createElement(Text, { mt: 4 },
            "Date: ",
            format(selectedDate, "dd/MM/yyyy - hh:mm:ss")))));
};
export var Default = Template.bind({});
export var WithTimeInput = Template.bind({});
WithTimeInput.args = {
    withTimeInput: true
};
