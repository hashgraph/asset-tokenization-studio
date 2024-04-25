/// <reference types="react" />
import type { BaseMultiStyleConfiguration, PartsStyleInterpolation } from "@/Theme/Components/BaseMultiStyleConfiguration";
import type { progressAnatomy as ChakraProgressAnatomy } from "@chakra-ui/anatomy";
import type { ProgressProps as ChakraProgressProps } from "@chakra-ui/progress";
import type { SystemStyleObject as ChakraSystemStyleObject } from "@chakra-ui/system";
export declare const progressPartsList: Parts;
type Parts = typeof ChakraProgressAnatomy.keys;
export interface ProgressProps extends Omit<ChakraProgressProps, "colorScheme"> {
}
type ProgressThemeStyle = Record<Parts[number], ChakraSystemStyleObject>;
export interface ProgressThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
    baseStyle: (({ isIndeterminate, }: {
        isIndeterminate: boolean;
    }) => Partial<ProgressThemeStyle>) | PartsStyleInterpolation<Parts>;
}
export declare const Progress: (props: ProgressProps) => JSX.Element;
export {};
