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
import { render } from "@/test-utils";
import React from "react";
import { Progress } from "./Progress";
describe("<Progress />", function () {
    var value = 60;
    var min = 0;
    var max = 100;
    var hasStripe = false;
    var isAnimated = false;
    var isIndeterminate = false;
    var defaultProps = {
        value: value,
        min: min,
        max: max,
        hasStripe: hasStripe,
        isAnimated: isAnimated,
        isIndeterminate: isIndeterminate
    };
    var factoryComponent = function (props) {
        return render(React.createElement(Progress, __assign({}, props)));
    };
    test("renders correctly", function () {
        var component = factoryComponent(__assign({}, defaultProps));
        var progressStyle = getComputedStyle(component.getByRole("progressbar"));
        expect(progressStyle.width).toBe("".concat((defaultProps.value / (defaultProps.max - defaultProps.min)) * 100, "%"));
        expect(component.asFragment()).toMatchSnapshot("Default progress");
    });
    test("renders correctly with stripes", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), { hasStripe: true }));
        var progressStyle = getComputedStyle(component.getByRole("progressbar"));
        expect(progressStyle.width).toBe("".concat((defaultProps.value / (defaultProps.max - defaultProps.min)) * 100, "%"));
        expect(component.asFragment()).toMatchSnapshot("Striped progress");
    });
    test("renders correctly with stripes and animation", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), { hasStripe: true, isAnimated: true }));
        var progressStyle = getComputedStyle(component.getByRole("progressbar"));
        expect(progressStyle.width).toBe("".concat((defaultProps.value / (defaultProps.max - defaultProps.min)) * 100, "%"));
        expect(component.asFragment()).toMatchSnapshot("Striped progress with animation");
    });
});
