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
import { render } from "@testing-library/react";
import React from "react";
import { Textarea } from "./Textarea";
describe("<Textarea />", function () {
    var testId = "textareaTest";
    var defaultProps = {};
    var factoryComponent = function (props) {
        if (props === void 0) { props = defaultProps; }
        return render(React.createElement(Textarea, __assign({ "data-testid": testId }, props)));
    };
    test("renders correctly", function () {
        var component = factoryComponent();
        expect(component.asFragment()).toMatchSnapshot();
    });
    test("shows correctly when is disabled", function () {
        var component = factoryComponent({ isDisabled: true });
        expect(component.asFragment()).toMatchSnapshot("Using disabled");
    });
    test("shows correctly when is invalid", function () {
        var component = factoryComponent({ isInvalid: true });
        expect(component.asFragment()).toMatchSnapshot("Using invalid");
    });
    test("shows correctly when is success", function () {
        var component = factoryComponent({ isSuccess: true });
        expect(component.asFragment()).toMatchSnapshot("Using success");
    });
});
