import React from "react";
import type { SidebarItemProps } from "./SidebarItem";
import type { SystemStyleObject as ChakraSystemStyleObject } from "@chakra-ui/system";
import type { BaseMultiStyleConfiguration, PartsStyleInterpolation } from "@/Theme/Components/BaseMultiStyleConfiguration";
import type { Weight } from "@/Components/Foundations/PhosphorIcon";
export interface SidebarItemWithDropdownProps extends SidebarItemProps {
    header?: React.ReactElement;
    children: React.ReactElement | React.ReactElement[];
}
export declare const sidebarDropdownPartsList: Array<"header" | "wrapper" | "container" | "itemIconWeight" | "itemLabel" | "itemContainer">;
type Parts = typeof sidebarDropdownPartsList;
export type SidebarDropdownConfigProps = {
    isDisabled?: boolean;
    hasHeader?: boolean;
    isActive?: boolean;
};
export interface SidebarDropdownThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
    baseStyle: (({ hasHeader, isDisabled, isActive, }: SidebarDropdownConfigProps) => Partial<SidebarDropdownThemeStyle>) | PartsStyleInterpolation<Parts>;
}
export type SidebarDropdownThemeStyle = Record<Parts[number], ChakraSystemStyleObject> & {
    itemIconWeight: Weight;
};
export declare const SidebarItemWithDropdown: ({ label, header, icon, children, isActive, isDisabled, }: SidebarItemWithDropdownProps) => JSX.Element;
export {};
