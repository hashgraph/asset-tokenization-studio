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
import { ConfigSpinner } from "@/Theme/Components/Spinner";
import React from "react";
import { Spinner } from "./Spinner";
describe("<Spinner />", function () {
    var factoryComponent = function (props) {
        if (props === void 0) { props = {}; }
        return render(React.createElement(Spinner, __assign({}, props)));
    };
    test("renders correctly", function () {
        var component = factoryComponent();
        var spinnerStyle = getComputedStyle(component.getByTestId("spinner"));
        expect(spinnerStyle.borderWidth).toBe(ConfigSpinner.sizes.xxs.borderWidth);
        expect(component.asFragment()).toMatchSnapshot("Default Spinner");
    });
    test("renders correctly with size", function () {
        var component = factoryComponent({ size: "sm" });
        var spinnerStyle = getComputedStyle(component.getByTestId("spinner"));
        expect(spinnerStyle.borderWidth).toBe(ConfigSpinner.sizes.sm.borderWidth);
        expect(component.asFragment()).toMatchSnapshot("Sized Spinner");
    });
});
