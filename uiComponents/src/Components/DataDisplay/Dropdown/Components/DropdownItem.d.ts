/// <reference types="react" />
import type { PhosphorIconProps } from "@/Components/Foundations/PhosphorIcon";
import type { MenuItemProps as ChakraMenuItemProps } from "@chakra-ui/react";
export interface DropdownItemProps extends ChakraMenuItemProps {
    label: string;
    icon?: PhosphorIconProps["as"];
    isDisabled?: boolean;
    isActive?: boolean;
}
export declare const DropdownItem: ({ label, icon, isDisabled, isActive, ...props }: DropdownItemProps) => JSX.Element;
