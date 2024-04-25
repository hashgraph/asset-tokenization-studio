/// <reference types="react" />
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";
import type { TextProps } from "@/Components/Foundations/Text";
import type { FlexProps } from "@chakra-ui/react";
export declare const panelTitlePartsList: Array<"title" | "container">;
type Parts = typeof panelTitlePartsList;
export interface PanelTitleThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
}
export interface PanelTitleProps extends Omit<FlexProps, "children"> {
    title: string;
    titleProps?: TextProps;
}
export declare const PanelTitle: ({ title, titleProps, ...props }: PanelTitleProps) => JSX.Element;
export {};
