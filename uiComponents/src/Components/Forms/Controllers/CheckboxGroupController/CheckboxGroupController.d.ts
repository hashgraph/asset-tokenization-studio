import React from "react";
import type { Control, FieldValues, UseControllerProps } from "react-hook-form";
import type { FieldControllerProps } from "../FieldController/FieldController";
import type { RadioProps } from "@Components/Forms/Radio";
import type { CheckboxGroupProps, FlexProps as ChakraFlexProps } from "@chakra-ui/react";
import type { CheckboxProps } from "@Components/Forms/Checkbox";
export interface CheckboxGroupControllerProps<T extends FieldValues> extends Omit<CheckboxGroupProps, "children" | "onChange">, ChakraFlexProps {
    control: Control<T>;
    id: UseControllerProps<T>["name"];
    rules?: Record<string, unknown>;
    showErrors?: boolean;
    options: Array<{
        value: string;
        label: string;
    }>;
    variant?: RadioProps["variant"];
    errorMessageVariant?: FieldControllerProps["errorMessageVariant"];
    radioProps?: Omit<RadioProps, "variant">;
    defaultValue?: UseControllerProps<T>["defaultValue"];
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    checkboxProps?: CheckboxProps;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
}
export declare const CheckboxGroupController: <T extends FieldValues>({ errorMessageVariant, control, id, variant, showErrors, onChange, onBlur, defaultValue: defaultValueProp, rules, options, checkboxProps: checkboxComponentProps, ...props }: CheckboxGroupControllerProps<T>) => JSX.Element;
