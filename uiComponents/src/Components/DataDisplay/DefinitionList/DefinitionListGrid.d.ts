/// <reference types="react" />
import type { SimpleGridProps } from "@chakra-ui/layout";
export interface DefinitionListGridProps extends SimpleGridProps {
    columns: number;
    variant?: string;
}
export declare const DefinitionListGrid: ({ variant, ...props }: DefinitionListGridProps) => JSX.Element;
