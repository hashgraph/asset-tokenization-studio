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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
import { forwardRef, useMultiStyleConfig as useChakraMultiStyleConfig, } from "@chakra-ui/system";
import ReactECharts from "echarts-for-react";
import React from "react";
/**
 ** Theming parts of chart
 * you must adapt echarts api to chakra ui theme configuration
 * https://echarts.apache.org/en/option.html
 */
export var lineChartPartsList = ["grid", "xAxisLine", "yAxisLine", "xAxisLabel", "yAxisLabel", "series"];
export var LineChart = forwardRef(function (_a, ref) {
    var data = _a.data, props = __rest(_a, ["data"]);
    var styles = useChakraMultiStyleConfig("LineChart");
    var options = {
        grid: __assign({}, styles.grid),
        xAxis: {
            type: "category",
            data: __spreadArray([], data.map(function (_a) {
                var key = _a.key;
                return key;
            }), true),
            axisTick: { show: false },
            axisLine: { lineStyle: __assign({}, styles.xAxisLine) },
            axisLabel: __assign({}, styles.xAxisLabel)
        },
        yAxis: {
            type: "value",
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: __assign({}, styles.yAxisLabel),
            axisLine: {
                show: true,
                lineStyle: __assign({}, styles.yAxisLine)
            }
        },
        series: [
            {
                data: __spreadArray([], data.map(function (_a) {
                    var value = _a.value;
                    return value;
                }), true),
                type: "line",
                smooth: true,
                lineStyle: __assign({}, styles.series),
                symbol: "circle",
                symbolSize: 8
            },
        ],
        tooltip: {
            trigger: "axis"
        }
    };
    return React.createElement(ReactECharts, { ref: ref, option: options });
});
