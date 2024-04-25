/// <reference types="react" />
import type { BaseMultiStyleConfiguration, PartsStyleInterpolation } from "@/Theme/Components/BaseMultiStyleConfiguration";
import type { SimpleGridProps as ChakraSimpleGridProps } from "@chakra-ui/react";
import type { SystemStyleObject as ChakraSystemStyleObject } from "@chakra-ui/system";
export declare const infoDividerPartsList: Array<"container" | "titleContainer" | "number" | "step" | "title" | "divider">;
type Parts = typeof infoDividerPartsList;
type InfoDividerType = "main" | "secondary";
export type InfoDividerConfigProps = {
    type: InfoDividerType;
    hasStep: boolean;
    hasNumber: boolean;
};
export interface InfoDividerThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
    baseStyle: ((args: InfoDividerConfigProps) => Partial<InfoDividerThemeStyle>) | PartsStyleInterpolation<Parts>;
}
export interface InfoDividerProps extends Omit<ChakraSimpleGridProps, "as"> {
    title: string;
    number?: number;
    step?: number;
    type: InfoDividerType;
    as?: "div" | "legend";
    isLoading?: boolean;
}
export type InfoDividerThemeStyle = Record<Parts[number], ChakraSystemStyleObject>;
export declare const InfoDivider: ({ title, number, step, type, as, isLoading, ...props }: InfoDividerProps) => JSX.Element;
export {};
