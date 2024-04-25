/// <reference types="react" />
import type { BaseMultiStyleConfiguration } from "@Theme/Components/BaseMultiStyleConfiguration";
import type { FlexProps } from "@chakra-ui/react";
import type { TextProps } from "@/Components/Foundations/Text";
import type { IconButtonProps, IconButtonThemeConfiguration } from "@Components/Interaction/IconButton";
export declare const pageTitlePartsList: Array<"backButton" | "textTitle" | "container">;
type Parts = typeof pageTitlePartsList;
export interface PageTitleThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
    backButton?: IconButtonThemeConfiguration;
}
export interface PageTitleProps extends Omit<FlexProps, "children"> {
    title?: string;
    onGoBack?: () => void;
    backButtonProps?: Omit<IconButtonProps, "icon" | "variant">;
    titleProps?: TextProps;
    isLoading?: boolean;
}
export declare const PageTitle: ({ title, onGoBack, backButtonProps, titleProps, isLoading, }: PageTitleProps) => JSX.Element;
export {};
