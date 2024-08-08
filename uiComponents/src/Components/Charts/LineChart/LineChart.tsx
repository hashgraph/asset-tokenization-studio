import type { ComponentWithAs } from "@chakra-ui/system";
import {
  forwardRef,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/system";
import ReactECharts from "echarts-for-react";
import React from "react";

/**
 ** Theming parts of chart
 * you must adapt echarts api to chakra ui theme configuration
 * https://echarts.apache.org/en/option.html
 */

export const lineChartPartsList: Array<
  "grid" | "xAxisLine" | "xAxisLabel" | "yAxisLine" | "yAxisLabel" | "series"
> = ["grid", "xAxisLine", "yAxisLine", "xAxisLabel", "yAxisLabel", "series"];

export interface LineChartProps {
  data: { key: string; value: number }[];
}

export const LineChart: ComponentWithAs<"div", LineChartProps> = forwardRef<
  LineChartProps,
  "div"
>(({ data, ...props }: LineChartProps, ref) => {
  const styles = useChakraMultiStyleConfig("LineChart");

  const options = {
    grid: { ...styles.grid },
    xAxis: {
      type: "category",
      data: [...data.map(({ key }) => key)],
      axisTick: { show: false },
      axisLine: { lineStyle: { ...styles.xAxisLine } },
      axisLabel: { ...styles.xAxisLabel },
    },
    yAxis: {
      type: "value",
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { ...styles.yAxisLabel },
      axisLine: {
        show: true,
        lineStyle: { ...styles.yAxisLine },
      },
    },
    series: [
      {
        data: [...data.map(({ value }) => value)],
        type: "line",
        smooth: true,
        lineStyle: { ...styles.series },
        symbol: "circle",
        symbolSize: 8,
      },
    ],
    tooltip: {
      trigger: "axis",
    },
  };
  return <ReactECharts ref={ref} option={options} />;
});
