import type { InputProps as ChakraInputProps } from "@chakra-ui/react";
import type { SystemStyleObject as ChakraSystemStyleObject, ComponentWithAs } from "@chakra-ui/system";
import type { BaseMultiStyleConfiguration, PartsStyleInterpolation } from "@/Theme/Components/BaseMultiStyleConfiguration";
export declare const fileInputPartsList: Array<"container" | "icon" | "label" | "description" | "input">;
type Parts = typeof fileInputPartsList;
export type FileInputConfigProps = {
    isDragging?: boolean;
    isInvalid?: boolean;
    isDisabled?: boolean;
};
export interface FileInputThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
    baseStyle: (({ isInvalid, isDisabled, isDragging, }: FileInputConfigProps) => Partial<FileInputThemeStyle>) | PartsStyleInterpolation<Parts>;
}
export type FileInputThemeStyle = Record<Parts[number], ChakraSystemStyleObject>;
export interface FileInputProps extends Omit<ChakraInputProps, "onChange"> {
    label?: string;
    description?: string;
    isInvalid?: boolean;
    isDisabled?: boolean;
    acceptedFileTypes?: object;
    onChange?: (file: File) => void;
}
export declare const FileInput: ComponentWithAs<"input", FileInputProps>;
export {};
