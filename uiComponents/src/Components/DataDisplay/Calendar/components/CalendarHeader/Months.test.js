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
import { MonthsPanel } from "./MonthsPanel";
import { Menu } from "@chakra-ui/menu";
import { renderCalendar, defaultProps as helperDefaultProps, freezeBeforeEach, } from "../../helpers/test-helpers";
import { subYears, addYears } from "date-fns";
var defaultProps = __assign(__assign({}, helperDefaultProps), { fromDate: subYears(helperDefaultProps.selected, 2), toDate: addYears(helperDefaultProps.selected, 2) });
describe("< ".concat(MonthsPanel.name, "/>"), function () {
    freezeBeforeEach();
    var componentFactory = function (props) {
        if (props === void 0) { props = defaultProps; }
        return renderCalendar(React.createElement(Menu, null,
            React.createElement(MonthsPanel, null)), props);
    };
    test("Should render 12 months", function () {
        var getByText = componentFactory().getByText;
        var monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        monthNames.forEach(function (monthName) {
            expect(getByText(monthName)).toBeInTheDocument();
        });
    });
});
