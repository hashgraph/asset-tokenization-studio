import type { checkboxAnatomy as ChakraCheckboxParts } from "@chakra-ui/anatomy";
import type { CheckboxProps as ChakraCheckboxProps } from "@chakra-ui/checkbox";
import React from "react";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";
import type { SystemStyleObject as ChakraSystemStyleObject, ComponentWithAs } from "@chakra-ui/system";
export declare const checkboxPartsList: Array<(typeof ChakraCheckboxParts.keys)[number] | "iconCustom">;
type Parts = typeof checkboxPartsList;
export interface CheckboxThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
    baseStyle: Partial<CheckboxThemeStyle>;
}
export interface CheckboxProps extends Omit<ChakraCheckboxProps, "colorScheme" | "iconSize" | "isIndeterminate"> {
}
type CheckboxThemeStyle = Record<Parts[number], ChakraSystemStyleObject> & {
    iconCustom: React.FunctionComponent<{
        isChecked?: boolean;
    }>;
};
export declare const Checkbox: ComponentWithAs<"input", CheckboxProps>;
export {};
