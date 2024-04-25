import React from "react";
import type { FlexProps, TextProps } from "@chakra-ui/react";
export type BasicDefinitionListItem = {
    title: string;
    description: string | number | React.ReactElement;
    canCopy?: boolean;
    valueToCopy?: string;
    isLoading?: boolean;
};
export interface DefinitionListItemProps extends BasicDefinitionListItem {
    listItemStyles?: FlexProps["sx"];
    listItemTitleStyles?: TextProps["sx"];
    listItemDescriptionStyles?: TextProps["sx"];
}
export declare const DefinitionListItem: ({ description, title, canCopy, listItemStyles, listItemTitleStyles, listItemDescriptionStyles, valueToCopy, isLoading, }: DefinitionListItemProps) => JSX.Element;
