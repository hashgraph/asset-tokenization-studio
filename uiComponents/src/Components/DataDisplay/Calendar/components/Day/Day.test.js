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
import { format } from "date-fns";
import { Day } from "./Day";
import { renderCalendar, defaultProps } from "../../helpers/test-helpers";
var DATE_BY_DEFAULT = new Date(2023, 1, 15);
var defaultDayProps = {
    date: DATE_BY_DEFAULT,
    displayMonth: DATE_BY_DEFAULT
};
describe("< ".concat(Day.name, "/>"), function () {
    var componentFactory = function (props, dayProps) {
        if (props === void 0) { props = defaultProps; }
        if (dayProps === void 0) { dayProps = defaultDayProps; }
        return renderCalendar(React.createElement(Day, __assign({}, dayProps)), props);
    };
    test("Should show the formated date ", function () {
        var component = componentFactory();
        expect(component.getByTestId("day-".concat(format(defaultDayProps.date, "dd")))).toBeInTheDocument();
    });
});
