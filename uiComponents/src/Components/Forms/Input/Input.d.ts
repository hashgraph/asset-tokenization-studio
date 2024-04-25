import type { InputProps as ChakraInputProps } from "@chakra-ui/input";
import type { SystemStyleObject as ChakraSystemStyleObject, ComponentWithAs } from "@chakra-ui/system";
import React from "react";
import type { IconButtonProps } from "@Components/Interaction/IconButton";
import type { BaseMultiStyleConfiguration, PartsStyleInterpolation } from "@/Theme/Components/BaseMultiStyleConfiguration";
export declare const inputPartsList: Array<"labelContainer" | "label" | "subLabel" | "addonLeft" | "addonRight" | "input" | "container" | "errorIcon" | "topDescription" | "bottomDescription">;
type Parts = typeof inputPartsList;
export type InputConfigProps = {
    size: string;
    variant: ChakraInputProps["variant"];
    addonLeft?: React.ReactNode;
    addonRight?: React.ReactNode;
    isInvalid?: boolean;
    isSuccess?: boolean;
    isDisabled?: boolean;
    hasLabel?: boolean;
    hasSubLabel?: boolean;
    isClearable?: boolean;
    onClear?: React.MouseEventHandler<HTMLButtonElement>;
    bottomDescription?: string | React.ReactElement;
    topDescription?: string | React.ReactElement;
};
export interface InputThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
    baseStyle: (({ addonLeft, variant, isInvalid, isDisabled, hasSubLabel, }: InputConfigProps) => Partial<InputThemeStyle>) | PartsStyleInterpolation<Parts>;
}
export interface InputProps extends ChakraInputProps {
    addonLeft?: React.ReactElement;
    addonRight?: React.ReactElement;
    size?: string;
    label?: string | React.ReactElement;
    subLabel?: string | React.ReactElement;
    showRequired?: boolean;
    isSuccess?: boolean;
    isClearable?: boolean;
    onClear?: React.MouseEventHandler<HTMLButtonElement>;
    bottomDescription?: string | React.ReactElement;
    topDescription?: string | React.ReactElement;
}
export interface InputIconButtonProps extends IconButtonProps {
    children?: React.ReactElement;
    icon: React.ReactElement;
}
export type InputThemeStyle = Record<Parts[number], ChakraSystemStyleObject> & {
    errorIcon: React.FunctionComponent;
    validIcon: React.FunctionComponent;
    clearIconButton: React.FunctionComponent;
};
export declare const defaultInputSize: {
    base: string;
    lg: string;
};
export declare const Input: ComponentWithAs<"input", InputProps>;
export declare const InputIcon: ({ icon }: {
    icon: React.ReactElement;
}) => JSX.Element;
export declare const InputIconButton: ({ icon, ...props }: InputIconButtonProps) => JSX.Element;
export {};
