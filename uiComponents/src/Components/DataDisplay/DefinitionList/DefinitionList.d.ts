/// <reference types="react" />
import type { StackProps as ChakraStackProps } from "@chakra-ui/layout";
import type { BaseMultiStyleConfiguration } from "@Theme/Components/BaseMultiStyleConfiguration";
import type { BasicDefinitionListItem } from "./DefinitionListItem";
export declare const definitionListPartsList: Array<"definitionListGrid" | "container" | "listTitle" | "listItem" | "listItemTitle" | "listItemDescription">;
type Parts = typeof definitionListPartsList;
export interface DefinitionListThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
}
export interface DefinitionStylesProps {
    columns: number;
}
export interface DefinitionListProps extends ChakraStackProps {
    title?: string;
    items: BasicDefinitionListItem[];
    variant?: string;
    isLoading?: boolean;
}
export declare const DefinitionList: ({ variant, title, items, isLoading, ...props }: DefinitionListProps) => JSX.Element;
export {};
