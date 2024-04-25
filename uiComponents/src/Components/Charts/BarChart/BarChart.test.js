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
import { BarChart } from "./BarChart";
var data = [
    { value: 10 },
    { value: 20 },
    { value: 30 },
    { value: 40 },
    { value: 50 },
    { value: 60 },
    { value: 70 },
    { value: 80 },
];
describe("<BarChart />", function () {
    var spacingBars = { spacingBars: "4" };
    var factoryComponent = function (props) {
        return render(React.createElement(BarChart, __assign({}, props)));
    };
    test("renders correctly", function () {
        var component = factoryComponent({ data: data });
        expect(component.asFragment()).toMatchSnapshot();
    });
    test("renders correctly when spacingBars is passed", function () {
        var component = factoryComponent(__assign({ data: data }, spacingBars));
        expect(component.asFragment()).toMatchSnapshot("Using spacingBars");
    });
    test("renders correctly when isLoading is passed", function () {
        var component = factoryComponent({ data: data, isLoading: true });
        expect(component.asFragment()).toMatchSnapshot("Using isLoading");
    });
});
