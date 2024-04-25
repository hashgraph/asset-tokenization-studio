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
import * as echarts from "echarts";
import React from "react";
import { LineChart } from "./LineChart";
var data = [
    {
        key: "2/8",
        value: 200
    },
    {
        key: "2/14",
        value: 340
    },
    {
        key: "2/18",
        value: 150
    },
    {
        key: "2/22",
        value: 390
    },
    {
        key: "2/22",
        value: 250
    },
    {
        key: "2/24",
        value: 320
    },
    {
        key: "3/1",
        value: 200
    },
];
describe("<LineChart />", function () {
    var defaultProps = {
        data: data
    };
    var spy;
    beforeAll(function () {
        // @ts-ignore
        spy = jest.spyOn(echarts, "getInstanceByDom").mockImplementation(function () {
            return {
                setOption: jest.fn(),
                hideLoading: jest.fn()
            };
        });
    });
    var factoryComponent = function (props) {
        if (props === void 0) { props = defaultProps; }
        return render(React.createElement(LineChart, __assign({}, props)));
    };
    test("renders correctly", function () {
        var component = factoryComponent();
        expect(component.asFragment()).toMatchSnapshot();
    });
    afterAll(function () {
        spy.mockRestore();
    });
});
