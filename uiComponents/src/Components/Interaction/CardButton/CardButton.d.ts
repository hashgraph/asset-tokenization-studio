import type { ButtonProps as ChakraButtonProps } from "@chakra-ui/react";
import React from "react";
import type { ComponentWithAs, SystemStyleObject as ChakraSystemStyleObject } from "@chakra-ui/system";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";
export declare const cardButtonPartsList: Array<"container" | "content" | "icon" | "text" | "check" | "tooltip">;
type Parts = typeof cardButtonPartsList;
export interface CardButtonThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
}
export type CardButtonThemeStyle = Record<Parts[number], ChakraSystemStyleObject>;
export interface CardButtonProps extends ChakraButtonProps {
    icon: React.ReactElement;
    text: string;
    isSelected?: boolean;
}
export declare const CardButton: ComponentWithAs<"button", CardButtonProps>;
export declare const CardButtonIcon: ({ icon, }: Required<Pick<CardButtonProps, "icon">>) => React.ReactElement<any, string | React.JSXElementConstructor<any>>;
export {};
