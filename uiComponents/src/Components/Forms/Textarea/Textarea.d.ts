import type { SystemStyleObject as ChakraSystemStyleConfig, ComponentWithAs } from "@chakra-ui/system";
import { type TextareaProps as ChakraTextareaProps } from "@chakra-ui/textarea";
import type { BaseMultiStyleConfiguration, PartsStyleInterpolation } from "@Theme/Components/BaseMultiStyleConfiguration";
export declare const textareaPartsList: Array<"labelContainer" | "label" | "container" | "length">;
type Parts = typeof textareaPartsList;
export type TextareaConfigProps = {
    variant: TextareaProps["variant"];
    isInvalid?: boolean;
    isSuccess?: boolean;
    isDisabled?: boolean;
    hasLabel?: boolean;
};
export interface TextareaThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
    baseStyle: (({ variant, isInvalid, isDisabled, }: TextareaConfigProps) => Partial<Record<Parts[number], ChakraSystemStyleConfig>>) | PartsStyleInterpolation<Parts>;
}
export interface TextareaProps extends ChakraTextareaProps {
    isSuccess?: boolean;
    label?: string;
    showRequired?: boolean;
}
export declare const Textarea: ComponentWithAs<"textarea", TextareaProps>;
export {};
