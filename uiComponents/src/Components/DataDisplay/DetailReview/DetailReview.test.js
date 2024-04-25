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
import { DetailReview } from "./DetailReview";
import React from "react";
var defaultProps = {
    title: "Example",
    value: "This is the value"
};
describe("< ".concat(DetailReview.name, " />"), function () {
    var factoryComponent = function (props) {
        if (props === void 0) { props = defaultProps; }
        return render(React.createElement(DetailReview, __assign({}, props)));
    };
    test("should render correctly", function () {
        var component = factoryComponent();
        expect(component.asFragment()).toMatchSnapshot();
    });
    test("should show title & value", function () {
        var component = factoryComponent();
        expect(component.getByText(defaultProps.title)).toBeInTheDocument();
        expect(component.getByText(defaultProps.value)).toBeInTheDocument();
    });
    test("should show skeleton when isLoading is true", function () {
        var component = factoryComponent(__assign({ isLoading: true }, defaultProps));
        expect(component.container).toMatchSnapshot("WithLoading");
    });
});
