import type { PhosphorIconProps, Weight } from "@/Components/Foundations/PhosphorIcon";
import type { FlexProps as ChakraFlexProps } from "@chakra-ui/react";
import type { SystemStyleObject as ChakraSystemStyleObject, ComponentWithAs } from "@chakra-ui/system";
import type { BaseMultiStyleConfiguration, PartsStyleInterpolation } from "@/Theme/Components/BaseMultiStyleConfiguration";
export declare const sidebarPartsList: Array<"iconWeight" | "icon" | "label" | "container">;
type Parts = typeof sidebarPartsList;
export type SidebarItemConfigProps = {
    isDisabled?: boolean;
    isHovered?: boolean;
    isActive?: boolean;
};
export interface SidebarItemThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
    baseStyle: (({ isHovered, isDisabled, isActive, }: SidebarItemConfigProps) => Partial<SidebarItemThemeStyle>) | PartsStyleInterpolation<Parts>;
}
export interface SidebarItemProps extends ChakraFlexProps {
    isActive?: boolean;
    isDisabled?: boolean;
    label: string;
    icon: PhosphorIconProps["as"];
}
export type SidebarItemThemeStyle = Record<Parts[number], ChakraSystemStyleObject> & {
    iconWeight: Weight;
};
export declare const SidebarItem: ComponentWithAs<"button", SidebarItemProps>;
export {};
