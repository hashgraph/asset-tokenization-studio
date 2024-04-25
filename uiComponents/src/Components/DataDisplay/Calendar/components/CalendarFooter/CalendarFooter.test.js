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
import { CalendarFooter } from "./CalendarFooter";
import { fireEvent } from "@testing-library/react";
import { renderCalendar, defaultProps, defaultDateValue, } from "../../helpers/test-helpers";
import { getZone } from "../../helpers";
var withTimeInputProps = __assign(__assign({}, defaultProps), { withTimeInput: true });
jest.mock("../../helpers", function () { return (__assign(__assign({}, jest.requireActual("../../helpers")), { parseTimeInputValue: jest.fn(function () { return new Date(defaultDateValue); }) })); });
describe("< ".concat(CalendarFooter.name, "/>"), function () {
    var componentFactory = function (props) {
        if (props === void 0) { props = withTimeInputProps; }
        return renderCalendar(React.createElement(CalendarFooter, null), props);
    };
    test("Should renders without correctly", function () {
        var container = componentFactory(defaultProps).container;
        expect(container).toBeInTheDocument();
    });
    test("Should renders with time input correctly", function () {
        var container = componentFactory().container;
        expect(container).toBeInTheDocument();
    });
    test("Should show GMT zone", function () {
        var getByText = componentFactory().getByText;
        expect(getByText(getZone())).toBeInTheDocument();
    });
    test("the input should change value and displays in format", function () {
        var getByTestId = componentFactory().getByTestId;
        var input = getByTestId("time-input");
        fireEvent.change(input, { target: { value: "12:00:00" } });
        expect(input).toHaveValue("12:00:00");
        expect(defaultProps.onChange).toBeCalledTimes(1);
    });
});
