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
import { AddAreaButton } from "./AddAreaButton";
describe("<AddAreaButton />", function () {
    var defaultLabel = "Add element text";
    var defaultProps = {
        children: defaultLabel
    };
    var factoryComponent = function (props) {
        if (props === void 0) { props = defaultProps; }
        return render(React.createElement(AddAreaButton, __assign({}, props)));
    };
    test("renders correctly", function () {
        var component = factoryComponent();
        expect(component.asFragment()).toMatchSnapshot();
    });
    test("shows correctly children", function () {
        var component = factoryComponent();
        expect(component.getByText(defaultLabel)).toBeVisible();
    });
    test("pass down props", function () {
        var component = factoryComponent({
            isDisabled: true,
            children: defaultLabel
        });
        expect(component.getByTestId("add-area-button")).toBeDisabled();
    });
});
