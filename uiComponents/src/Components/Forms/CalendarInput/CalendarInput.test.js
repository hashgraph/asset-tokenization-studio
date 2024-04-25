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
import { fireEvent } from "@testing-library/react";
import { render } from "@/test-utils";
import { format, subDays } from "date-fns";
import { CalendarInput } from "./CalendarInput";
var defaultProps = {
    value: new Date("2022-05-08T00:00:00Z"),
    onChange: jest.fn()
};
describe("< ".concat(CalendarInput.name, " />"), function () {
    var componentFactory = function (props) {
        if (props === void 0) { props = defaultProps; }
        return render(React.createElement(CalendarInput, __assign({}, props)));
    };
    test("Should renders correctly", function () {
        var container = componentFactory().container;
        expect(container).toBeInTheDocument();
    });
    test("Should render withTimeInput", function () {
        var getByLabelText = componentFactory(__assign(__assign({}, defaultProps), { withTimeInput: true })).getByLabelText;
        expect(getByLabelText("Date")).toBeInTheDocument();
    });
    test("Should call onChange when the date is changed", function () {
        var _a = componentFactory(), getByLabelText = _a.getByLabelText, getByTestId = _a.getByTestId;
        var input = getByLabelText("Date");
        fireEvent.click(input);
        var yesterday = subDays(defaultProps.value, 1);
        var day = getByTestId("day-".concat(format(yesterday, "dd")));
        fireEvent.click(day);
        expect(defaultProps.onChange).toBeCalledTimes(1);
    });
    test("Should call on blur when popup is closing", function () {
        var onBlur = jest.fn();
        var getByLabelText = componentFactory(__assign(__assign({}, defaultProps), { onBlur: onBlur })).getByLabelText;
        var input = getByLabelText("Date");
        fireEvent.click(input);
        fireEvent.blur(input);
        expect(onBlur).toBeCalledTimes(1);
    });
});
