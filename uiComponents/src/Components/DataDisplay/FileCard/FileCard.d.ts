/// <reference types="react" />
import type { BoxProps as ChakraBoxProps } from "@chakra-ui/react";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";
import type { SystemStyleObject as ChakraSystemStyleObject } from "@chakra-ui/system";
export declare const fileCardPartsList: Array<"container" | "name" | "size" | "closeIcon">;
type Parts = typeof fileCardPartsList;
export type FileCardConfigProps = {
    isInvalid?: boolean;
};
export type FileCardThemeStyle = Record<Parts[number], ChakraSystemStyleObject>;
export interface FileCardThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
}
export interface FileCardProps extends ChakraBoxProps {
    file: File;
    isInvalid?: boolean;
    isLoading?: boolean;
    errorMsg?: string;
    onRemove?: () => void;
}
export declare const FileCard: ({ file, isInvalid, isLoading, errorMsg, onRemove, sx, ...props }: FileCardProps) => JSX.Element;
export {};
