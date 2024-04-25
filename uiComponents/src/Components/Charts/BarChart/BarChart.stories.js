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
import { BarChart } from "./BarChart";
var meta = {
    title: "Design System/Charts/BarChart",
    component: BarChart,
    argTypes: {},
    parameters: {
        design: {
            type: "figma",
            url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=775%3A1702"
        },
        docs: {}
    },
    args: {
        max: 100,
        min: 0,
        value: 60,
        isLoading: false
    }
};
export default meta;
var Template = function (args) { return React.createElement(BarChart, __assign({}, args)); };
export var Default = Template.bind({});
Default.args = {
    data: [
        {
            value: 1
        },
        {
            value: 10
        },
        {
            value: 25
        },
        {
            value: 50
        },
        {
            value: 75
        },
        {
            value: 90
        },
        {
            value: 100
        },
    ]
};
