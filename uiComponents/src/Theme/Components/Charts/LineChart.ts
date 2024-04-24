import { lineChartPartsList } from "@Components/Charts/LineChart";
import { colors } from "../../colors";
import { fontWeights } from "../../fonts";

const { blue, neutral } = colors;

/**
 * theming parts of chart
 * you must adapt echarts api to chakra ui theme configuration
 * https://echarts.apache.org/en/option.html
 */

const baseLabel = {
  color: neutral[400],
  fontWeight: fontWeights.normal,
};

const baseAxisLine = {
  color: neutral[200],
  width: 1,
};

export const ConfigLineChart = {
  parts: lineChartPartsList,
  baseStyle: {
    grid: { top: 8, right: 8, bottom: 24, left: 36 },
    xAxisLabel: {
      ...baseLabel,
    },
    xAxisLine: {
      ...baseAxisLine,
    },
    yAxisLabel: {
      ...baseLabel,
    },
    yAxisLine: {
      ...baseAxisLine,
    },
    series: {
      color: blue[500],
      width: 2,
    },
    dotSeries: {
      color: blue[500],
    },
  },
};
