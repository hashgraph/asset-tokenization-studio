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
import { PanelTitle } from "@Components/DataDisplay/PanelTitle";
describe("<PanelTitle/>", function () {
    var defaultText = "Panel title";
    var defaultProps = {
        title: defaultText
    };
    var factoryComponent = function (props) {
        return render(React.createElement(PanelTitle, __assign({}, defaultProps, props)));
    };
    test("renders correctly", function () {
        var component = factoryComponent();
        expect(component.asFragment()).toMatchSnapshot();
        expect(component.getByText(defaultText)).toBeVisible();
    });
});
