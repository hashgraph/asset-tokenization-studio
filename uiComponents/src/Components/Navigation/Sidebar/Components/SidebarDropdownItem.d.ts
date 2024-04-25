/// <reference types="react" />
import type { PhosphorIconProps } from "@/Components/Foundations/PhosphorIcon";
import type { MenuItemProps as ChakraMenuItemProps } from "@chakra-ui/react";
export interface SidebarDropdownItemProps extends ChakraMenuItemProps {
    label: string;
    icon?: PhosphorIconProps["as"];
    isDisabled?: boolean;
    isActive?: boolean;
}
export declare const SidebarDropdownItem: ({ label, icon, isDisabled, isActive, ...props }: SidebarDropdownItemProps) => JSX.Element;
