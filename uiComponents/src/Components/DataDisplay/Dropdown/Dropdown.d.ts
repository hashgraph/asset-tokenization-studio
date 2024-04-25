import type { MenuListProps as ChakraMenuListProps } from "@chakra-ui/react";
import React from "react";
import type { SystemStyleObject as ChakraSystemStyleObject } from "@chakra-ui/system";
import type { BaseMultiStyleConfiguration, PartsStyleInterpolation } from "@/Theme/Components/BaseMultiStyleConfiguration";
import type { Weight } from "@/Components/Foundations/PhosphorIcon";
export interface DropdownProps extends ChakraMenuListProps {
    children: React.ReactElement | React.ReactElement[];
    variant?: string;
}
export declare const dropdownPartsList: Array<"wrapper" | "container" | "itemIconWeight" | "itemLabel" | "itemContainer">;
type Parts = typeof dropdownPartsList;
export type DropdownConfigProps = {
    isDisabled?: boolean;
    isActive?: boolean;
    hasMaxHeight?: boolean;
    hasMaxWidth?: boolean;
};
export interface DropdownThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
    baseStyle: (({ isDisabled, isActive, hasMaxHeight, hasMaxWidth, }: DropdownConfigProps) => Partial<DropdownThemeStyle>) | PartsStyleInterpolation<Parts>;
}
export type DropdownThemeStyle = Record<Parts[number], ChakraSystemStyleObject> & {
    itemIconWeight: Weight;
};
export declare const Dropdown: ({ children, variant, ...props }: DropdownProps) => JSX.Element;
export {};
