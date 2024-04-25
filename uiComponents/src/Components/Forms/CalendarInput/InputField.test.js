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
import { Popover } from "@chakra-ui/popover";
import { CalendarInputField } from "./CalendarInputField";
import { format } from "date-fns";
import { renderCalendar, defaultProps as defaultHelperProps, } from "@Components/DataDisplay/Calendar/helpers/test-helpers";
var FORMAT = "dd/MM/yyyy";
var defaultProps = __assign(__assign({}, defaultHelperProps), { inputProps: {
        format: FORMAT
    } });
var inputFieldDefaultProps = {
    value: defaultHelperProps.selected
};
describe("< ".concat(CalendarInputField.name, "/>"), function () {
    var componentFactory = function (props) {
        if (props === void 0) { props = defaultProps; }
        return renderCalendar(React.createElement(Popover, null,
            React.createElement(CalendarInputField, __assign({}, inputFieldDefaultProps))), props);
    };
    test("Should show the formated date ", function () {
        var getByDisplayValue = componentFactory().getByDisplayValue;
        expect(getByDisplayValue(format(defaultProps.selected, FORMAT))).toBeInTheDocument();
    });
});
