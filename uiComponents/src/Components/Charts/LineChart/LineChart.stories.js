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
import { LineChart } from "./LineChart";
var meta = {
    title: "Design System/Charts/LineChart",
    component: LineChart,
    args: {},
    argTypes: {},
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1273%3A6253"
        },
        docs: {}
    }
};
export default meta;
var Template = function (args) { return React.createElement(LineChart, __assign({}, args)); };
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
export var Default = Template.bind({});
Default.args = {
    data: data
};
