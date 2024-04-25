import type { IconProps as ChakraIconProps } from "@chakra-ui/icon";
import type { IconProps as PhosphorIconProps } from "@phosphor-icons/react";
import React from "react";
import type { CustomIconProps } from "./CustomIcon";
import type { ComponentWithAs } from "@chakra-ui/system";
export type IconButtonType = React.ForwardRefExoticComponent<PhosphorIconProps & React.RefAttributes<SVGSVGElement>>;
export interface BaseIconProps extends Omit<ChakraIconProps, "name" | "css" | "weight"> {
    size?: string;
    variant?: string;
}
export type ConditionalIconProps = {
    name?: false;
    as: any;
} | {
    name: CustomIconProps["name"];
    as?: never;
};
export type IconProps = BaseIconProps & ConditionalIconProps;
export declare const Icon: ComponentWithAs<"svg", BaseIconProps & IconProps>;
