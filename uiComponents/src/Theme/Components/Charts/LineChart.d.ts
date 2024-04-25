export declare const ConfigLineChart: {
    parts: ("grid" | "xAxisLine" | "xAxisLabel" | "yAxisLine" | "yAxisLabel" | "series")[];
    baseStyle: {
        grid: {
            top: number;
            right: number;
            bottom: number;
            left: number;
        };
        xAxisLabel: {
            color: string;
            fontWeight: number;
        };
        xAxisLine: {
            color: string;
            width: number;
        };
        yAxisLabel: {
            color: string;
            fontWeight: number;
        };
        yAxisLine: {
            color: string;
            width: number;
        };
        series: {
            color: string;
            width: number;
        };
        dotSeries: {
            color: string;
        };
    };
};
