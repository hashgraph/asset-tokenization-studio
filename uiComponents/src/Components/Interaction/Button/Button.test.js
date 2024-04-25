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
import { Button } from "./Button";
describe("<Button />", function () {
    var defaultText = "Content of the button";
    var defaultProps = {
        children: React.createElement(React.Fragment, null, defaultText)
    };
    var baseSizesList = ["md", "lg"];
    var baseVariantsList = ["primary", "tertiary", "secondary"];
    var statusColors = ["success", "error", "warning", "info"];
    var factoryComponent = function (props) {
        if (props === void 0) { props = defaultProps; }
        return render(React.createElement(Button, __assign({}, props)));
    };
    test("renders correctly", function () {
        var component = factoryComponent();
        expect(component.asFragment()).toMatchSnapshot();
    });
    test("shows correctly children", function () {
        var label = "Text of the button";
        var component = factoryComponent({ children: React.createElement(React.Fragment, null, label) });
        expect(component.getByText(label)).toBeVisible();
    });
    test("pass down props", function () {
        var component = factoryComponent({
            isDisabled: true,
            children: React.createElement(React.Fragment, null, defaultText)
        });
        expect(component.getByText(defaultText)).toBeDisabled();
    });
    baseVariantsList.forEach(function (variant) {
        baseSizesList.forEach(function (size) {
            statusColors.forEach(function (status) {
                test("renders correctly for size ".concat(size, " & variant ").concat(variant), function () {
                    var component = factoryComponent(__assign(__assign({}, defaultProps), { size: size, variant: variant, status: status }));
                    expect(component.asFragment()).toMatchSnapshot("Button-".concat(variant, "-").concat(size, "-").concat(status));
                });
            });
        });
    });
});
