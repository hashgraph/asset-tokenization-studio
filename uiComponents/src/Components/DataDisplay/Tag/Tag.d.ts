import React from "react";
import type { tagAnatomy as ChakraTagAnatomy } from "@chakra-ui/anatomy";
import type { TagProps as ChakraTagProps } from "@chakra-ui/tag";
import type { SystemStyleObject as ChakraSystemStyleObject, ComponentWithAs } from "@chakra-ui/system";
import type { BaseMultiStyleConfiguration, PartsStyleInterpolation } from "@/Theme/Components/BaseMultiStyleConfiguration";
export declare const tagPartsList: typeof ChakraTagAnatomy.keys;
type Parts = typeof tagPartsList;
export type TagConfigProps = {
    disabled?: boolean;
};
type TagThemeStyle = Partial<Record<Parts[number], ChakraSystemStyleObject>>;
export interface TagThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
    baseStyle?: ((props: TagConfigProps) => TagThemeStyle) | PartsStyleInterpolation<Parts>;
    sizes?: Record<string, TagThemeStyle>;
}
export interface TagProps extends Omit<ChakraTagProps, "children"> {
    label?: string;
    icon?: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
    leftIcon?: React.ReactElement;
    rightIcon?: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
    disabled?: boolean;
    isLoading?: boolean;
}
export declare const Tag: ComponentWithAs<"span", TagProps>;
export {};
