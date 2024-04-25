import type { CircularProgressProps as ChakraCircularProgressProps } from "@chakra-ui/progress";
import React from "react";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";
export declare const circularSliderPartsList: ("label" | "track")[];
type Parts = typeof circularSliderPartsList;
export interface CircularSliderThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
}
export interface CircularSliderProps extends Omit<ChakraCircularProgressProps, "children"> {
    label?: React.ReactElement | string;
    isLoading?: boolean;
}
export declare const CircularSlider: ({ label, size, isLoading, ...props }: CircularSliderProps) => JSX.Element;
export {};
