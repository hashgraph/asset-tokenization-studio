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
import { render } from "@/test-utils";
import en from "date-fns/locale/en-US";
import { RootProvider } from "react-day-picker";
import { CalendarProvider } from "../context";
export var defaultDateValue = 1482363367071;
export var renderCalendar = function (ui, props) {
    return render(React.createElement(CalendarProvider, __assign({}, props),
        React.createElement(RootProvider, __assign({}, props), ui)));
};
export var defaultProps = {
    selected: new Date(defaultDateValue),
    onSelect: jest.fn(),
    onChange: jest.fn(),
    locale: en
};
export var freezeBeforeEach = function () {
    Date.now = jest.fn(function () { return defaultDateValue; });
    beforeEach(function () {
        jest.useFakeTimers({
            now: defaultDateValue
        });
    });
};
