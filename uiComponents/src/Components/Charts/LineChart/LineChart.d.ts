import type { ComponentWithAs } from "@chakra-ui/system";
/**
 ** Theming parts of chart
 * you must adapt echarts api to chakra ui theme configuration
 * https://echarts.apache.org/en/option.html
 */
export declare const lineChartPartsList: Array<"grid" | "xAxisLine" | "xAxisLabel" | "yAxisLine" | "yAxisLabel" | "series">;
export interface LineChartProps {
    data: {
        key: string;
        value: number;
    }[];
}
export declare const LineChart: ComponentWithAs<"div", LineChartProps>;
