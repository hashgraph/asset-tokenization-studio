import type { IconProps as ChakraIconProps } from "@chakra-ui/icon";
import React from "react";
export type ConfigurationIcons = Record<string, {
    viewBox?: string;
    path: React.ReactElement | React.ReactElement[];
    defaultProps?: ChakraIconProps;
}>;
export declare const icons: ConfigurationIcons;
