import React from "react";
import type { FlexProps as ChakraFlexProps } from "@chakra-ui/react";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";
export interface HeaderProps extends ChakraFlexProps {
    leftContent?: React.ReactElement;
    rightContent?: React.ReactElement;
    contentContainerProps?: ChakraFlexProps;
}
export declare const headerPartsList: Array<"container" | "contentContainer">;
type Parts = typeof headerPartsList;
export interface HeaderThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
}
export declare const Header: ({ leftContent, rightContent, contentContainerProps, ...props }: HeaderProps) => JSX.Element;
export {};
