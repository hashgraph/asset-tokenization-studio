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
import { lineChartPartsList } from "@Components/Charts/LineChart";
import { colors } from "../../colors";
import { fontWeights } from "../../fonts";
var blue = colors.blue, neutral = colors.neutral;
/**
 * theming parts of chart
 * you must adapt echarts api to chakra ui theme configuration
 * https://echarts.apache.org/en/option.html
 */
var baseLabel = {
    color: neutral[400],
    fontWeight: fontWeights.normal
};
var baseAxisLine = {
    color: neutral[200],
    width: 1
};
export var ConfigLineChart = {
    parts: lineChartPartsList,
    baseStyle: {
        grid: { top: 8, right: 8, bottom: 24, left: 36 },
        xAxisLabel: __assign({}, baseLabel),
        xAxisLine: __assign({}, baseAxisLine),
        yAxisLabel: __assign({}, baseLabel),
        yAxisLine: __assign({}, baseAxisLine),
        series: {
            color: blue[500],
            width: 2
        },
        dotSeries: {
            color: blue[500]
        }
    }
};
