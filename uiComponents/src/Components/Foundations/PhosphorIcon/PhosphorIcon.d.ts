/// <reference types="react" />
import type { ComponentSingleStyleConfig as ChakraComponentSingleStyleConfig } from "@chakra-ui/react";
import type { SystemStyleObject as ChakraSystemStyleObject } from "@chakra-ui/system";
import type { BaseIconProps } from "@/Components/Foundations/Icon";
export declare enum Weight {
    Thin = "thin",
    Light = "light",
    Regular = "regular",
    Bold = "bold",
    Fill = "fill",
    Duotone = "duotone"
}
export interface PhosphorIconThemeConfiguration extends ChakraComponentSingleStyleConfig {
    baseStyle?: (() => Partial<PhosphorIconThemeStyle>) | Partial<PhosphorIconThemeStyle>;
    sizes?: Record<string, Partial<PhosphorIconThemeStyle>>;
}
export interface PhosphorIconProps extends BaseIconProps {
    weight?: Weight;
    as: any;
}
type PhosphorIconThemeStyle = ChakraSystemStyleObject & {
    weight: PhosphorIconProps["weight"];
};
export declare const PhosphorIcon: ({ weight, size, variant, as, __css, ...props }: PhosphorIconProps) => JSX.Element;
export {};
