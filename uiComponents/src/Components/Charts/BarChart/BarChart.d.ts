import { type StackProps as ChakraStackProps } from "@chakra-ui/layout";
import { type ProgressProps as ChakraProgressProps } from "@chakra-ui/progress";
import type { ComponentWithAs } from "@chakra-ui/system";
import { type progressAnatomy as ChakraProgressParts } from "@chakra-ui/anatomy";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";
export declare const barChartPartsList: typeof ChakraProgressParts.keys;
type Parts = typeof barChartPartsList;
export interface BarChartThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
}
export interface BarChartProps {
    data: ChakraProgressProps[];
    spacingBars?: ChakraStackProps["spacing"];
    isLoading?: boolean;
    loadingColumnsCount?: number;
}
export declare const BarChart: ComponentWithAs<"div", BarChartProps>;
export {};
