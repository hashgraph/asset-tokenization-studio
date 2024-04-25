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
import { render } from "@/test-utils";
import { Breadcrumb } from "./Breadcrumb";
import { defaultProps } from "./commonTests";
describe("<Breadcrumb />", function () {
    var factoryComponent = function (props) {
        return render(React.createElement(Breadcrumb, __assign({}, props)));
    };
    test("renders correctly default", function () {
        var component = factoryComponent(defaultProps);
        expect(component.asFragment()).toMatchSnapshot("default");
    });
    test("renders correctly with MaxItems to show", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), { showMaxItems: true }));
        expect(component.asFragment()).toMatchSnapshot("showMaxItems");
    });
});
