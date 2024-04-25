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
import { Calendar } from "./index";
import { defaultProps, freezeBeforeEach } from "./helpers/test-helpers";
describe("< ".concat(Calendar.name, " />"), function () {
    var componentFactory = function (props) {
        if (props === void 0) { props = defaultProps; }
        return render(React.createElement(Calendar, __assign({}, props)));
    };
    freezeBeforeEach();
    test("Should match to snapshot", function () {
        var container = componentFactory().container;
        expect(container).toBeInTheDocument();
    });
    test("Should select date", function () {
        var pressedDay = new Date();
        var getByText = componentFactory().getByText;
        var day = pressedDay.getDate();
        var dayElement = getByText(day.toString());
        fireEvent.click(dayElement);
        expect(defaultProps.onSelect).toHaveBeenCalled();
    });
});
