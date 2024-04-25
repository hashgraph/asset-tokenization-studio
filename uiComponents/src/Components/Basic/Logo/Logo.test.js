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
import { Logo } from "./Logo";
describe("<Logo />", function () {
    var defaultProps = {
        width: "100%",
        height: "100px",
        alt: "logo"
    };
    var factoryComponent = function (props) {
        if (props === void 0) { props = defaultProps; }
        return render(React.createElement(Logo, __assign({}, props)));
    };
    test("renders correctly", function () {
        var component = factoryComponent();
        expect(component.asFragment()).toMatchSnapshot("SizeFull");
    });
    test("renders correctly size iso", function () {
        var component = factoryComponent(__assign(__assign({}, defaultProps), { size: "iso" }));
        expect(component.asFragment()).toMatchSnapshot("SizeISO");
    });
});
