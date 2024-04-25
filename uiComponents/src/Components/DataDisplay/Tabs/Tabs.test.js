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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { render } from "@/test-utils";
import React from "react";
import { Tabs } from "./Tabs";
var tabs = __spreadArray([], Array(5), true).map(function (_el, index) { return ({
    header: "Tab ".concat(index + 1),
    content: "Tab ".concat(index + 1, " Content "),
    "data-testid": "tab-header-".concat(index + 1)
}); });
describe("<Tabs />", function () {
    var factoryComponent = function (props) { return render(React.createElement(Tabs, __assign({}, props))); };
    test("renders correctly", function () {
        var component = factoryComponent({ tabs: tabs });
        expect(component.asFragment()).toMatchSnapshot();
    });
    test("Renders the number of tabs passed by arg", function () {
        var component = factoryComponent({ tabs: tabs });
        expect(component.getAllByTestId(/tab-header.*/).length).toBe(5);
        expect(component.asFragment()).toMatchSnapshot();
    });
});
