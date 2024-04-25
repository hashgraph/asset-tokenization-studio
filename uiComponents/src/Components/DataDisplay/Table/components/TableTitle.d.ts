import type { FlexProps as ChakraFlexProps } from "@chakra-ui/react";
import React from "react";
export interface TableTitleProps extends ChakraFlexProps {
    actions?: React.ReactElement;
    variant?: string;
    children: React.ReactElement | string;
}
export declare const TableTitle: ({ children, variant, actions, ...props }: TableTitleProps) => JSX.Element;
