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
import { FileInput } from "./FileInput";
describe("<File />", function () {
    var label = "label";
    var description = "description";
    var defaultProps = {
        label: label,
        description: description
    };
    var isDisabled = { isDisabled: true };
    var isInvalid = { isInvalid: true };
    var factoryComponent = function (props) {
        if (props === void 0) { props = defaultProps; }
        return render(React.createElement(FileInput, __assign({}, props)));
    };
    test("renders correctly", function () {
        var component = factoryComponent();
        expect(component.asFragment()).toMatchSnapshot();
    });
    test("shows correctly when is disabled", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), isDisabled));
        var container = component.getByTestId("input-file");
        expect(container).toHaveStyle("cursor:not-allowed");
    });
    test("shows correctly when is invalid", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), isInvalid));
        var container = component.getByTestId("input-file");
        expect(container).toHaveStyle("border-color:var(--chakra-colors-error-500)");
    });
});
